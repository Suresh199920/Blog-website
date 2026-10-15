import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { SettingsForm } from "./SettingsForm";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  await requireAdmin();

  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          These values are stored in the database and update the public site
          immediately.
        </p>
      </header>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}