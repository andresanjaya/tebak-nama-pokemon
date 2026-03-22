export const getXpRequiredForNextLevel = (currentLevel: number): number => {
  const safeLevel = Math.max(1, currentLevel);

  // Fast early game (1-5), smooth mid game (6-15), slightly grindy high levels (16+).
  if (safeLevel <= 5) {
    return 110 + (safeLevel - 1) * 25;
  }

  if (safeLevel <= 15) {
    return 210 + (safeLevel - 6) * 40;
  }

  return 610 + (safeLevel - 16) * 55;
};

interface ApplyXpGainResult {
  newLevel: number;
  newXp: number;
  levelUps: number;
}

export const applyXpGain = (
  currentLevel: number,
  currentXp: number,
  gainedXp: number
): ApplyXpGainResult => {
  let level = Math.max(1, currentLevel);
  let xp = Math.max(0, currentXp) + Math.max(0, gainedXp);
  let levelUps = 0;

  while (xp >= getXpRequiredForNextLevel(level)) {
    xp -= getXpRequiredForNextLevel(level);
    level += 1;
    levelUps += 1;
  }

  return {
    newLevel: level,
    newXp: xp,
    levelUps,
  };
};
