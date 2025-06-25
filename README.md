# 🎮 Buscaminas Arduino - Proyecto Final

Un juego de buscaminas interactivo que combina una interfaz web moderna con control físico a través de Arduino, desarrollado como proyecto final de Organización de Computadoras.

## 📋 Descripción del Proyecto

Este sistema integra tres componentes principales:

- **Frontend**: Interfaz web desarrollada en React + Vite
- **Backend**: API REST en TypeScript con Express
- **Arduino**: Control físico del juego mediante comunicación serial

El proyecto permite jugar buscaminas tanto desde la interfaz web como mediante controles físicos conectados al Arduino, con sincronización en tiempo real entre ambas interfaces.

## 🏗️ Arquitectura del Sistema

```text
┌─────────────────┐    HTTP/REST    ┌─────────────────┐    Serial    ┌─────────────────┐
│   Frontend      │ ←──────────────→ │    Backend      │ ←───────────→ │    Arduino      │
│   (React)       │                 │  (TypeScript)   │               │   (Proteus)     │
└─────────────────┘                 └─────────────────┘               └─────────────────┘
```

## 🚀 Características Principales

- 🎯 **Juego de Buscaminas** con tablero 4x4
- 🔧 **Control Dual**: Web y Arduino
- 📡 **Comunicación Serial** en tiempo real
- 🏆 **Sistema de Puntuaciones** (Top 5)
- 📁 **Carga de Configuraciones** desde archivo
- 🎨 **Interfaz Moderna** y responsive

## 🛠️ Tecnologías Utilizadas

### Frontend

- ⚛️ **React 19.0.0**
- ⚡ **Vite** (bundler y dev server)
- 🎨 **CSS3** con diseño responsive
- 🌐 **Axios** para comunicación HTTP
- 🧭 **React Router DOM** para navegación

### Backend

- 📘 **TypeScript 5.8.2**
- 🚀 **Express 5.1.0**
- 🔌 **SerialPort 13.0.0** para comunicación Arduino
- 📝 **Jison 0.4.18** para análisis sintáctico
- 🔒 **CORS** habilitado para desarrollo

### Hardware

- 🔌 **Arduino** (simulado en Proteus)
- 🖥️ **Proteus** para simulación de circuitos
- 📡 **Virtual Serial Port Driver** para comunicación

## 📋 Prerrequisitos

### Software Requerido

1. **Node.js** (v18 o superior)
2. **TypeScript** (última versión)
3. **Proteus** (última versión)
4. **Virtual Serial Port Driver**
5. **Git** (opcional, para clonar el repositorio)

### Configuración Inicial

- Configurar Virtual Serial Port Driver para simular conexión Arduino
- Tener Proteus instalado y configurado

## 🚀 Instalación y Ejecución

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd PROFINAL_BUSCAMINAS-ARDUINO
```

### 2. Configurar Backend
```bash
cd Backend
npm install
```

### 3. Configurar Frontend
```bash
cd ../frontend
npm install
```

### 4. Configurar Arduino/Proteus
1. Abrir `Arduino/ProteusFinalORGA.pdsprj` en Proteus
2. Configurar Virtual Serial Port Driver
3. Establecer conexión serial (puerto COM)

## ▶️ Ejecución del Sistema

### 1. Iniciar Simulación Arduino
- Abrir Proteus
- Cargar el proyecto `ProteusFinalORGA.pdsprj`
- Iniciar simulación

### 2. Ejecutar Backend
```bash
cd Backend
npx ts-node server.ts
```
El servidor estará disponible en `http://localhost:3000`

### 3. Ejecutar Frontend
```bash
cd frontend
npm run dev
```
La aplicación web estará disponible en `http://localhost:5173`

## 📖 Uso del Sistema

### Interfaz Web
1. **Página Principal**: Navegación entre opciones
2. **Juego**: Tablero interactivo 4x4
3. **Top 5**: Mejores puntuaciones

### Control Arduino
- Controles físicos simulados en Proteus
- Sincronización en tiempo real con interfaz web
- Comunicación bidireccional via puerto serial

### Carga de Configuraciones
- Subir archivos de configuración del tablero
- Formato específico procesado por analizador sintáctico
- Posicionamiento automático de bombas

## 📁 Estructura del Proyecto

```
PROFINAL_BUSCAMINAS-ARDUINO/
├── Arduino/                 # Código y simulación Arduino
│   ├── arduino.ino         # Código principal Arduino
│   └── ProteusFinalORGA.pdsprj # Proyecto Proteus
├── Backend/                # API REST TypeScript
│   ├── backend/
│   │   ├── controllers/    # Controladores API
│   │   ├── routes/        # Rutas Express
│   │   ├── services/      # Servicios y lógica de negocio
│   │   └── config/        # Configuración sistema
├── frontend/              # Aplicación React
│   ├── src/
│   │   ├── pages/         # Páginas principales
│   │   └── assets/        # Recursos estáticos
└── README.md             # Este archivo
```

## 🌐 Endpoints API

Para información detallada sobre los endpoints disponibles, consulte el archivo `endpoints.md`.

### Principales Endpoints
- `GET /api/status` - Estado del servidor
- `POST /api/upload` - Cargar configuración
- `POST /api/addBomb` - Añadir bomba
- `GET /api/gameState` - Estado del juego
- `POST /api/resetGame` - Reiniciar partida

## 🐛 Solución de Problemas

### Problemas Comunes

**Error de conexión serial:**
- Verificar Virtual Serial Port Driver
- Comprobar puerto COM en configuración
- Reiniciar simulación Proteus

**Backend no inicia:**
- Verificar instalación TypeScript: `npm install -g typescript`
- Instalar dependencias: `npm install`
- Verificar puerto 3000 disponible

**Frontend no carga:**
- Verificar Node.js versión: `node --version`
- Limpiar caché: `npm run build`
- Verificar puerto 5173 disponible

## 👥 Desarrollo

### Scripts Disponibles

**Backend:**
- `npx ts-node server.ts` - Ejecutar en desarrollo

**Frontend:**
- `npm run dev` - Servidor desarrollo
- `npm run build` - Build producción
- `npm run lint` - Verificar código

### Contribución
1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit cambios (`git commit -m 'Añadir nueva característica'`)
4. Push rama (`git push origin feature/nueva-caracteristica`)
5. Crear Pull Request

## 📝 Licencia

Este proyecto es para fines educativos como parte del curso de Organización de Computadoras.



*Proyecto Final - Organización de Computadoras 2025*
