export type DataSourceMode = 'localStorage' | 'database';

export const DATA_SOURCE_MODE: DataSourceMode =
  process.env.NEXT_PUBLIC_DATA_SOURCE_MODE === 'localStorage' ? 'localStorage' : 'database';

export function isDatabaseEnabled(): boolean {
  return DATA_SOURCE_MODE === 'database';
}

export function assertDatabaseEnabled(): void {
  if (!isDatabaseEnabled()) {
    throw new Error('La aplicación debe ejecutarse en modo database para uso real como web app centralizada.');
  }
}

export function assertDatabaseDisabled(): void {
  if (isDatabaseEnabled()) {
    throw new Error('Esta acción solo está disponible en modo prototipo localStorage.');
  }
}
