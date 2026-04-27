# DIENA CONTROL 360

**DIENA CONTROL 360** es una aplicación web interna diseñada para la Dirección de Enseñanza Naval (DIENA). Esta app sustituye los distintos Excel de trabajo y centraliza el control operativo de cursos, hitos, instancias, tareas, responsables, centros, documentos y calendario. Se ha creado utilizando **Next.js**, **TypeScript**, **Prisma** y **Tailwind CSS**, siguiendo un estilo oscuro, profesional y funcional.

## Objetivos

* Gestionar el ciclo de vida completo de un curso, desde su activación hasta su cierre, con un estado normalizado de 21 valores (por ejemplo, «NO ACTIVADO», «ACTIVADO», «PENDIENTE PRUEBAS FÍSICAS…», etc.).
* Crear y seguir hitos asociados a cada curso, con alertas de vencimiento y automatizaciones para generar hitos a partir de plantillas.
* Gestionar instancias y expedientes, incluyendo plazos, estados y tareas derivadas.
* Gestionar tareas operativas con vistas en lista, kanban, calendario y por responsable.
* Asociar documentos a cursos, instancias o tareas, con clasificación por categoría.
* Importar datos desde archivos **XLSX**, **XLS** y **CSV** utilizando un proceso de staging seguro que permite mapear columnas, validar datos y normalizar valores antes de cargar en la base de datos.
* Proporcionar un dashboard con indicadores clave (KPIs) y filtros globales por estado, tipo de curso, mes, año, escuela, responsable y código de curso.
* Ofrecer una interfaz de asistente documental preparada para integrarse con un motor de IA en el futuro.

## Estructura del proyecto

```text
diena-control-360/
├── README.md                # Documentación general del proyecto
├── package.json            # Definición de dependencias y scripts
├── tsconfig.json           # Configuración de TypeScript
├── next.config.js          # Configuración de Next.js
├── postcss.config.js       # Configuración de PostCSS
├── tailwind.config.js      # Configuración de Tailwind CSS
├── prisma/
│   ├── schema.prisma       # Modelos de datos y configuración de la base de datos
│   └── seed.ts             # Script para cargar datos demo y semillas iniciales
└── app/                    # Estructura de rutas (App Router de Next.js)
    ├── layout.tsx          # Layout base que se aplica a todas las páginas
    ├── page.tsx            # Página raíz con redirección o contenido inicial
    ├── dashboard/
    │   └── page.tsx        # Dashboard de KPIs y gráficos
    ├── cursos/
    │   ├── page.tsx        # Listado de cursos con filtros
    │   └── [id]/
    │       └── page.tsx    # Ficha individual de curso
    ├── hitos/
    │   └── page.tsx        # Listado y calendario de hitos
    ├── instancias/
    │   └── page.tsx        # Gestión de instancias y expedientes
    ├── tareas/
    │   └── page.tsx        # Gestión de tareas operativas
    ├── calendario/
    │   └── page.tsx        # Vista de calendario consolidado
    ├── responsables/
    │   └── page.tsx        # CRUD de responsables
    ├── centros/
    │   └── page.tsx        # CRUD de centros y organismos
    ├── documentos/
    │   └── page.tsx        # Gestión documental
    ├── importaciones/
    │   └── page.tsx        # Importación de archivos
    ├── asistente/
    │   └── page.tsx        # Interfaz del asistente DIENA
    └── configuracion/
        └── page.tsx        # Configuración y tablas maestras
```

Esta estructura proporciona un punto de partida para el desarrollo. Cada página incluye un componente principal que puede ampliarse para implementar formularios, tablas, filtros, gráficos y lógica específica según los requisitos descritos en el archivo de requisitos.

## Instalación y ejecución

1. **Instalar dependencias**: ejecuta `npm install` en la raíz del proyecto.
2. **Preparar la base de datos**: ejecuta `npx prisma migrate dev` para crear las tablas definidas en `schema.prisma`. Puedes utilizar SQLite en desarrollo (configurado por defecto) y preparar la compatibilidad con PostgreSQL modificando `schema.prisma`.
3. **Cargar datos de ejemplo**: ejecuta `npx prisma db seed` para insertar responsables, estados de curso, plantillas de hitos y algunos datos demo.
4. **Iniciar la aplicación**: ejecuta `npm run dev` y accede a `http://localhost:3000` en tu navegador.

## Próximos pasos

Este repositorio contiene un esqueleto inicial listo para evolucionar hacia la aplicación completa descrita en la hoja de ruta. Para continuar el desarrollo se recomienda:

1. Implementar los formularios y componentes CRUD para cada módulo.
2. Desarrollar los filtros y ordenaciones solicitados en cada página.
3. Completar el módulo de importaciones con mapeo de columnas y validación.
4. Añadir automatizaciones y alertas en backend (por ejemplo, en API routes o con cron jobs según necesidades).
5. Crear una integración real para el asistente documental cuando se disponga de un proveedor de IA.

Para más detalles sobre los requisitos funcionales y técnicos, revisa el archivo **DIENA_Control_360_Hoja_de_Ruta_Maestra_ACTUALIZADA_26042026.txt** en la raíz del proyecto o la documentación asociada a tu equipo.