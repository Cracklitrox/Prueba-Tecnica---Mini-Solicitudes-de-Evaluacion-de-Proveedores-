import { useState, useEffect } from 'react';

function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('No hay token de autenticación. Por favor, inicie sesión. Ilegal oe');
        }

        const response = await fetch('http://127.0.0.1:8000/requests/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem('access_token');
          throw new Error('Su sesión ha expirado. Por favor, inicie sesión de nuevo.');
        }

        if (!response.ok) {
          throw new Error('Error al obtener las solicitudes.');
        }

        const data = await response.json();
        setRequests(data.items);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (loading) return <p>Cargando solicitudes...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Listado de Solicitudes</h2>
      <table>
        <thead>
          <tr>
            <th>ID (corto)</th>
            <th>Compañía</th>
            <th>Status</th>
            <th>Risk Score</th>
            <th>Fecha Creación</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id}>
              <td>{req.id.substring(0, 8)}</td>
              <td>{req.company.name}</td>
              <td>{req.status}</td>
              <td>{req.risk_score}</td>
              <td>{new Date(req.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Requests;