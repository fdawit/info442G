//navbar at the top of every page

import { NavLink, useLocation, useNavigate } from 'react-router';
import ZipSearchBar from './ZipSearchBar';
import './NavBar.css';

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  function handleSearch(zip) {
    const address = '/?zip=' + zip;
    const alreadyOpen = location.pathname + location.search === address;
    navigate(address, { replace: alreadyOpen });
  }

  return (
    <header className="navbar">
      <nav aria-label="Main">
        <ul className="navbar-links">
          <li><NavLink to="/" end>Home</NavLink></li>
          <li><NavLink to="/benefits-check">Benefits Help</NavLink></li>
          <li><NavLink to="/about">About</NavLink></li>
        </ul>
      </nav>

      <ZipSearchBar id="nav-zip" onSearch={handleSearch} />
    </header>
  );
}
