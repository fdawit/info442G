//Works out the four income ranges from the household size info gathered in Q5

import { POVERTY_GUIDELINES } from '../data/povertyGuidelines';

export function hasIncomeFigures() {
  return Object.keys(POVERTY_GUIDELINES).length === 8;
}

function householdSize(q5Answer) {
  if (q5Answer === '8 or more') {
    return 8;
  }
  return Number(q5Answer);
}

export function monthlyLimit(size, percent) {
  const monthly = (POVERTY_GUIDELINES[size] / 12) * (percent / 100);
  return Math.round(monthly / 10) * 10;
}

function dollars(amount) {
  return '$' + amount.toLocaleString('en-US');
}

//A = under 130%, B = 130% to 185%, C = 185% to 200%, D = over 200%
export function getIncomeOptions(q5Answer) {
  const size = householdSize(q5Answer);
  if (!POVERTY_GUIDELINES[size]) {
    return [];
  }
  const at130 = monthlyLimit(size, 130);
  const at185 = monthlyLimit(size, 185);
  const at200 = monthlyLimit(size, 200);
  return [
    { value: 'A', label: 'Under ' + dollars(at130) + ' a month' },
    { value: 'B', label: dollars(at130) + ' to ' + dollars(at185) + ' a month' },
    { value: 'C', label: dollars(at185) + ' to ' + dollars(at200) + ' a month' },
    { value: 'D', label: 'Over ' + dollars(at200) + ' a month' },
  ];
}
