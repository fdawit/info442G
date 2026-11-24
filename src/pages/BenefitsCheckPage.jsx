// The benefits eleigbaility check page

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { QUESTIONS } from '../data/questions';
import { getPath, keepAnswersOnPath, hasAnswer } from '../utils/questionnaire';
import { hasIncomeFigures, getIncomeOptions } from '../utils/incomeRanges';
import { saveAnswers, clearSavedAnswers, getRememberedZip } from '../utils/storage';
import { isFiveDigits } from '../services/foodResources';
import ChoiceQuestion from '../components/ChoiceQuestion';
import LocationQuestion from '../components/LocationQuestion';
import './BenefitsCheckPage.css';

export default function BenefitsCheckPage() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(1);
  const [zipMessage, setZipMessage] = useState('');

  useEffect(() => {
    clearSavedAnswers();
  }, []);

  const incomeAvailable = hasIncomeFigures();
  const path = getPath(answers[1], incomeAvailable);
  const position = path.indexOf(current);
  const isLast = position === path.length - 1;
  const question = QUESTIONS[current];
  const answered = hasAnswer(answers[current]);

  function saveAnswer(number, value) {
    let newAnswers = { ...answers, [number]: value };
    if (number === 1) {
      newAnswers = keepAnswersOnPath(newAnswers, getPath(value, incomeAvailable));
    }
    if (number === 5) {
      delete newAnswers[6];
    }
    setAnswers(newAnswers);
  }

  function goTo(number) {
    const rememberedZip = getRememberedZip();
    if (number === 2 && answers[2] === undefined && rememberedZip) {
      setAnswers({ ...answers, 2: { zip: rememberedZip } });
    }
    setZipMessage('');
    setCurrent(number);
  }

  function handleNext() {
    const q2 = answers[2];
    if (current === 2 && q2.zip !== undefined && !isFiveDigits(q2.zip.trim())) {
      setZipMessage('Please enter 5-digit zip code.');
      return;
    }
    goTo(path[position + 1]);
  }

  function handlePrevious() {
    goTo(path[position - 1]);
  }

  function handleSkip() {
    setAnswers({ ...answers, 2: 'skip' });
    setCurrent(path[position + 1]);
  }

  function handleSubmit() {
    saveAnswers({ answers: answers, incomeAvailable: incomeAvailable });
    navigate('/benefits-results');
  }

  let options = [];
  if (question.kind === 'income') {
    options = getIncomeOptions(answers[5]);
  } else if (question.answers) {
    options = question.answers.map((answer) => ({ value: answer, label: answer }));
  }



  return (
    <main className="benefits-check-page">
      <h1>Benefits Eligibility Check</h1>
      <p>Question {position + 1} of {path.length}</p>
      <progress value={position + 1} max={path.length}/>
      <div className="question-panel">
        {question.kind === 'location' ? (
          <LocationQuestion
            question={question}
            value={answers[2]}
            message={zipMessage}
            onChange={(value) => saveAnswer(2, value)}
            onMessage={setZipMessage}
            onSkip={handleSkip}
          />
        ) : (
          <ChoiceQuestion
            question={question}
            options={options}
            value={answers[current]}
            onChange={(value) => saveAnswer(current, value)}/>
        )}
      </div>

      <div className="question-buttons">
        <button type="button" onClick={handlePrevious} disabled={position === 0}>Previous</button>
        {isLast ? (
          <button type="button" onClick={handleSubmit} disabled={!answered}>Submit</button>
        ) : (
          <button type="button" onClick={handleNext} disabled={!answered}>Next</button>
        )}
      </div>
    </main>
  );
}
