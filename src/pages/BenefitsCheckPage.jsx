// The benefits eleigbaility check page

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { QUESTIONS } from '../data/questions';
import { getPath, keepAnswersOnPath, hasAnswer } from '../utils/questionnaire';
import ChoiceQuestion from '../components/ChoiceQuestion';
import './BenefitsCheckPage.css';

const TEMPORARY_INCOME_OPTIONS = [ //Will be changed in next issue 17
  { value: 'A', label: 'Income range A' },
  { value: 'B', label: 'Income range B' },
  { value: 'C', label: 'Income range C' },
  { value: 'D', label: 'Income range D' },
];

export default function BenefitsCheckPage() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(1);
  const path = getPath(answers[1]);
  const position = path.indexOf(current);
  const isLast = position === path.length - 1;
  const question = QUESTIONS[current];
  const answered = hasAnswer(answers[current]);

  function saveAnswer(number, value) {
    let newAnswers = { ...answers, [number]: value };
    if (number === 1) {
      newAnswers = keepAnswersOnPath(newAnswers, getPath(value));
    }
    if (number === 5) {
      delete newAnswers[6];
    }
    setAnswers(newAnswers);
  }

  function handleNext() {
    setCurrent(path[position + 1]);
  }

  function handlePrevious() {
    setCurrent(path[position - 1]);
  }

  function handleSkip() { //Only here for this issue, #17 replaces this
    setAnswers({ ...answers, 2: 'skip' });
    setCurrent(path[position + 1]);
  }

  function handleSubmit() {
    navigate('/benefits-results');
  }

  let options = TEMPORARY_INCOME_OPTIONS;
  if (question.answers) {
    options = question.answers.map((answer) => ({ value: answer, label: answer }));
  }



  return (
    <main>
      <h1>Benefits Eligibility Check</h1>
      <p>Question {position + 1} of {path.length}</p>
      <progress value={position + 1} max={path.length}/>
      {question.kind === 'location' ? (
        <fieldset className="choice-question">
          <legend>{question.text}</legend>
          <p>The ZIP code box and Use my location button will come up in issue #17.</p>
          <button type="button" onClick={handleSkip}>Skip</button>
        </fieldset>
      ) : (
        <ChoiceQuestion
          question={question}
          options={options}
          value={answers[current]}
          onChange={(value) => saveAnswer(current, value)}/>
      )}

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
