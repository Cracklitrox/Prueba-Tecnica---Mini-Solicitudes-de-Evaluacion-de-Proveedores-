# Mini Solicitudes de Evaluación de Proveedores

API backend en **FastAPI (Python)** con **PostgreSQL + SQLAlchemy 2.0 + Alembic** y autenticación **JWT**.  
Incluye un **mini-frontend en React (Vite)** para login y tabla de solicitudes.

---

## 📦 Prerrequisitos
* [Docker Desktop](https://www.docker.com/products/docker-desktop/)
* [Git](https://git-scm.com/)
* [Node.js+ 18+ (LTS)](https://nodejs.org/) - Usar el instalador `.msi` en Windows.

---

## 🚀 Puesta en Marcha del Entorno de Desarrollo

Sigue estos pasos para levantar el proyecto en tu máquina local.
```bash
# Crear y activar entorno virtual (solo si corres local sin Docker)
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate
```

```bash
# 1. Clonar y entrar al proyecto
git clone https://github.com/Cracklitrox/PruebaTecnica.git
cd PruebaTecnica
```

# 2. Variables de entorno
```bash
cp .env.example .env
```

# 3. Levantar backend + DB
```bash
docker compose up -d --build
```

# 4. Migraciones y seed de datos
```bash
docker compose exec api alembic upgrade head
docker compose exec api python seed.py
```

# 5. Levantar frontend
```bash
cd frontend
npm install
echo "VITE_API_BASE_URL=http://localhost:8000" > .env
npm run dev
```

✅ Verificación

* **API corriendo en: http://localhost:8000/docs

* **Frontend corriendo en: http://localhost:5173

Usuario administrador creado por seed.py:

* **Email: administrador@ejemplo.com

* **Password: admin123

🛑 Detener todo

Para detener todos los contenedores, presiona `Ctrl + C` en una nueva terminal, en la ruta donde se encuentra ubicado la raiz del proyecto. Para eliminarlos y liberar recursos, puedes ejecutar:

```bash
docker compose down
```

Haz esto cada vez que termines de trabajar para evitar seguir consumiendo recursos.
