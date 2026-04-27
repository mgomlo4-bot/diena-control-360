import CourseDetailClient from '../../../components/CourseDetailClient';
import { mockCourses } from '../../../lib/mockCourses';

export function generateStaticParams() {
  return mockCourses.map((course) => ({ id: course.id }));
}

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  return <CourseDetailClient courseId={params.id} />;
}
