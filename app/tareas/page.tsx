import ModulePlaceholder from '../../components/ModulePlaceholder';

export default function TareasPage() {
  return (
    <ModulePlaceholder
      eyebrow="Ejecución"
      title="Tareas operativas"
      description="Módulo preparado para gestionar tareas vinculadas a cursos, hitos, instancias, documentos y responsables."
      items={[
        'Tareas pendientes',
        'Tareas bloqueadas',
        'Tareas críticas',
        'Por responsable',
        'Por fecha límite',
        'Vinculación con hitos',
      ]}
    />
  );
}
