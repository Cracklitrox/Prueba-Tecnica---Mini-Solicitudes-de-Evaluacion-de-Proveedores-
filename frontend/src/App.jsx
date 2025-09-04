import { useState } from 'react';
import Login from './pages/Login';
import Requests from './pages/Requests';

function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token'));

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('access_token', newToken);
    setToken(newToken);
  };

  return (
    <div className="app-container">
      {token ? <Requests /> : <Login onLoginSuccess={handleLoginSuccess} />}
    </div>
  );
}

export default App;