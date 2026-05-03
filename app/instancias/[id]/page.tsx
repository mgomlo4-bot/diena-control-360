import InstanceDetailClient from '../../../components/InstanceDetailClient';

export default function InstanceDetailPage({ params }: { params: { id: string } }) {
  return <InstanceDetailClient instanceId={params.id} />;
}
