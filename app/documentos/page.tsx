import ModulePlaceholder from '../../components/ModulePlaceholder';

export default function DocumentosPage() {
  return (
    <ModulePlaceholder
      eyebrow="Documentación"
      title="Documentos y oficios"
      description="Módulo preparado para gestionar oficios, informes, propuestas, índices, notificaciones, convocatorias y actas."
      items={[
        'Oficios',
        'Informes',
        'Resoluciones',
        'Índices de expediente',
        'Plantillas DIENA',
        'Documentos vinculados',
      ]}
    />
  );
}
