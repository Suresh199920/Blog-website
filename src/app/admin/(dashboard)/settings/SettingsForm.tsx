"use client";

import { useActionState } from "react";
import { saveSettings, type ActionState } from "../actions";
import type { SiteSettings } from "@/lib/settings";

const initialState: ActionState = {};

const inputClass =
  "mt-1.5 block h-11 w-full rounded-lg border border-neutral-300 bg-white px-3.5 text-sm text-neutral-900 shadow-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100";

const textareaClass =
  "mt-1.5 block w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, action] = useActionState(saveSettings, initialState);

  return (
    <form action={action} className="space-y-6">
      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800"
        >
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800">
          {state.success}
        </p>
      )}

      <div>
        <label htmlFor="site_title" className="block text-sm font-medium text-neutral-700">
          Site title
        </label>
        <input
          id="site_title"
          name="site_title"
          required
          defaultValue={settings.site_title}
          className={inputClass}
        />
        <p className="mt-1.5 text-xs text-neutral-500">
          Used in the header, page titles and search results.
        </p>
      </div>

      <div>
        <label htmlFor="site_tagline" className="block text-sm font-medium text-neutral-700">
          Tagline
        </label>
        <input
          id="site_tagline"
          name="site_tagline"
          defaultValue={settings.site_tagline}
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="site_description"
          className="block text-sm font-medium text-neutral-700"
        >
          Meta description
        </label>
        <textarea
          id="site_description"
          name="site_description"
          rows={2}
          defaultValue={settings.site_description}
          className={textareaClass}
        />
        <p className="mt-1.5 text-xs text-neutral-500">
          The summary search engines show. Around 150–160 characters works best.
        </p>
      </div>

      <div>
        <label htmlFor="contact_email" className="block text-sm font-medium text-neutral-700">
          Contact email
        </label>
        <input
          id="contact_email"
          name="contact_email"
          type="email"
          defaultValue={settings.contact_email}
          className={inputClass}
        />
        <p className="mt-1.5 text-xs text-neutral-500">
          Shown on the contact and about pages, and replies go here.
        </p>
      </div>

      <div>
        <label htmlFor="about_body" className="block text-sm font-medium text-neutral-700">
          About page content
        </label>
        <textarea
          id="about_body"
          name="about_body"
          rows={14}
          defaultValue={settings.about_body}
          placeholder="Tell visitors who you are and what you write about. Markdown is supported."
          className={`${textareaClass} font-mono`}
        />
      </div>

      <div className="border-t border-neutral-200 pt-6">
        <button
          type="submit"
          className="inline-flex h-10 items-center rounded-lg bg-primary-600 px-5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          Save settings
        </button>
      </div>
    </form>
  );
}