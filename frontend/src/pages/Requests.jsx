import { useState, useEffect, useCallback } from 'react';
import * as apiService from '../services/apiService';

const NewRequestForm = ({ companies, onFormSubmit, onCancel }) => {
  const [newRequestData, setNewRequestData] = useState({
    company_id: '',
    risk_inputs: {
      pep_flag: false,
      sanction_list: false,
      late_payments: 0,
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name in newRequestData.risk_inputs) {
      setNewRequestData(prev => ({
        ...prev,
        risk_inputs: { ...prev.risk_inputs, [name]: type === 'checkbox' ? checked : parseInt(value, 10) }
      }));
    } else {
      setNewRequestData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newRequestData.company_id) {
      alert('Por favor, selecciona una empresa.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onFormSubmit(newRequestData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container" style={{ border: '1px solid grey', padding: '20px', margin: '20px 0' }}>
      <h3>Nueva Solicitud</h3>
      <form onSubmit={handleSubmit}>
        <select name="company_id" value={newRequestData.company_id} onChange={handleChange} required>
          <option value="">-- Selecciona una empresa --</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label><input type="checkbox" name="pep_flag" checked={newRequestData.risk_inputs.pep_flag} onChange={handleChange} /> PEP Flag</label>
        <label><input type="checkbox" name="sanction_list" checked={newRequestData.risk_inputs.sanction_list} onChange={handleChange} /> Sanction List</label>
        <label>Pagos Atrasados: <input type="number" name="late_payments" value={newRequestData.risk_inputs.late_payments} onChange={handleChange} min="0" /></label>
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creando...' : 'Crear Solicitud'}</button>
        <button type="button" onClick={onCancel} disabled={isSubmitting}>Cancelar</button>
      </form>
    </div>
  );
};


function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ q: '', status: '', risk_min: '', risk_max: '', page: 1, page_size: 10 });
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [companies, setCompanies] = useState([]);

  const fetchInitialData = useCallback(async () => {
    try {
      const companiesData = await apiService.getCompanies();
      setCompanies(companiesData.items);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const requestsData = await apiService.getRequests(filters);
      setRequests(requestsData.items);
      setTotal(requestsData.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleNewRequestSubmit = async (newRequestData) => {
    try {
      await apiService.createRequest(newRequestData);
      setShowForm(false);
      fetchRequests();
      alert("¡Solicitud creada con éxito!");
    } catch (err) {
      setError(err.message);
    }
  };

  const totalPages = Math.ceil(total / filters.page_size);

  return (
    <div>
      <h2>Listado de Solicitudes</h2>
      {!showForm && <button onClick={() => setShowForm(true)} style={{marginBottom: '20px'}}>Nueva Solicitud</button>}
      {showForm && <NewRequestForm companies={companies} onFormSubmit={handleNewRequestSubmit} onCancel={() => setShowForm(false)} />}
      
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
          {requests.length === 0 ? (
            <p>No se encontraron solicitudes con los filtros actuales.</p>
          ) : (
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
          )}
          
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