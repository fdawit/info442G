// Shown when address does not match any page

import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <main>
      <h1>Page not found!</h1>
      <p>We could not find that page.</p>
      <p><Link to="/">Go to the Home page</Link></p>
    </main>
  );
}
