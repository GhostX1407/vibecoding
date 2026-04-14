import { Board } from "./match.types";

const DIRS = [[1, 0], [0, 1], [1, 1], [1, -1]];
const WIN_LENGTH = 5;

export function checkWin(
  board: Board,
  x: number,
  y: number,
  symbol: string
): { won: boolean; cells: string[] } {
  const key = (cx: number, cy: number) => `${cx},${cy}`;
  for (const [dx, dy] of DIRS) {
    const cells: string[] = [key(x, y)];
    let nx = x + dx, ny = y + dy;
    while (board[key(nx, ny)] === symbol) { cells.push(key(nx, ny)); nx += dx; ny += dy; }
    nx = x - dx; ny = y - dy;
    while (board[key(nx, ny)] === symbol) { cells.push(key(nx, ny)); nx -= dx; ny -= dy; }
    if (cells.length >= WIN_LENGTH) return { won: true, cells };
  }
  return { won: false, cells: [] };
}
