//navbar at the top of every page

import { NavLink, useNavigate } from 'react-router';
import ZipSearchBar from './ZipSearchBar';
import './NavBar.css';

export default function NavBar() {
  const navigate = useNavigate();
  function handleSearch(zip) {
    navigate('/?zip=' + zip);
  }

  return (
    <header className="navbar">
      <nav aria-label="Main">
        <ul className="navbar-links">
          <li><NavLink to="/" end>Home</NavLink></li>
          <li><NavLink to="/benefits-check">Benefits Help</NavLink></li>
          <li><NavLink to="/about">About</NavLink></li>
          <li>
            <NavLink to="/benefits-test">Benefits test (testing only)</NavLink> {/*Remove when done testing*/}
          </li>
        </ul>
      </nav>

      <ZipSearchBar id="nav-zip" onSearch={handleSearch} />
    </header>
  );
}
