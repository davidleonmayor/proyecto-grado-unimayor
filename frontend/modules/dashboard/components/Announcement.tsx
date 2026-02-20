"use client"

export default function Announcement() {
    return (
        <div className="bg-white p-4 rounded-md">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Anuncios</h1>
                <span className="text-sm text-gray-400">Ver todo</span>
            </div>
            <div className="flex flex-col gap-4 mt-4">
                <div className="bg-secondary rounded-md p-4 ">
                    <div className="flex items-center justify-between">
                        <h2 className="text-medium">Lorem ipsum dolor sit amet</h2>
                        <span className="text-sm text-gray-400 bg-white rounded-md px-1 py-1">2025-01-01</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        A earum ducimus iste facilis
                    </p>
                </div>

            </div>
            <div className="flex flex-col gap-4 mt-4">
                <div className="bg-principal rounded-md p-4 ">
                    <div className="flex items-center justify-between">
                        <h2 className="text-medium">Lorem ipsum dolor sit amet</h2>
                        <span className="text-sm text-gray-400 bg-white rounded-md px-1 py-1">2025-01-01</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        A earum ducimus iste facilis
                    </p>
                </div>

            </div>
            <div className="flex flex-col gap-4 mt-4">
                <div className="bg-tertiary rounded-md p-4 ">
                    <div className="flex items-center justify-between">
                        <h2 className="text-medium">Lorem ipsum dolor sit amet</h2>
                        <span className="text-sm text-gray-400 bg-white rounded-md px-1 py-1">2025-01-01</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        A earum ducimus iste facilis
                    </p>
                </div>

            </div>
        </div>
    )
}
