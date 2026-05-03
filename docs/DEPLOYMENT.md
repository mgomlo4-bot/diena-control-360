# Despliegue online

## Objetivo

Publicar DIENA Control 360 como web app online privada, accesible desde navegador y sin instalación local para el usuario final.

## Plataforma recomendada

La opción principal recomendada es **Vercel**, por su integración directa con Next.js y GitHub.

Alternativas:

- Render, si se quiere alojar también backend propio.
- Railway, si se quiere desplegar app y PostgreSQL en el mismo ecosistema.
- Netlify, viable para Next.js pero menos directa que Vercel.

## Variables de entorno necesarias

En producción debe configurarse al menos:

```bash
DATABASE_URL="postgresql://USUARIO:PASSWORD@HOST:PUERTO/BASE_DE_DATOS?schema=public"
NEXT_TELEMETRY_DISABLED=1
```

No deben subirse variables reales al repositorio.

## Comandos de despliegue

Instalación:

```bash
npm install
```

Build:

```bash
npm run build
```

Arranque:

```bash
npm run start
```

El script de build ejecuta `prisma generate` antes de `next build` para asegurar que el cliente Prisma esté disponible.

## Migraciones

En producción, las migraciones deben ejecutarse de forma controlada:

```bash
npm run prisma:migrate
```

No se recomienda usar `prisma migrate dev` en producción.

## Checklist previo a producción

- [ ] `DATABASE_URL` configurada como secreto.
- [ ] PostgreSQL gestionado operativo.
- [ ] `npm run typecheck` correcto.
- [ ] `npm run build` correcto.
- [ ] Migraciones aplicadas.
- [ ] Usuario administrador inicial creado.
- [ ] Login verificado.
- [ ] Sesiones verificadas.
- [ ] Acceso anónimo bloqueado en áreas internas.
- [ ] No hay datos reales en GitHub.
- [ ] CI activo en Pull Requests.
- [ ] Despliegue automático desde `main` configurado.

## Criterio de despliegue válido

El despliegue será válido cuando un usuario autorizado pueda entrar desde una URL online, autenticarse y usar la aplicación completa sin instalar nada en su equipo.
