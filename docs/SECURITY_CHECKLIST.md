# Checklist de seguridad

## Principio

DIENA Control 360 puede contener información administrativa sensible. Antes de usar datos reales deben cerrarse autenticación, sesiones, roles, auditoría y protección de secretos.

## Repositorio

- [ ] El repositorio no contiene `.env` reales.
- [ ] El repositorio no contiene claves, tokens ni contraseñas.
- [ ] El repositorio no contiene CSV, XLSX, PDF o DOCX reales con datos personales.
- [ ] Los ejemplos usan datos ficticios.
- [ ] `.gitignore` bloquea ficheros sensibles.

## Variables y secretos

- [ ] `DATABASE_URL` está configurada solo como secreto del proveedor de hosting.
- [ ] No hay credenciales en código fuente.
- [ ] Las claves de IA, si existen, están solo en variables de entorno servidor.
- [ ] No se imprimen secretos en logs.

## Autenticación

- [ ] El acceso a módulos internos exige sesión.
- [ ] Existe usuario administrador inicial.
- [ ] Las contraseñas se almacenan con hash, nunca en claro.
- [ ] Las sesiones caducan.
- [ ] El cierre de sesión invalida sesión/token.

## Roles y permisos

- [ ] Existen roles mínimos: ADMIN y USER.
- [ ] Las operaciones críticas quedan reservadas a ADMIN o usuario autorizado.
- [ ] Las importaciones masivas requieren autorización.
- [ ] La eliminación de registros requiere confirmación y auditoría.

## Auditoría

- [ ] Las acciones críticas generan `AuditLog`.
- [ ] Se registra entidad afectada.
- [ ] Se registra acción.
- [ ] Se registra usuario o etiqueta de usuario.
- [ ] Se registra fecha.
- [ ] Se evita guardar datos excesivamente sensibles en logs.

## Datos personales

- [ ] El DNI se guarda enmascarado cuando no sea imprescindible.
- [ ] Los documentos reales no se almacenan en GitHub.
- [ ] Se limita el acceso a expedientes.
- [ ] Se define política de retención documental.

## Producción

- [ ] Base de datos con backup automático.
- [ ] Separación entre desarrollo y producción.
- [ ] Dominio/URL no pública de forma indiscriminada.
- [ ] Logs revisables.
- [ ] Plan de reversión ante fallo de despliegue.
