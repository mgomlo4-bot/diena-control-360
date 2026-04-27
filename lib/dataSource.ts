export type DataSourceMode = 'localStorage' | 'database';

export const DATA_SOURCE_MODE: DataSourceMode = 'localStorage';

export function isDatabaseEnabled(): boolean {
  return DATA_SOURCE_MODE === 'database';
}

export function assertDatabaseDisabled(): void {
  if (isDatabaseEnabled()) {
    throw new Error('La capa de base de datos real aún no está activada en la interfaz.');
  }
}
