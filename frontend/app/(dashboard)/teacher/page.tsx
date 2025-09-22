import Announcement from "@/app/components/Announcement";
import BigCalendar from "@/app/components/BigCalendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

export default function TeacherPage(){
  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
        {/* LEFT */}
        <div className="w-full xl:w-2/3">
            <div className="h-full bg-white p-4 rounded-md">
                <h1 className="text-xl font-semibold">Horarios</h1>
                <BigCalendar />
            </div>
        </div>
        {/* RIGHT */}
        <div className="w-full xl:w-1/3 flex flex-col gap-8">
            <Announcement />
        </div>
    </div>
  )
}
