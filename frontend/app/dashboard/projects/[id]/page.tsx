'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function DashboardProjectDetailRedirect() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  
  useEffect(() => {
    if (projectId) {
      router.replace(`/projects/${projectId}`);
    }
  }, [router, projectId]);

  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}

