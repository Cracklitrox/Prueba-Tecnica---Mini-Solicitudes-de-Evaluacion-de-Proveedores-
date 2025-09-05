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

# 1. Clonar y entrar al proyecto
```bash
git clone https://github.com/Cracklitrox/PruebaTecnica.git
cd PruebaTecnica
```

# 2. Instalar las Dependencias de Python
```bash
pip install -r requirements.txt
```

# 3. Creación de entorno virtual
```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate
```

# 4. Variables de entorno
```bash
cp .env.example .env
```

# 5. Levantar backend + DB
```bash
docker compose up -d --build
```

Se recomienda esperar un tiempo estimado de entre 15 a 20 segundos para darle tiempo al Docker el iniciar los contenendores.

# 6. Migraciones y seed de datos
```bash
docker compose exec api alembic upgrade head
docker compose exec api python seed.py
```

# 7. Levantar frontend
```bash
cd frontend
npm install
cp .env.example .env
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
