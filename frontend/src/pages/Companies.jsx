import React, { useState, useEffect, useCallback } from 'react';
import * as apiService from '../services/apiService';
import './Requests.css';
import './Companies.css';

// --- Componente para el Formulario/Modal de Compañía ---
const CompanyForm = ({ company, onFormSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: company ? company.name : '',
        tax_id: company ? company.tax_id : '',
        country: company ? company.country : 'CL',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onFormSubmit(formData);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h3>{company ? 'Editar Compañía' : 'Nueva Compañía'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Nombre:</label>
                        <input id="name" name="name" value={formData.name} onChange={handleChange} required className="form-control" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="tax_id">Tax ID:</label>
                        <input id="tax_id" name="tax_id" value={formData.tax_id || ''} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="country">País (código 2 letras):</label>
                        <input id="country" name="country" value={formData.country} onChange={handleChange} required maxLength="2" className="form-control" />
                    </div>
                    <div className="modal-buttons">
                        <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={isSubmitting}>Cancelar</button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Componente Principal ---
function Companies() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);

    const fetchCompanies = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiService.getCompanies();
            setCompanies(data.items);
            setError('');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    const handleFormSubmit = async (companyData) => {
        try {
            if (editingCompany) {
                await apiService.updateCompany(editingCompany.id, companyData);
                alert('Compañía actualizada con éxito.');
            } else {
                await apiService.createCompany(companyData);
                alert('Compañía creada con éxito.');
            }
            setShowForm(false);
            setEditingCompany(null);
            fetchCompanies();
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const handleDelete = async (companyId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta compañía? (Borrado lógico)')) {
            try {
                await apiService.deleteCompany(companyId);
                alert('Compañía eliminada con éxito.');
                fetchCompanies();
            } catch (err) {
                alert(`Error: ${err.message}`);
            }
        }
    };

    return (
        <div className="page-container" style={{ width: '100%', maxWidth: '1200px' }}>
            <h2>Gestión de Compañías</h2>

            <button className="btn btn-primary" onClick={() => { setEditingCompany(null); setShowForm(true); }} style={{ marginBottom: '20px' }}>
                Nueva Compañía
            </button>

            {showForm && (
                <CompanyForm
                    company={editingCompany}
                    onFormSubmit={handleFormSubmit}
                    onCancel={() => { setShowForm(false); setEditingCompany(null); }}
                />
            )}

            {loading ? <p>Cargando...</p> : error ? <p style={{ color: 'red' }}>{error}</p> : (
                <table className="requests-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Tax ID</th>
                            <th>País</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {companies.map((company) => (
                            <tr key={company.id}>
                                <td>{company.name}</td>
                                <td>{company.tax_id || 'N/A'}</td>
                                <td>{company.country}</td>
                                <td style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn btn-secondary" onClick={() => { setEditingCompany(company); setShowForm(true); }}>
                                        Editar
                                    </button>
                                    <button className="btn btn-danger" onClick={() => handleDelete(company.id)}>
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Companies;