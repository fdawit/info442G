//The Benefits Eligibility Results List page
//Currently a placeholder that will get replaced in issue 18

import { loadSavedAnswers } from '../utils/storage';

export default function BenefitsResultsPage() {
    const saved = loadSavedAnswers();

    return (
        <main>
            <h1>Benefits Eligibility Results</h1>
            <p>The benefits results list will come with issue #18.</p>
            <pre>{saved ? JSON.stringify(saved, null, 2) : 'No saved answers.'}</pre>
        </main>
  );
}
