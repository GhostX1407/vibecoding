import { useRef, useEffect, useCallback } from "react";
import { Match, SYMBOL_HEX, PlayerSymbol } from "../types";
import "./InfiniteBoard.css";

const CELL = 54;
const MIN_SCALE = 0.05;
const MAX_SCALE = 3.0;

// Warm earthy board colors
const BG_COLOR    = "#f5f0e8";
const LINE_MINOR  = "#e0d8cc";
const LINE_MAJOR  = "#cdc4b4";
const LINE_ORIGIN = "#b8ae9c";

interface Props { match: Match; mySymbol: string | null; onMove: (x: number, y: number) => void; }
interface S {
  ox: number; oy: number; scale: number;
  drag: boolean; dsx: number; dsy: number; dox: number; doy: number;
  ltD: number; hx: number | null; hy: number | null;
  wFlash: boolean; wFlashT: number; raf: number;
}

export default function InfiniteBoard({ match, mySymbol, onMove }: Props) {
  const wrapRef   = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const s         = useRef<S>({ ox: 0, oy: 0, scale: 1, drag: false, dsx: 0, dsy: 0, dox: 0, doy: 0, ltD: 0, hx: null, hy: null, wFlash: true, wFlashT: 0, raf: 0 });
  const mRef      = useRef(match);
  const msRef     = useRef(mySymbol);
  const turnRef   = useRef(false);

  useEffect(() => { mRef.current = match; }, [match]);
  useEffect(() => { msRef.current = mySymbol; }, [mySymbol]);

  const isMyTurn = !match.isFinished && match.players[match.currentTurn]?.symbol === mySymbol;
  useEffect(() => { turnRef.current = isMyTurn; }, [isMyTurn]);

  const toCell = (sx: number, sy: number) => {
    const { ox, oy, scale } = s.current; const cs = CELL * scale;
    return { x: Math.floor((sx - ox) / cs), y: Math.floor((sy - oy) / cs) };
  };

  // ── KEY FIX: draw() ALWAYS renders all board pieces unconditionally ──
  const draw = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const { ox, oy, scale, hx, hy, wFlash } = s.current;
    const m = mRef.current;
    const W = canvas.width; const H = canvas.height;
    const cs = CELL * scale;

    // Background
    ctx.fillStyle = BG_COLOR; ctx.fillRect(0, 0, W, H);

    const c0 = Math.floor(-ox / cs) - 1; const c1 = Math.ceil((W - ox) / cs) + 1;
    const r0 = Math.floor(-oy / cs) - 1; const r1 = Math.ceil((H - oy) / cs) + 1;

    // Minor grid lines
    ctx.beginPath();
    for (let c = c0; c <= c1; c++) { const x = ox + c * cs; ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let r = r0; r <= r1; r++) { const y = oy + r * cs; ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.strokeStyle = LINE_MINOR; ctx.lineWidth = 0.8; ctx.stroke();

    // Major grid lines every 5
    ctx.beginPath();
    for (let c = c0; c <= c1; c++) {
      if (c % 5 === 0) { const x = ox + c * cs; ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    }
    for (let r = r0; r <= r1; r++) {
      if (r % 5 === 0) { const y = oy + r * cs; ctx.moveTo(0, y); ctx.lineTo(W, y); }
    }
    ctx.strokeStyle = LINE_MAJOR; ctx.lineWidth = 1; ctx.stroke();

    // Origin cross
    ctx.beginPath();
    ctx.moveTo(ox, 0); ctx.lineTo(ox, H);
    ctx.moveTo(0, oy); ctx.lineTo(W, oy);
    ctx.strokeStyle = LINE_ORIGIN; ctx.lineWidth = 1.5; ctx.stroke();

    // Hover cell highlight (only when it's my turn)
    if (hx !== null && hy !== null && turnRef.current && !m.isFinished) {
      const px = ox + hx * cs; const py = oy + hy * cs;
      if (px + cs > 0 && px < W && py + cs > 0 && py < H) {
        ctx.fillStyle = "rgba(232,93,58,0.08)";
        ctx.fillRect(px + 1, py + 1, cs - 2, cs - 2);
        ctx.strokeStyle = "rgba(232,93,58,0.35)";
        ctx.lineWidth = 1.5; ctx.strokeRect(px + 1, py + 1, cs - 2, cs - 2);
      }
    }

    // ── Draw ALL pieces — always, for every player ──
    // This is the KEY FIX for the "marks disappear between turns" bug.
    // The board state comes from the server via match_updated events and is
    // stored in Zustand. We simply iterate match.board and draw everything.
    const winSet = new Set(m.winningCells);

    for (const [key, sym] of Object.entries(m.board)) {
      const [cx, cy] = key.split(",").map(Number);
      const px = ox + cx * cs; const py = oy + cy * cs;
      if (px + cs < -cs || px > W + cs || py + cs < -cs || py > H + cs) continue;

      const hex = SYMBOL_HEX[sym as PlayerSymbol] ?? "#888";
      const isWin = winSet.has(key);

      // Winning cell background
      if (isWin && wFlash) {
        ctx.fillStyle = hex + "28";
        ctx.fillRect(px + 1, py + 1, cs - 2, cs - 2);
      }

      // Symbol text
      const fs = Math.max(8, Math.min(32, 24 * scale));
      ctx.font = `700 ${fs}px 'DM Sans', system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (cs > 18) {
        ctx.shadowColor = hex;
        ctx.shadowBlur = isWin ? 12 : 5;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = isWin
        ? (wFlash ? hex : hex + "88")
        : hex;
      ctx.fillText(sym, px + cs / 2, py + cs / 2);
      ctx.shadowBlur = 0;
    }

    // Coordinate labels at very high zoom
    if (cs > 80) {
      ctx.font = `9px 'DM Mono', monospace`;
      ctx.fillStyle = "rgba(74,80,104,0.3)";
      ctx.textAlign = "left"; ctx.textBaseline = "top";
      for (let c = c0; c <= c1; c++) {
        for (let r = r0; r <= r1; r++) {
          ctx.fillText(`${c},${r}`, ox + c * cs + 4, oy + r * cs + 4);
        }
      }
    }
  }, []);

  // Animation loop
  useEffect(() => {
    let alive = true;
    const loop = () => {
      if (!alive) return;
      const now = Date.now();
      if (now - s.current.wFlashT > 520) {
        s.current.wFlash = !s.current.wFlash;
        s.current.wFlashT = now;
      }
      draw();
      s.current.raf = requestAnimationFrame(loop);
    };
    s.current.raf = requestAnimationFrame(loop);
    return () => { alive = false; cancelAnimationFrame(s.current.raf); };
  }, [draw]);

  // Resize observer
  useEffect(() => {
    const wrap = wrapRef.current; const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width = wrap.clientWidth;
      canvas.height = wrap.clientHeight;
    });
    ro.observe(wrap);
    canvas.width = wrap.clientWidth;
    canvas.height = wrap.clientHeight;
    return () => ro.disconnect();
  }, []);

  // Center view when match starts
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    s.current.scale = 1;
    s.current.ox = canvas.width / 2 - CELL / 2;
    s.current.oy = canvas.height / 2 - CELL / 2;
  }, [match.id]);

  // ── Mouse events ──
  const onMD = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const st = s.current;
    st.drag = true; st.dsx = e.clientX; st.dsy = e.clientY; st.dox = st.ox; st.doy = st.oy;
  };
  const onMM = (e: React.MouseEvent) => {
    const st = s.current;
    const r = canvasRef.current!.getBoundingClientRect();
    if (st.drag) {
      st.ox = st.dox + (e.clientX - st.dsx);
      st.oy = st.doy + (e.clientY - st.dsy);
      st.hx = null; st.hy = null;
    } else {
      const c = toCell(e.clientX - r.left, e.clientY - r.top);
      st.hx = c.x; st.hy = c.y;
    }
  };
  const onMU = (e: React.MouseEvent) => {
    const st = s.current;
    const moved = Math.abs(e.clientX - st.dsx) > 4 || Math.abs(e.clientY - st.dsy) > 4;
    st.drag = false;
    if (!moved && turnRef.current && !mRef.current.isFinished) {
      const r = canvasRef.current!.getBoundingClientRect();
      const { x, y } = toCell(e.clientX - r.left, e.clientY - r.top);
      if (!mRef.current.board[`${x},${y}`]) onMove(x, y);
    }
  };
  const onML = () => { const st = s.current; st.hx = null; st.hy = null; st.drag = false; };
  const onW = (e: React.WheelEvent) => {
    e.preventDefault();
    const st = s.current; const r = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - r.left; const my = e.clientY - r.top;
    const f = e.deltaY > 0 ? 0.88 : 1.13;
    const ns = Math.min(MAX_SCALE, Math.max(MIN_SCALE, st.scale * f));
    const ratio = ns / st.scale;
    st.ox = mx - ratio * (mx - st.ox);
    st.oy = my - ratio * (my - st.oy);
    st.scale = ns;
  };

  // ── Touch events ──
  const onTS = (e: React.TouchEvent) => {
    const st = s.current;
    if (e.touches.length === 1) {
      st.drag = true; st.dsx = e.touches[0].clientX; st.dsy = e.touches[0].clientY;
      st.dox = st.ox; st.doy = st.oy;
    } else if (e.touches.length === 2) {
      st.drag = false;
      st.ltD = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    }
  };
  const onTM = (e: React.TouchEvent) => {
    e.preventDefault(); const st = s.current;
    const r = canvasRef.current!.getBoundingClientRect();
    if (e.touches.length === 1 && st.drag) {
      st.ox = st.dox + (e.touches[0].clientX - st.dsx);
      st.oy = st.doy + (e.touches[0].clientY - st.dsy);
    } else if (e.touches.length === 2) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
      const my = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
      if (st.ltD > 0) {
        const ratio = d / st.ltD;
        const ns = Math.min(MAX_SCALE, Math.max(MIN_SCALE, st.scale * ratio));
        const sr = ns / st.scale;
        st.ox = mx - sr * (mx - st.ox); st.oy = my - sr * (my - st.oy); st.scale = ns;
      }
      st.ltD = d;
    }
  };
  const onTE = (e: React.TouchEvent) => {
    const st = s.current;
    if (e.changedTouches.length === 1 && st.drag && turnRef.current && !mRef.current.isFinished) {
      const moved = Math.abs(e.changedTouches[0].clientX - st.dsx) > 8 || Math.abs(e.changedTouches[0].clientY - st.dsy) > 8;
      if (!moved) {
        const r = canvasRef.current!.getBoundingClientRect();
        const { x, y } = toCell(e.changedTouches[0].clientX - r.left, e.changedTouches[0].clientY - r.top);
        if (!mRef.current.board[`${x},${y}`]) onMove(x, y);
      }
    }
    st.drag = false; st.ltD = 0;
  };

  // Zoom helpers
  const zoomBy = (f: number) => {
    const st = s.current; const c = canvasRef.current!;
    const mx = c.width / 2; const my = c.height / 2;
    const ns = Math.min(MAX_SCALE, Math.max(MIN_SCALE, st.scale * f));
    const ratio = ns / st.scale;
    st.ox = mx - ratio * (mx - st.ox); st.oy = my - ratio * (my - st.oy); st.scale = ns;
  };
  const resetView = () => {
    const st = s.current; const c = canvasRef.current!;
    st.scale = 1; st.ox = c.width / 2 - CELL / 2; st.oy = c.height / 2 - CELL / 2;
  };
  const center = () => {
    const keys = Object.keys(mRef.current.board);
    if (!keys.length) { resetView(); return; }
    const st = s.current; const c = canvasRef.current!;
    let sx = 0; let sy = 0;
    keys.forEach(k => { const [x, y] = k.split(",").map(Number); sx += x; sy += y; });
    const cx = sx / keys.length; const cy = sy / keys.length;
    const cs = CELL * st.scale;
    st.ox = c.width / 2 - cx * cs - cs / 2;
    st.oy = c.height / 2 - cy * cs - cs / 2;
  };

  return (
    <div ref={wrapRef} className="board-wrap">
      <canvas
        ref={canvasRef}
        className={`board-canvas ${isMyTurn ? "board-canvas--my" : ""}`}
        onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU}
        onMouseLeave={onML} onWheel={onW}
        onTouchStart={onTS} onTouchMove={onTM} onTouchEnd={onTE}
      />

      {/* Zoom controls */}
      <div className="board-ctrl">
        <button className="bctrl" onClick={() => zoomBy(1.3)} title="Zoom in">+</button>
        <button className="bctrl" onClick={resetView} title="Reset view">⊙</button>
        <button className="bctrl" onClick={center} title="Center on game">◎</button>
        <button className="bctrl" onClick={() => zoomBy(0.77)} title="Zoom out">−</button>
      </div>

      {/* Move counter */}
      <div className="board-info">{match.moveHistory.length} moves</div>
    </div>
  );
}
