import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(5000),
  // Honeypot field. Bots fill every input they find; humans never see it.
  website: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Checked before validation, so a filled honeypot gets a plain 200
    // rather than a validation error that tells the bot what tripped it.
    if (typeof body.website === "string" && body.website.length > 0) {
      return NextResponse.json({ success: true });
    }

    const validated = contactSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { error: "The site is not connected to a database yet." },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const insertData = {
      name: validated.data.name,
      email: validated.data.email,
      subject: validated.data.subject,
      message: validated.data.message,
    };

    const { error } = await supabase
      .from("contact_messages")
      .insert(insertData as never);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}