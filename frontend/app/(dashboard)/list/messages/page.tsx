"use client";
import { MessageForm } from '@/modules/messaging/components/MessageForm';

export default function MessagesPage() {
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <h1 className="text-center text-xl font-semibold">
        Notificar estado de Proyecto de grado
      </h1>

      <MessageForm />

      {/* LIST */}

    </div>
  );
}