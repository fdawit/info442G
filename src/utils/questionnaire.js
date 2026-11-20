//Rules for moving trhough the BEC

import { FOOD_TODAY, MONTHLY_HELP } from '../data/questions';

export function getPath(q1Answer, incomeAvailable = true) {
  let path = [1, 2, 3, 4, 5, 6, 7, 8];
  if (q1Answer === FOOD_TODAY) {
    path = [1, 2, 3, 4];
  }
  if (q1Answer === MONTHLY_HELP) {
    path = [1, 5, 6, 7, 8];
  }
  if (!incomeAvailable) {
    path = path.filter((number) => number !== 6);
  }
  return path;
}

export function keepAnswersOnPath(answers, path) {
  const kept = {};
  for (const number of path) {
    if (answers[number] !== undefined) {
      kept[number] = answers[number];
    }
  }
  return kept;
}

export function hasAnswer(value) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return value !== undefined && value !== null && value !== '';
}
