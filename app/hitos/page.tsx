import ModulePlaceholder from '../../components/ModulePlaceholder';

export default function HitosPage() {
  return (
    <ModulePlaceholder
      eyebrow="Planificación"
      title="Hitos y calendario"
      description="Vista preparada para consolidar hitos de cursos, fechas límite, vencimientos y calendario operativo de DIENA."
      items={[
        'Hitos por curso',
        'Calendario consolidado',
        'Vencimientos próximos',
        'Hitos vencidos',
        'Responsables',
        'Acciones derivadas',
      ]}
    />
  );
}
