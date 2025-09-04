import { useState, useEffect, useCallback } from 'react';
import * as apiService from '../services/apiService';
import { DashboardCharts } from '../components/DashboardCharts';
import './Requests.css';

// --- Componente para el Formulario de Nueva Solicitud ---
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
      <div className="form-container" style={{ border: '1px solid #333', padding: '20px', margin: '20px 0', backgroundColor: '#242424', borderRadius: '8px' }}>
      <h3>Nueva Solicitud</h3>
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <select className="form-control" name="company_id" value={newRequestData.company_id} onChange={handleChange} required>
          <option value="">-- Selecciona una empresa --</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
              <label><input type="checkbox" name="pep_flag" checked={newRequestData.risk_inputs.pep_flag} onChange={handleChange} /> PEP Flag</label>
              <label><input type="checkbox" name="sanction_list" checked={newRequestData.risk_inputs.sanction_list} onChange={handleChange} /> Sanction List</label>
              <label>Pagos Atrasados: <input type="number" className="form-control" name="late_payments" value={newRequestData.risk_inputs.late_payments} onChange={handleChange} min="0" style={{width: '60px'}} /></label>
          </div>
          <div style={{display: 'flex', gap: '1rem'}}>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Creando...' : 'Crear Solicitud'}</button>
              <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isSubmitting}>Cancelar</button>
          </div>
      </form>
      </div>
  );
};

// --- Componente para Actualizar el Estado de una Solicitud ---
const StatusUpdater = ({ currentStatus, requestId, onStatusUpdate }) => {
    const [status, setStatus] = useState(currentStatus);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusChange = async (e) => {
      const newStatus = e.target.value;
      setIsUpdating(true);
      try {
        await apiService.updateRequestStatus(requestId, newStatus);
        setStatus(newStatus);
        onStatusUpdate(); // Avisa al componente padre para que refresque si es necesario
      } catch (error) {
        console.error("Error al actualizar estado:", error);
        alert("No se pudo actualizar el estado.");
        setStatus(currentStatus); // Revertir en caso de error
      } finally {
        setIsUpdating(false);
      }
    };

    return (
      <select value={status} onChange={handleStatusChange} disabled={isUpdating} className="form-control">
        <option value="pending">Pending</option>
        <option value="in_review">In Review</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
    );
};

// --- Componente Principal de la Página de Solicitudes ---
function Requests() {
  const [viewingRequest, setViewingRequest] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ q: '', status: '', risk_min: '', risk_max: '', page: 1, page_size: 10 });
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [companies, setCompanies] = useState([]);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const requestsData = await apiService.getRequests(filters);
      setRequests(requestsData.items);
      setTotal(requestsData.total);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchInitialData = useCallback(async () => {
    try {
      const companiesData = await apiService.getCompanies();
      setCompanies(companiesData.items);
    } catch (err) {
      setError(err.message);
    }
  }, []);

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

  const handleDeleteRequest = async (requestId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta solicitud?')) {
        try {
            await apiService.deleteRequest(requestId);
            alert('Solicitud eliminada con éxito.');
            fetchRequests();
        } catch (err) {
            setError(err.message);
            alert(`Error: ${err.message}`);
        }
    }
};

  const totalPages = Math.ceil(total / filters.page_size);

  return (
    <div className="requests-page-container">
      <h2>Listado de Solicitudes</h2>
      <DashboardCharts requests={requests} />

      {!showForm && <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{marginBottom: '20px'}}>Nueva Solicitud</button>}
      {showForm && <NewRequestForm companies={companies} onFormSubmit={handleNewRequestSubmit} onCancel={() => setShowForm(false)} />}

      {viewingRequest && (
          <div className="modal-backdrop">
              <div className="modal-content">
                  <h3>Detalles de la Solicitud</h3>
                  <p><strong>ID:</strong> {viewingRequest.id}</p>
                  <p><strong>Compañía:</strong> {viewingRequest.company.name}</p>
                  <p><strong>Status:</strong> {viewingRequest.status}</p>
                  <p><strong>Risk Score:</strong> {viewingRequest.risk_score}</p>
                  <p><strong>Fecha de Creación:</strong> {new Date(viewingRequest.created_at).toLocaleString()}</p>
                  <hr style={{ margin: '1rem 0', borderColor: '#444' }} />
                  <h4>Inputs de Riesgo:</h4>
                  <ul>
                      <li><strong>PEP Flag:</strong> {viewingRequest.risk_inputs.pep_flag ? 'Sí' : 'No'}</li>
                      <li><strong>En Lista de Sanciones:</strong> {viewingRequest.risk_inputs.sanction_list ? 'Sí' : 'No'}</li>
                      <li><strong>Pagos Atrasados:</strong> {viewingRequest.risk_inputs.late_payments}</li>
                  </ul>
                  <div className="modal-buttons">
                      <button className="btn btn-secondary" onClick={() => setViewingRequest(null)}>Cerrar</button>
                  </div>
              </div>
          </div>
      )}

      <div className="filters-container">
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
            <table className="requests-table">
              <thead>
                <tr>
                  <th>ID (corto)</th>
                  <th>Compañía</th>
                  <th>Status</th>
                  <th>Risk Score</th>
                  <th>Fecha Creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td>{req.id.substring(0, 8)}</td>
                    <td>{req.company.name}</td>
                    <td>
                       <StatusUpdater currentStatus={req.status} requestId={req.id} onStatusUpdate={fetchRequests} />
                    </td>
                    <td>{req.risk_score}</td>
                    <td>{new Date(req.created_at).toLocaleDateString()}</td>
                    <td>{}
                      <button className="btn btn-secondary" onClick={() => setViewingRequest(req)}>
                          Ver Detalles
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDeleteRequest(req.id)}>
                          Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="pagination-container">
            <button className="btn btn-secondary"
              onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
              disabled={filters.page <= 1}
            >
              Anterior
            </button>
            <span> Página {filters.page} de {totalPages} </span>
            <button className="btn btn-secondary"
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