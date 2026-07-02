import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';

function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function getNextTuesday() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilTuesday = (2 - dayOfWeek + 7) % 7 || 7;
    const nextTuesday = new Date(today);
    nextTuesday.setDate(today.getDate() + daysUntilTuesday);
    return nextTuesday;
}

function isTodayTuesday() {
    return new Date().getDay() === 2;
}

function App() {
    const [capacitaciones, setCapacitaciones] = useState([]);
    const [cortes, setCortes] = useState([]);
    const [retencion, setRetencion] = useState([]);
    const [formData, setFormData] = useState({
          nombre: '',
          tipoCapacitacion: '',
          ubicacion: '',
          ciudad: '',
          empresa: '',
          fecha: new Date().toISOString().split('T')[0],
    });
    const [vista, setVista] = useState('registro');
    const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
        const datosCapacitaciones = localStorage.getItem('embajadores_capacitaciones');
        const datosCortes = localStorage.getItem('embajadores_cortes');
        const datosRetencion = localStorage.getItem('embajadores_retencion');

                if (datosCapacitaciones) setCapacitaciones(JSON.parse(datosCapacitaciones));
        if (datosCortes) setCortes(JSON.parse(datosCortes));
        if (datosRetencion) setRetencion(JSON.parse(datosRetencion));
  }, []);

  useEffect(() => {
        localStorage.setItem('embajadores_capacitaciones', JSON.stringify(capacitaciones));
  }, [capacitaciones]);

  useEffect(() => {
        localStorage.setItem('embajadores_cortes', JSON.stringify(cortes));
  }, [cortes]);

  useEffect(() => {
        localStorage.setItem('embajadores_retencion', JSON.stringify(retencion));
  }, [retencion]);

  const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
        e.preventDefault();
        const fechaObj = new Date(formData.fecha);
        const semana = getWeekNumber(fechaObj);
        const año = fechaObj.getFullYear();

        const nuevaCapacitacion = {
                id: Date.now().toString(),
                ...formData,
                semana,
                año,
        };

        setCapacitaciones([...capacitaciones, nuevaCapacitacion]);
        setFormData({
                nombre: '',
                tipoCapacitacion: '',
                ubicacion: '',
                ciudad: '',
                empresa: '',
                fecha: new Date().toISOString().split('T')[0],
        });
        alert('✅ Capacitación registrada correctamente');
  };

  const handleDelete = (id) => {
        if (window.confirm('¿Eliminar este registro?')) {
                setCapacitaciones(capacitaciones.filter(c => c.id !== id));
        }
  };

  const filtrados = capacitaciones.filter(c =>
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.empresa.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.ciudad.toLowerCase().includes(busqueda.toLowerCase())
                                            );

  const resumenPorPersona = capacitaciones.reduce((acc, cap) => {
        if (!acc[cap.nombre]) {
                acc[cap.nombre] = { registros: 0, capacitaciones: [] };
        }
        acc[cap.nombre].registros += 1;
        acc[cap.nombre].capacitaciones.push(cap);
        return acc;
  }, {});

  const nextTuesday = getNextTuesday();
    const nextTuesdayStr = nextTuesday.toLocaleDateString('es-CO');
    const esMartesHoy = isTodayTuesday();

  return (
        <div className="app">
          <header className="header">
            <h1>👥 Embajadores Uniprotec</h1>
          <p>Sistema de control de capacitaciones compartidas - Horas extra los martes</p>
  {esMartesHoy && <div className="corte-hoy">📌 ¡HOY ES MARTES! - Corte automático activado</div>}
    </header>

        <nav className="nav">
            <button className={`btn ${vista === 'registro' ? 'active' : ''}`} onClick={() => setVista('registro')}>
              ➕ Registrar
    </button>
          <button className={`btn ${vista === 'listado' ? 'active' : ''}`} onClick={() => setVista('listado')}>
            📋 Listado
  </button>
        <button className={`btn ${vista === 'resumen' ? 'active' : ''}`} onClick={() => setVista('resumen')}>
          📊 Resumen
            </button>
            </nav>

{vista === 'registro' && (
          <section className="section">
            <h2>Registrar Nueva Capacitación</h2>
           <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label>Nombre del Embajador *</label>
               <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required placeholder="Ej: Juan Pérez" />
  </div>

            <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Capacitación *</label>
                 <select name="tipoCapacitacion" value={formData.tipoCapacitacion} onChange={handleInputChange} required>
                    <option value="">Seleccionar...</option>
                   <option value="Técnica">Técnica</option>
                   <option value="Liderazgo">Liderazgo</option>
                   <option value="Seguridad">Seguridad</option>
                   <option value="Productos">Productos</option>
  </select>
  </div>
               <div className="form-group">
                  <label>Ubicación (Dónde) *</label>
                 <input type="text" name="ubicacion" value={formData.ubicacion} onChange={handleInputChange} required placeholder="Ej: Sala de capacitación" />
  </div>
  </div>

            <div className="form-row">
                <div className="form-group">
                  <label>Ciudad *</label>
                <input type="text" name="ciudad" value={formData.ciudad} onChange={handleInputChange} required placeholder="Ej: Bogotá" />
  </div>
              <div className="form-group">
                  <label>Empresa *</label>
                <input type="text" name="empresa" value={formData.empresa} onChange={handleInputChange} required placeholder="Ej: Uniprotec" />
  </div>
  </div>

            <div className="form-group">
                <label>Fecha *</label>
              <input type="date" name="fecha" value={formData.fecha} onChange={handleInputChange} required />
  </div>

            <button type="submit" className="btn-submit">✅ Registrar Capacitación</button>
  </form>
  </section>
      )}

{vista === 'listado' && (
          <section className="section">
            <h2>Listado de Capacitaciones</h2>
           <div className="busqueda">
              <input type="text" placeholder="🔍 Buscar por nombre, empresa o ciudad..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            <span className="count">Total: {filtrados.length}</span>
  </div>

{filtrados.length === 0 ? (
              <p className="empty">No hay registros</p>
           ) : (
                         <div className="tabla-container">
                           <table className="tabla">
                             <thead>
                               <tr>
                                 <th>Nombre</th>
                     <th>Tipo</th>
                     <th>Ubicación</th>
                     <th>Ciudad</th>
                     <th>Empresa</th>
                     <th>Fecha</th>
                     <th>Acciones</th>
             </tr>
             </thead>
                 <tbody>
           {filtrados.map(cap => (
                                 <tr key={cap.id}>
                      <td>{cap.nombre}</td>
                                                <td>{cap.tipoCapacitacion}</td>
                                                <td>{cap.ubicacion}</td>
                                                <td>{cap.ciudad}</td>
                                                <td>{cap.empresa}</td>
                                                <td>{new Date(cap.fecha).toLocaleDateString('es-CO')}</td>
                      <td><button className="btn-delete" onClick={() => handleDelete(cap.id)}>🗑️</button></td>
  </tr>
                  ))}
                    </tbody>
                    </table>
                    </div>
          )}
</section>
      )}

{vista === 'resumen' && (
          <section className="section">
            <h2>📊 Resumen de Horas Extra</h2>
           <div className="info-box">
              <strong>⏰ Próximo corte (Martes):</strong> {nextTuesdayStr}
  </div>

 {Object.keys(resumenPorPersona).length === 0 ? (
               <p className="empty">No hay datos para mostrar</p>
            ) : (
                          <div className="resumen-container">
              {Object.entries(resumenPorPersona).map(([nombre, datos]) => (
                              <div key={nombre} className="resumen-card">
                                <h3>{nombre}</h3>
                                                                       <div className="resumen-info">
                                  <div className="resumen-stat">
                                    <span className="label">Capacitaciones:</span>
                                                                           <span className="valor">{datos.registros}</span>
                                                     </div>
                                                                         <div className="resumen-stat">
                                                                           <span className="label">Horas extras:</span>
                                                                           <span className="valor highlight">{datos.registros} horas</span>
              </div>
              </div>
              </div>
                ))}
 </div>
           )}
</section>
      )}

      <footer className="footer">
                <p>Total de registros: <strong>{capacitaciones.length}</strong></p>
        </footer>
        </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
