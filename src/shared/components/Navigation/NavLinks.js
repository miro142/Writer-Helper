import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';

import { AuthContext } from '../../context/auth-context';
import './NavLinks.css';

const NavLinks = props => {
  const auth = useContext(AuthContext);

  return (
    <ul className="nav-links">
      <li>
        <NavLink to="/" end>
          HOME
        </NavLink>
      </li>
      {auth.isLoggedIn && (<React.Fragment>
        <li>
          <NavLink to={`${auth.userID}/characters`}>MY CHARACTERS</NavLink>
        </li>
        <li>
          <NavLink to={`${auth.userID}/places`}>MY PLACES</NavLink>
        </li>
        <li>
          <NavLink to={`${auth.userID}/objects`}>MY OBJECTS</NavLink>
        </li>
        <li>
          <NavLink to={`${auth.userID}/organizations`}>MY ORGANIZATIONS</NavLink>
        </li>
        <li>
          <NavLink to={`${auth.userID}/relations`}>RELATIONSHIP WEB</NavLink>
        </li>
        </React.Fragment>
      )}
      {!auth.isLoggedIn && (
        <li>
          <NavLink to="/auth">LOG IN</NavLink>
        </li>
      )}
      {auth.isLoggedIn && (
        <li>
          <button onClick={auth.logout}>LOGOUT</button>
        </li>
      )}
    </ul>
  );
};

export default NavLinks;
