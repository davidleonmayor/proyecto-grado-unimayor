'use client';

import BigCalendar from '@/modules/events/components/BigCalendar';
import EventCalendar from '@/modules/events/components/EventCalendar';
import RoleProtectedRoute from '@/shared/components/layout/RoleProtectedRoute';
import "react-big-calendar/lib/css/react-big-calendar.css";

function StudentPageContent(){
  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
        {/* LEFT */}
        <div className="w-full xl:w-2/3">
            <div className="h-full bg-white p-4 rounded-md">
                <h1 className="text-xl font-semibold">Horarios</h1>
                <BigCalendar />
            </div>
        </div>
        {/* RIGHT */}
        <div className="w-full xl:w-1/3 flex flex-col gap-8">
            <EventCalendar />
        </div>
    </div>
  )
}

export default function StudentPage() {
  return (
    <RoleProtectedRoute allowedRoles={['student']} redirectTo="/teacher">
      <StudentPageContent />
    </RoleProtectedRoute>
  );
}
