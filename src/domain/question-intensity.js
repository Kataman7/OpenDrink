import { UnsupportedIntensityError } from './errors.js';

export class QuestionIntensity {
  static SOFT = 'soft';
  static HOT = 'hot';
  static MIXED = 'mixed';

  static toCategoryId(intensity) {
    if (intensity === QuestionIntensity.SOFT) return 0;
    if (intensity === QuestionIntensity.HOT) return 1;
    if (intensity === QuestionIntensity.MIXED) return null;
    throw new UnsupportedIntensityError(intensity);
  }
}
