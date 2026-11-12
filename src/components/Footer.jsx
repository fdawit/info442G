// The footer at the bottom of every page

import { Link } from 'react-router';
import './Footer.css';

const CONTACT_PHONE = '206-555-5555';
const CONTACT_EMAIL = 'fdawit@uw.edu';

const USEFUL_LINKS = [
  {label: 'City of Seattle food resources map', url: 'https://maps.seattle.gov/humanservices/foodresources', },
  { label: 'SNAP (food benefits) from the USDA', url: 'https://www.fns.usda.gov/snap/supplemental-nutrition-assistance-program', },
  { label: 'Seattle Office of Housing', url: 'https://www.seattle.gov/housing', },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-sections">
        <section>
          <h2>Contact Info</h2>
          <ul>
            <li>
              Phone: <a href={'tel:' + CONTACT_PHONE}>{CONTACT_PHONE}</a>
            </li>
            <li>
              Email: <a href={'mailto:' + CONTACT_EMAIL}>{CONTACT_EMAIL}</a>
            </li>
          </ul>
        </section>

        <section>
          <h2>About Us</h2>
          <p>
            Neighborly helps people in Seattle and Lorem ipsum dolor sit amet consectetur, adipisicing elit. Incidunt sit nam assumenda a odio quasi qui adipisci minus eum praesentium voluptas, vitae dolorum reiciendis quo repellat fugiat commodi cumque maxime?
          </p>
          <Link to="/about">About Us</Link>
        </section>

        <section>
          <h2>Useful Links</h2>
          <ul>
            {USEFUL_LINKS.map((link) => (
              <li key={link.url}>
                <a href={link.url} target="_blank">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </footer>
  );
}
