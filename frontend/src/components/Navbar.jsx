import React from 'react';
import './Navbar.css';

const Navbar = ({ onLogout }) => {
  const currentPath = window.location.hash || '#/requests';

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <a href="#/requests" className={currentPath === '#/requests' ? 'active' : ''}>
          Solicitudes
        </a>
        <a href="#/companies" className={currentPath === '#/companies' ? 'active' : ''}>
          Compañías
        </a>
      </div>
      <button onClick={onLogout} className="btn btn-secondary">Cerrar Sesión</button>
    </nav>
  );
};

export default Navbar;