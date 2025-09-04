import { useState, useEffect } from 'react';

function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    q: '',
    status: '',
    risk_min: '',
    risk_max: '',
    page: 1,
    page_size: 10,
  });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('No hay token de autenticación.');
        }

        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            params.append(key, value);
          }
        });

        const response = await fetch(`http://127.0.0.1:8000/requests/?${params.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.status === 401) {
          localStorage.removeItem('access_token');
          throw new Error('Sesión expirada. Inicie sesión de nuevo.');
        }
        if (!response.ok) {
          throw new Error('Error al obtener las solicitudes.');
        }

        const data = await response.json();
        setRequests(data.items);
        setTotal(data.total);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value, page: 1 }));
  };
  
  const totalPages = Math.ceil(total / filters.page_size);

  return (
    <div>
      <h2>Listado de Solicitudes</h2>
      
      <div className="filters" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input name="q" value={filters.q} onChange={handleFilterChange} placeholder="Buscar por empresa..." />
        <select name="status" value={filters.status} onChange={handleFilterChange}>
          <option value="">Todos los Status</option>
          <option value="pending">Pending</option>
          <option value="in_review">In Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <input name="risk_min" type="number" value={filters.risk_min} onChange={handleFilterChange} placeholder="Risk Min" />
        <input name="risk_max" type="number" value={filters.risk_max} onChange={handleFilterChange} placeholder="Risk Max" />
      </div>

      {loading ? <p>Cargando...</p> : error ? <p style={{ color: 'red' }}>{error}</p> : (
        <>
          <table>
            {}
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

          {}
          <div className="pagination" style={{ marginTop: '20px' }}>
            <button
              onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
              disabled={filters.page <= 1}
            >
              Anterior
            </button>
            <span> Página {filters.page} de {totalPages} </span>
            <button
              onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
              disabled={filters.page >= totalPages}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Requests;