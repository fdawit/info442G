//Decides which benefit programs fit the user's questionnaire answers

import ZIP_CENTERS from '../data/zipCenters.json';
import { isFiveDigits, milesBetween } from '../services/foodResources';

const ANSWER_TAGS = {
    'Halal': 'halal',
    'Vegetarian': 'vegetarian',
    'Baby formula or baby food': 'baby_food',
    'Fresh produce': 'produce',
    'Pregnant or had a baby in the last year': 'pregnancy',
    'Child under 5': 'child_under5',
    'Child in school (K-12)': 'school_child',
    'Age 60 or older': 'senior',
};

const RULES = {
  basic_food: { incomeRanges: ['A', 'B', 'C'], hideIfOnSnap: true },
  fap: { incomeRanges: ['A', 'B', 'C'], hideIfOnSnap: true },
  wic: { incomeRanges: ['A', 'B'], snapQualifies: true, needsOneOf: ['pregnancy', 'child_under5'] },
  sun_bucks: { incomeRanges: ['A', 'B'], snapQualifies: true, needsOneOf: ['school_child'] },
  sfmnp: { incomeRanges: ['A', 'B'], needsOneOf: ['senior'] },
  meals_on_wheels: { needsOneOf: ['senior'] },
  market_match: { needsSnap: true },
  produce_match: { needsSnap: true },
  fresh_bucks: { incomeRanges: ['A', 'B', 'C'], snapQualifies: true },
};

export function answerTags(answers) {
    const picked = [...(answers[4] || []), ...(answers[7] || [])];
    const tags = [];
    for (const answer of picked) {
        if (ANSWER_TAGS[answer]) {
            tags.push(ANSWER_TAGS[answer]);
        }
    }
    return tags;
}

export function isEligible(program, answers) {
    const rule = RULES[program.id];
    if (!rule) {
        return true;
    }

    const onSnap = answers[8] === 'Yes';
    if (rule.hideIfOnSnap && onSnap) {
        return false;
    }
    if (rule.needsSnap && answers[8] === 'No') {
        return false;
    }

    if (rule.needsOneOf && answers[7]) {
        const tags = answerTags(answers);
        if (!rule.needsOneOf.some((tag) => tags.includes(tag))) {
            return false;
        }
    }

    const income = answers[6];
    if (rule.incomeRanges && income && !rule.incomeRanges.includes(income)) {
        if (!(rule.snapQualifies && onSnap)) {
            return false;
        }
    }
    return true;
}

export function startingZip(answers) {
    const q2 = answers[2];
    if (q2 && q2.zip && isFiveDigits(q2.zip.trim())) {
        return q2.zip.trim();
    }
    if (q2 && q2.location) {
        let nearest = '';
        let nearestMiles = Infinity;
        for (const zip of Object.keys(ZIP_CENTERS)) {
            const miles = milesBetween(q2.location, ZIP_CENTERS[zip]);
            if (miles < nearestMiles) {
                nearest = zip;
                nearestMiles = miles;
            }
        }
        return nearest;
    }
    return '';
}
