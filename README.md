# 🎓 Sistema de Gestión de Proyectos de Grado

> Aplicación web para la gestión integral de proyectos de grado universitarios, desde la propuesta inicial hasta la aprobación final.

## 📊 Funcionalidades Principales

- Gestión de Usuarios
Registro y administración de estudiantes, docentes y coordinadores.

- Registro de Proyectos
Creación, actualización y seguimiento de propuestas de grado.

- Flujo de Aprobación
Validación por parte de docentes, jurados y coordinadores académicos.

- Control de Estados
Proyecto en propuesta, en desarrollo, pendiente de revisión, aprobado o rechazado.

- Reportes y Seguimiento
Generación de reportes de avance y panel de control para coordinadores.

## 🛠️ ecnologías & Herramientas

<div align="center">
🌐 Frontend

<img alt="Angular" src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white"/> <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/> <img alt="HTML5" src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"/> <img alt="CSS3" src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white"/>
<hr />
⚙️ Backend
<img alt="Laravel" src="https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white"/> <img alt="PHP" src="https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white"/>
<hr />
🗄️ Base de datos
<img alt="MySQL" src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/>

<hr />
🚀 Herramientas de desarrollo
<img alt="Git" src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white"/> <img alt="GitHub" src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white"/> <img alt="Composer" src="https://img.shields.io/badge/Composer-885630?style=for-the-badge&logo=composer&logoColor=white"/> <img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white"/> <img alt="NPM" src="https://img.shields.io/badge/NPM-CB3837?style=for-the-badge&logo=npm&logoColor=white"/> <img alt="Postman" src="https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white"/> <img alt="VS Code" src="https://img.shields.io/badge/VS%20Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white"/> </div>

## 🔧 RequerimientosNode
- Node.js y Angular CLI
- PHP 8.x y Composer
- MySQL 8.x
- Git   

## 📂 Estructura del proyecto
```bash
proyecto-grado/
│── frontend/       # Código Angular
│── backend/        # Código Laravel
│── database/       # Scripts y backups de MySQL
│── docs/           # Documentación y diagramas
│── README.md       # Documentación principal

```

## 🚀 Instalación y Ejecución
1. Clonar el repositorio
```bash
    git clone https://github.com/usuario/proyecto-grado.git
    cd proyecto-grado
```

2. ⚙️ Backend (Laravel)
```bash
    cd backend
    composer install
    cp .env.example .env
    php artisan key:generate
    php artisan migrate --seed
    php artisan serve
```
3. 🌐 Frontend (Angular)
```bash
    cd frontend
    npm install
    ng serve -o

```

## 📊 Roadmap

- Autenticación de usuarios
- CRUD de proyectos
- Módulo de revisión por asesores
- Sistema de notificaciones
- Reportes avanzados

## 📄 Licencia
- Este proyecto se encuentra bajo la licencia MIT.

## 👨‍💻 Aures

- David Leon – Backend & Database
- Gabriela Bazques
- Santiago Torres
- Sebastián Astudillo
- Juan Chaves
- 

<div align="center"> ⭐ Si este proyecto te parece útil, ¡apóyanos con una estrella! </div>
