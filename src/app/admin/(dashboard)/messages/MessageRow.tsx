"use client";

import { useActionState } from "react";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import {
  markMessageReadAction,
  deleteMessageAction,
  type ActionState,
} from "../actions";
import type { ContactMessage } from "@/types/database";

const initialState: ActionState = {};

export function MessageRow({ message }: { message: ContactMessage }) {
  const [readState, readAction] = useActionState(
    markMessageReadAction,
    initialState
  );
  const [deleteState, deleteAction] = useActionState(
    deleteMessageAction,
    initialState
  );

  const date = new Date(message.created_at);

  return (
    <li
      className={`rounded-xl border bg-white p-5 shadow-sm ${
        message.is_read ? "border-neutral-200" : "border-primary-200 bg-primary-50/40"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2
              className={`font-medium ${
                message.is_read ? "text-neutral-700" : "text-neutral-900"
              }`}
            >
              {message.subject || "No subject"}
            </h2>
            {!message.is_read && (
              <span className="inline-flex items-center rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800">
                new
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-neutral-500">
            {message.name} ·{" "}
            <a
              href={`mailto:${message.email}`}
              className="text-primary-600 hover:text-primary-700"
            >
              {message.email}
            </a>{" "}
            ·{" "}
            <time dateTime={message.created_at}>
              {date.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {!message.is_read && (
            <form action={readAction}>
              <input type="hidden" name="id" value={message.id} />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                <MailOpen className="size-4" aria-hidden />
                Mark read
              </button>
            </form>
          )}

          <form action={deleteAction}>
            <input type="hidden" name="id" value={message.id} />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
            >
              <Trash2 className="size-4" aria-hidden />
              Delete
            </button>
          </form>
        </div>
      </div>

      <p className="mt-4 whitespace-pre-wrap rounded-lg bg-neutral-50 px-4 py-3 text-sm leading-relaxed text-neutral-700">
        {message.message}
      </p>

      {(readState.error || deleteState.error) && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {readState.error ?? deleteState.error}
        </p>
      )}

      <a
        href={`mailto:${message.email}?subject=${encodeURIComponent(
          `Re: ${message.subject || "Your message"}`
        )}`}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
      >
        <Mail className="size-4" aria-hidden />
        Reply
      </a>
    </li>
  );
}