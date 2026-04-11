# SPEC - FindIt: Sistema de Objetos Perdidos

## 1. Project Overview

- **Nombre**: FindIt
- **Stack**: React + Node.js + Express
- **Tipo**: Full-stack web app
- **Funcionalidad**: Plataforma para publicar y buscar objetos perdidos/encontrados

## 2. Tech Stack

### Backend
- Node.js + Express
- SQLite (better-sqlite3 para desarrollo)
- cors, dotenv

### Frontend
- React + Vite
- CSS vanilla (sin frameworks)
- fetch para API

## 3. Data Model

```json
// Objeto
{
  "id": "INTEGER PRIMARY KEY",
  "titulo": "TEXT NOT NULL",
  "descripcion": "TEXT",
  "categoria": "TEXT",
  "estado": "perdido | encontrado",
  "fecha": "DATE",
  "contacto": "TEXT",
  "imagen": "TEXT",
  "ubicacion": "TEXT",
  "creado_en": "DATETIME"
}
```

### Categorías
- electrónica
- documentos
- llaves
- ropa
- joyería
- otros

## 4. API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/objetos | Listar todos los objetos (soporta filtros) |
| GET | /api/objetos/:id | Obtener un objeto |
| POST | /api/objetos | Crear nuevo objeto |
| PUT | /api/objetos/:id | Actualizar objeto |
| DELETE | /api/objetos/:id | Eliminar objeto |

### Query Params (GET /api/objetos)
- `?busqueda=texto`
- `?categoria=valor`
- `?estado=perdido|encontrado`

## 5. UI Components

### Pages
1. **Home** - Listado de objetos con filtros
2. **Nuevo Objeto** - Formulario para publicar

### Components
- Header (logo + navegación)
- SearchBar (filtros)
- ObjectCard (tarjeta de objeto)
- ObjectForm (formulario)
- EstadoBadge (perdido/encontrado)

## 6. Acceptance Criteria

- [ ] Backend responde en puerto 3001
- [ ] Frontend inicia en puerto 5173
- [ ] CRUD completo de objetos
- [ ] Filtros funcionan correctamente
- [ ] Diseño responsive
- [ ]SinErrors de consola