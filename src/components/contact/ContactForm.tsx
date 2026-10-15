"use client";

import { useState } from "react";
import { CheckCircle2, Mail, Send, TriangleAlert } from "lucide-react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";

export function ContactForm({ contactEmail }: { contactEmail: string }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: "",
  });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const update = (key: keyof typeof form) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSending(true);
    setStatus("idle");
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok || !payload.success) {
        setStatus("error");
        setError(payload.error || "Something went wrong. Please try again.");
        return;
      }

      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "", website: "" });
    } catch {
      setStatus("error");
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setSending(false);
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-10 text-center">
        <CheckCircle2 className="mx-auto size-10 text-emerald-600" aria-hidden />
        <h2 className="mt-4 text-lg font-semibold text-emerald-900">
          Message sent
        </h2>
        <p className="mt-1.5 text-sm text-emerald-800">
          Thanks for reaching out — I&rsquo;ll reply soon.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={() => setStatus("idle")}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Your name"
              name="name"
              autoComplete="name"
              required
              maxLength={100}
              value={form.name}
              onChange={update("name")}
            />
            <Input
              label="Your email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={255}
              value={form.email}
              onChange={update("email")}
            />
          </div>

          <Input
            label="Subject"
            name="subject"
            required
            maxLength={200}
            value={form.subject}
            onChange={update("subject")}
          />

          <Textarea
            label="Message"
            name="message"
            required
            rows={6}
            maxLength={5000}
            placeholder="What would you like to say?"
            value={form.message}
            onChange={update("message")}
            hint={`${form.message.length} / 5000 characters`}
          />

          {/* Honeypot: hidden from humans, irresistible to bots. */}
          <div aria-hidden className="absolute h-0 w-0 overflow-hidden">
            <label htmlFor="contact-website">Website</label>
            <input
              id="contact-website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={update("website")}
            />
          </div>

          {status === "error" && error && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" isLoading={sending}>
              {!sending && <Send className="size-4" aria-hidden />}
              {sending ? "Sending…" : "Send message"}
            </Button>
            <p className="text-xs text-neutral-500">
              Or email{" "}
              <a
                href={`mailto:${contactEmail}`}
                className="font-medium text-primary-600 hover:text-primary-700"
              >
                {contactEmail}
              </a>
            </p>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

export function ContactAside({ contactEmail }: { contactEmail: string }) {
  return (
    <div className="space-y-5">
      <Card>
        <CardBody>
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-50">
              <Mail className="size-5 text-primary-600" aria-hidden />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-neutral-900">Email</h2>
              <a
                href={`mailto:${contactEmail}`}
                className="mt-1 block break-all text-sm text-primary-600 hover:text-primary-700"
              >
                {contactEmail}
              </a>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="text-sm leading-relaxed text-neutral-600">
          <h2 className="text-sm font-semibold text-neutral-900">
            What to expect
          </h2>
          <p className="mt-2">
            Messages land straight in the admin inbox. If something on the blog is
            wrong or unclear, tell me and I&rsquo;ll fix it.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}