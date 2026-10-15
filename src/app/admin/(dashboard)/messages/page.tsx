import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getAdminMessages } from "@/lib/admin-queries";
import { MessageRow } from "./MessageRow";

export const metadata: Metadata = {
  title: "Messages",
  robots: { index: false, follow: false },
};

export default async function AdminMessagesPage() {
  await requireAdmin();

  const { messages, unread } = await getAdminMessages();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Messages
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          {unread > 0
            ? `${unread} unread of ${messages.length}.`
            : messages.length
              ? "All caught up."
              : "No messages yet."}
        </p>
      </header>

      {messages.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center text-sm text-neutral-500">
          Nothing here yet. Submissions from the contact form land here.
        </p>
      ) : (
        <ul className="space-y-3">
          {messages.map((message) => (
            <MessageRow key={message.id} message={message} />
          ))}
        </ul>
      )}
    </div>
  );
}