import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Requests from './pages/Requests';

function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token'));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('access_token'));
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <div>
      {token ? <Requests /> : <Login />}
    </div>
  );
}

export default App;