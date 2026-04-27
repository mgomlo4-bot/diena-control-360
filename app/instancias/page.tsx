import ModulePlaceholder from '../../components/ModulePlaceholder';

export default function InstanciasPage() {
  return (
    <ModulePlaceholder
      eyebrow="Expedientes"
      title="Instancias y expedientes"
      description="Módulo preparado para registrar instancias, informes solicitados, propuestas de resolución, notificaciones y recursos."
      items={[
        'Instancias recibidas',
        'Pendientes de informe',
        'Informes recibidos',
        'Borradores de resolución',
        'Notificaciones',
        'Recursos vinculados',
      ]}
    />
  );
}
