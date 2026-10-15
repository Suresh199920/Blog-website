import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { ContactAside, ContactForm } from "@/components/contact/ContactForm";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();

  return {
    title: "Contact",
    description: `Get in touch with ${settings.site_title}.`,
    alternates: { canonical: "/contact" },
  };
}

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          Contact
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-600 sm:text-base">
          Questions, corrections, collaboration ideas or just a hello — all welcome.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <ContactForm contactEmail={settings.contact_email} />
        <ContactAside contactEmail={settings.contact_email} />
      </div>
    </div>
  );
}