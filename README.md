# 🎓 Degree Project Management System

> Web application for comprehensive management of university degree projects, from initial proposal to final approval.

## 📊 Main Features

- User Management  
  Registration and administration of students, professors, and coordinators.

- Project Registration  
  Creation, updating, and tracking of degree project proposals.

- Approval Workflow  
  Validation by professors, juries, and academic coordinators.

- Status Control  
  Project states: proposed, in progress, pending review, approved, or rejected.

- Reporting and Monitoring  
  Progress reports generation and control panel for coordinators.

## 🛠️ Technologies & Tools

<div align="center">
🌐 Frontend

<img alt="React" src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white"/>
<img alt="Next.js" src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white"/>
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
<img alt="HTML5" src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"/>
<img alt="CSS3" src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white"/>

<hr />
⚙️ Backend
<img alt="Express" src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white"/>

<hr />
🗄️ Database
<img alt="MySQL" src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/>
<img alt="Prisma" src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white"/>

<hr />
🚀 Development Tools
<img alt="Git" src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white"/>
<img alt="GitHub" src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white"/>
<img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
<img alt="pnpm" src="https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white"/>
<img alt="Postman" src="https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white"/>
<img alt="VS Code" src="https://img.shields.io/badge/VS%20Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white"/>
</div>

## 🔧 Requirements

- Node.js and Angular CLI
- PHP 8.x and Composer
- MySQL 8.x
- Git

## 📂 Project Structure

```bash
proyecto-grado/
│── frontend/       # UI code
│── backend/        # API code
    │── prisma/     # DB code
│── docs/           # Documentation and diagrams
│── README.md       # Main documentation

```

## 🚀 Installation and Running

1. Clone the repository

```bash
git clone git@github.com:davidleonmayor/proyecto-grado-unimayor.git
cd proyecto-grado-unimayor

```

2. ⚙️ docker

```bash
docker compose up -d
docker ps
```

3. ⚙️ env vars

```bash
cp backend/.env.example backend/.env
echo "DATABASE_URL="mysql://david:secret@db:3306/proyecto_grado" >> backend/.env
cp frontend/.env.example frontend/.env
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" >> frontend/.env
```

4. ⚙️ Verify that the database has the correct tables and data

```bash
docker exec -it proyecto_mysql mysql -u root -p
#¡IMPORTANT! THE PASSWORD IS IN THE compose.yaml -> IN THIS CASE IS root

# use the db and show the tables with content;
use proyecto_grado;
show tables;
select * from <table>;
```

<!-- 5. ⚙️ Get the latest DB version

```bash
docker exec -it backend pnpx prisma migrate

``` -->

6. ⚙️ Run devs

```bash
# backend
cd backend && pnpm dev
#frontend
cd frontend && pnpm dev
```

## 📥 Carga masiva de proyectos

1. Inicia sesión con un rol privilegiado (Decano, Coordinador, Director) y abre `Dashboard → Proyectos → Administración de Proyectos`.
2. En la tarjeta **“Carga masiva de proyectos”** selecciona un archivo Excel (`.xlsx` o `.xls`) con los encabezados descritos abajo y haz clic en **Importar proyectos**.
3. Revisa el resumen que muestra, fila por fila, si el registro fue importado o qué validaciones fallaron. Solo los proyectos válidos se crean en la base de datos.

### Columnas soportadas

| Columna        | Obligatoria | Descripción                                                                 |
| -------------- | ----------- | --------------------------------------------------------------------------- |
| `Titulo`       | Sí          | Nombre del proyecto (máx. 500 caracteres).                                  |
| `Resumen`      | No          | Descripción corta opcional.                                                 |
| `Modalidad`    | Sí          | Nombre de la modalidad registrada en `OPCION_GRADO`.                        |
| `Estado`       | Sí          | Nombre del estado definido en `ESTADO_TG`.                                  |
| `Programa`     | Sí          | Nombre del programa académico (`PROGRAMA_ACADEMICO`).                        |
| `Empresa`      | No          | Nombre de la empresa (si aplica).                                           |
| `Fecha_inicio` | Sí          | Formato `AAAA-MM-DD`.                                                        |
| `Fecha_fin`    | No          | Formato `AAAA-MM-DD`. Debe ser ≥ a `Fecha_inicio`.                           |
| `Estudiantes`  | Sí          | Documentos de identidad separados por `;` (máx. 2 por fila).                |
| `Asesores`     | No          | Documentos de identidad separados por `;` (máx. 2 por fila).                |

**Validaciones principales**

- Solo se aceptan archivos Excel válidos de hasta 5 MB.
- Cada fila debe hacer referencia a modalidades, estados, programas, empresas, estudiantes y asesores existentes.
- Se permiten máximo 2 estudiantes y 2 asesores por proyecto; los documentos no pueden repetirse entre filas.
- Se valida que los estudiantes no tengan proyectos activos y que las fechas sean coherentes.
- El backend devuelve un resumen detallado para corregir rápidamente cualquier fila rechazada.

## 📊 Roadmap

- User authentication
- Project CRUD
- Advisor review module
- Notification system
- Advanced reporting

## 📄 License

- This project is licensed under the MIT License.

## 👨‍💻 Contributors

- David Leon – Backend & Database
- Sebastián Astudillo – Backend & Database
- Gabriela Bazques – Backend & Database
- Santiago Torres – Frontend
- Juan Chaves – Frontend
- Alejandro Pito – Frontend

<div align="center"> ⭐ If you find this project useful, please support us with a star!</div>
