//The eight questions of the BEC will be housed here

export const FOOD_TODAY = 'Food today or this week';
export const MONTHLY_HELP = 'Help paying for groceries every month';
export const BOTH = 'Both';

export const QUESTIONS = {
  1: {
    number: 1,
    text: 'What kind of help are you looking for?',
    kind: 'single',
    answers: [FOOD_TODAY, MONTHLY_HELP, BOTH],
  },
  2: {
    number: 2,
    text: 'Where should we look?',
    kind: 'location',
  },
  3: {
    number: 3,
    text: 'How will you get there?',
    kind: 'single',
    answers: ['Walking', 'Bus and/or Light rail', 'Car', 'I need delivery'],
  },
  4: {
    number: 4,
    text: 'Any food needs? (choose any)',
    kind: 'multiple',
    answers: ['Halal', 'Vegetarian', 'Baby formula or baby food', 'Fresh produce', 'None'],
    noneAnswer: 'None',
  },
  5: {
    number: 5,
    text: 'How many people live with you and share food resources, including you?',
    kind: 'single',
    answers: ['1', '2', '3', '4', '5', '6', '7', '8 or more'],
  },
  6: {
    number: 6,
    text: 'What is the closest to your household monthly income before taxes?',
    kind: 'income',
  },
  7: {
    number: 7,
    text: 'Does anybody in your home fit any of these? (choose any)',
    kind: 'multiple',
    answers: [
      'Pregnant or had a baby in the last year',
      'Child under 5',
      'Child in school (K-12)',
      'Age 60 or older',
      'None of these',
    ],
    noneAnswer: 'None of these',
  },
  8: {
    number: 8,
    text: 'Does your household already get Basic Food (SNAP/EBT)?',
    kind: 'single',
    answers: ['Yes', 'No', 'Not sure'],
  },
};
