export const randomBoolean = () => Math.random() > 0.5;

export const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const shuffleArray = array => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
