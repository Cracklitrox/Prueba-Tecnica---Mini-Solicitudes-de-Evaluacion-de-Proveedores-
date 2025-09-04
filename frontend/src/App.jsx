import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Requests from './pages/Requests';
import Companies from './pages/Companies';
import Navbar from './components/Navbar';

const Router = () => {
  const [path, setPath] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setPath(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  switch (path) {
    case '#/companies':
      return <Companies />;
    case '#/requests':
    default:
      return <Requests />;
  }
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token'));

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('access_token', newToken);
    setToken(newToken);
    window.location.hash = '#/requests';
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    window.location.hash = '';
  };

  return (
    <div className="app-container">
      {token ? (
        <>
          <Navbar onLogout={handleLogout} />
          <Router />
        </>
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;