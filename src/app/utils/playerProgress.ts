export const getXpRequiredForNextLevel = (currentLevel: number): number => {
  const safeLevel = Math.max(1, currentLevel);
  return 300 + (safeLevel - 1) * 150;
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
