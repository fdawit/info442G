// SHows one question and its answers

export default function ChoiceQuestion({ question, options, value, onChange }) {
    const multiple = question.kind === 'multiple';
    const picked = value || [];

    function handleCheck(answer, checked) {
        if (!checked) {
            onChange(picked.filter((item) => item !== answer));
            return;
        }
        if (answer === question.noneAnswer) {
            onChange([answer]);
            return;
        }
        const withoutNone = picked.filter((item) => item !== question.noneAnswer);
        onChange([...withoutNone, answer]);
    }

    return (
        <fieldset className="choice-question">
            <legend>{question.text}</legend>
            {options.map((option) => (
                <label className="question-option" key={option.value}>
                <input
                    type={multiple ? 'checkbox' : 'radio'}
                    name={'question-' + question.number}
                    value={option.value}
                    checked={multiple ? picked.includes(option.value) : value === option.value}
                    onChange={(event) => {
                        if (multiple) {
                            handleCheck(option.value, event.target.checked);
                        } else {
                            onChange(option.value);
                        }
                    }}/>
                {option.label}
                </label>
            ))}
        </fieldset>
    );
}


