const K = 32;
const ratings = new Map<string, number>();
const stats = new Map<string, { wins: number; losses: number; gamesPlayed: number; name: string }>();

export function getOrInitPlayer(id: string, name: string = "Unknown") {
  if (!ratings.has(id)) {
    ratings.set(id, 1200);
    stats.set(id, { wins: 0, losses: 0, gamesPlayed: 0, name });
  }
  return { rating: ratings.get(id)!, ...stats.get(id)! };
}

export function getRating(id: string) { return ratings.get(id) ?? 1200; }

function expected(rA: number, rB: number) {
  return 1 / (1 + Math.pow(10, (rB - rA) / 400));
}

export function updateRatings(playerIds: string[], winnerId: string) {
  const n = playerIds.length;
  const cur = playerIds.map(id => getRating(id));
  const next = new Map<string, number>();
  for (let i = 0; i < n; i++) {
    const id = playerIds[i];
    const isW = id === winnerId;
    let d = 0;
    for (let j = 0; j < n; j++) {
      if (i === j) continue;
      d += K * ((isW ? 1 : 0) - expected(cur[i], cur[j]));
    }
    next.set(id, Math.max(800, Math.round(cur[i] + d / (n - 1))));
  }
  for (const [id, r] of next) {
    ratings.set(id, r);
    const s = stats.get(id) ?? { wins: 0, losses: 0, gamesPlayed: 0, name: "Unknown" };
    s.gamesPlayed++;
    if (id === winnerId) s.wins++; else s.losses++;
    stats.set(id, s);
  }
}

export function getLeaderboard() {
  return Array.from(ratings.entries()).map(([id, rating]) => {
    const s = stats.get(id) ?? { wins: 0, losses: 0, gamesPlayed: 0, name: "Unknown" };
    return {
      id, rating, name: s.name,
      wins: s.wins, losses: s.losses, gamesPlayed: s.gamesPlayed,
      winRate: s.gamesPlayed > 0 ? Math.round((s.wins / s.gamesPlayed) * 100) : 0,
    };
  }).sort((a, b) => b.rating - a.rating);
}

/** Wipes all ratings and stats — used by the reset endpoint */
export function resetLeaderboard() {
  ratings.clear();
  stats.clear();
}
