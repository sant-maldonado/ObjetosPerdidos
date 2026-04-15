import { useState, useEffect } from 'react'

const API_URL = '/api/objetos'

const categorias = ['electrónica', 'documentos', 'llaves', 'ropa', 'joyería', 'otros']

function App() {
  const [objetos, setObjetos] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({ busqueda: '', categoria: '', estado: '' })
  const [mostrarForm, setMostrarForm] = useState(false)
  const [mostrarContacto, setMostrarContacto] = useState(false)
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: '',
    estado: '',
    fecha: '',
    contacto: '',
    imagen: null,
    ubicacion: ''
  })
  const [obteniendoUbicacion, setObteniendoUbicacion] = useState(false)

  async function obtenerUbicacionActual() {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización')
      return
    }
    setObteniendoUbicacion(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          const data = await res.json()
          const direccion = data.display_name?.split(',').slice(0, 3).join(',') || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          setFormData({ ...formData, ubicacion: direccion })
        } catch {
          setFormData({ ...formData, ubicacion: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` })
        }
        setObteniendoUbicacion(false)
      },
      (error) => {
        alert('Error al obtener ubicación: ' + error.message)
        setObteniendoUbicacion(false)
      }
    )
  }

  async function fetchObjetos() {
    try {
      const params = new URLSearchParams()
      if (filtros.busqueda) params.append('busqueda', filtros.busqueda)
      if (filtros.categoria) params.append('categoria', filtros.categoria)
      if (filtros.estado) params.append('estado', filtros.estado)
      
      const res = await fetch(`${API_URL}?${params}`)
      if (!res.ok) throw new Error('Error de servidor: ' + res.status)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setObjetos(data)
    } catch (err) {
      console.error('Error fetching:', err.message)
      setObjetos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchObjetos()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const data = new FormData()
    data.append('titulo', formData.titulo)
    data.append('descripcion', formData.descripcion)
    data.append('categoria', formData.categoria)
    data.append('estado', formData.estado)
    data.append('fecha', formData.fecha)
    data.append('contacto', formData.contacto)
    data.append('ubicacion', formData.ubicacion)
    if (formData.imagen) {
      data.append('imagen', formData.imagen)
    }
    
    await fetch(API_URL, {
      method: 'POST',
      body: data
    })
    setMostrarForm(false)
    setFormData({
      titulo: '',
      descripcion: '',
      categoria: '',
      estado: '',
      fecha: '',
      contacto: '',
      imagen: null,
      ubicacion: ''
    })
    fetchObjetos()
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este objeto?')) return
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
    fetchObjetos()
  }

  return (
    <div className="app">
      <header className="header">
        <div className="container header-content">
          <button className="logo-btn" onClick={() => window.location.href = '/'}>
            <span className="logo-icon">🔍</span>
            <span className="logo-text">FindIt</span>
          </button>
          <button className="btn btn-primary" onClick={() => setMostrarForm(true)}>
            + Publicar
          </button>
          <button className="btn btn-secondary" onClick={() => setMostrarContacto(true)}>
            Contacto
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="container">
          <h1>Encuentra lo que perdiste</h1>
          <p>Publica y busca objetos perdidos o encontrados</p>
        </div>
      </section>

      <section className="search-section">
        <div className="container">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar..."
              value={filtros.busqueda}
              onChange={e => setFiltros({ ...filtros, busqueda: e.target.value })}
            />
            <select
              value={filtros.categoria}
              onChange={e => setFiltros({ ...filtros, categoria: e.target.value })}
            >
              <option value="">Todas las categorías</option>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={filtros.estado}
              onChange={e => setFiltros({ ...filtros, estado: e.target.value })}
            >
              <option value="">Todos los estados</option>
              <option value="perdido">Perdido</option>
              <option value="encontrado">Encontrado</option>
            </select>
          </div>
        </div>
      </section>

      <section className="objects-section">
        <div className="container">
          <h2>Objetos Recientes</h2>
          {loading ? (
            <p className="loading">Cargando...</p>
          ) : objetos.length === 0 ? (
            <p className="empty">No se encontraron objetos</p>
          ) : (
            <div className="objects-grid">
              {objetos.map(obj => (
                <div key={obj.id} className={`object-card ${obj.estado}`}>
                  {obj.imagen && <img src={obj.imagen} alt={obj.titulo} className="card-img" />}
                  <div className="card-content">
                    <span className={`badge ${obj.estado}`}>{obj.estado}</span>
                    <h3>{obj.titulo}</h3>
                    {obj.descripcion && <p>{obj.descripcion}</p>}
                    {obj.categoria && <span className="categoria">{obj.categoria}</span>}
                    {obj.ubicacion && <span className="ubicacion">📍 {obj.ubicacion}</span>}
                    {obj.fecha && <span className="fecha">📅 {obj.fecha}</span>}
                    {obj.contacto && <span className="contacto">📞 {obj.contacto}</span>}
                    <button className="btn-delete" onClick={() => handleDelete(obj.id)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {mostrarForm && (
        <div className="modal-overlay" onClick={() => setMostrarForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Publicar Objeto</h3>
              <button onClick={() => setMostrarForm(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Título *</label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Categoría</label>
                  <select
                    value={formData.categoria}
                    onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                  >
                    <option value="">Seleccionar</option>
                    {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Estado *</label>
                  <select
                    required
                    value={formData.estado}
                    onChange={e => setFormData({ ...formData, estado: e.target.value })}
                  >
                    <option value="">Seleccionar</option>
                    <option value="perdido">Perdido</option>
                    <option value="encontrado">Encontrado</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Fecha</label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Contacto</label>
                  <input
                    type="text"
                    placeholder="Teléfono o email"
                    value={formData.contacto}
                    onChange={e => setFormData({ ...formData, contacto: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Ubicación</label>
                <div className="ubicacion-input">
                  <input
                    type="text"
                    placeholder="Dónde se perdió/encontró"
                    value={formData.ubicacion}
                    onChange={e => setFormData({ ...formData, ubicacion: e.target.value })}
                  />
                  <button type="button" className="btn-ubicacion" onClick={obtenerUbicacionActual} disabled={obteniendoUbicacion}>
                    {obteniendoUbicacion ? '...' : '📍'}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Imagen</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setFormData({ ...formData, imagen: e.target.files[0] })}
                />
                {formData.imagen && <p className="file-name">{formData.imagen.name}</p>}
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setMostrarForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Publicar
                </button>
              </div>
            </form>
          </div>
</div>
        )}

        {mostrarContacto && (
          <div className="modal-overlay" onClick={() => setMostrarContacto(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Contacto de la Empresa</h3>
                <button onClick={() => setMostrarContacto(false)}>&times;</button>
              </div>
              <div className="modal-body contacto-modal">
                <div className="contacto-header">
                  <span className="contacto-icon">🏢</span>
                  <h4>TechSolutions S.A.</h4>
                </div>
                <p className="contacto-intro">¡Gracias por usar FindIt! Estamos para ayudarte.</p>
                <div className="contacto-info">
                  <div className="contacto-item">
                    <span className="contacto-label">📧 Email</span>
                    <span className="contacto-value">contacto@techsolutions.com</span>
                  </div>
                  <div className="contacto-item">
                    <span className="contacto-label">📞 Teléfono</span>
                    <span className="contacto-value">+54 11 1234-5678</span>
                  </div>
                  <div className="contacto-item">
                    <span className="contacto-label">🕐 Horario</span>
                    <span className="contacto-value">Lunes a Viernes 9:00 - 18:00</span>
                  </div>
                </div>
                <a href="mailto:contacto@techsolutions.com" className="btn-contacto">Enviar Email</a>
              </div>
            </div>
          </div>
        )}

      <footer className="footer">
        <div className="container">
          <p>© 2026 FindIt - Ayuda a recuperar lo que se perdió</p>
        </div>
      </footer>
    </div>
  )
}

export default App