# Checklist final de produccion

## Codigo

- [ ] Rama de trabajo revisada mediante Pull Request.
- [ ] CI ejecutado correctamente.
- [ ] `npm run typecheck` correcto.
- [ ] `npm run build` correcto.
- [ ] No hay errores criticos de TypeScript.
- [ ] No hay datos reales hardcodeados.

## Base de datos

- [ ] PostgreSQL gestionado preparado.
- [ ] `DATABASE_URL` configurada como variable segura del entorno.
- [ ] Prisma Client generado.
- [ ] Migraciones aplicadas.
- [ ] Seed inicial ejecutado solo si procede.
- [ ] Copias de seguridad activadas.

## Seguridad

- [ ] Acceso interno protegido.
- [ ] Roles activos.
- [ ] Sesiones con caducidad.
- [ ] Credenciales tratadas mediante mecanismos seguros.
- [ ] Auditoria activa en acciones criticas.
- [ ] Importaciones controladas.
- [ ] Datos personales minimizados.

## Despliegue

- [ ] Plataforma online configurada.
- [ ] Build automatico desde GitHub.
- [ ] URL estable generada.
- [ ] Variables de entorno cargadas.
- [ ] Rutas internas verificadas.
- [ ] App probada desde navegador limpio.
- [ ] App probada desde movil/tablet si procede.

## Funcionalidad DIENA

- [ ] Dashboard carga KPIs.
- [ ] Cursos listan y filtran correctamente.
- [ ] Ficha de curso funciona.
- [ ] Hitos se calculan y visualizan.
- [ ] Instancias muestran estado y plazo.
- [ ] Tareas se gestionan correctamente.
- [ ] Documentos se asocian a entidades.
- [ ] Importaciones validan antes de cargar.
- [ ] Calendario muestra vencimientos.
- [ ] Auditoria registra cambios relevantes.

## Criterio final

La aplicacion solo debe considerarse apta para uso interno real cuando los apartados criticos esten verificados y exista una URL online estable accesible para usuarios autorizados sin instalacion local.
