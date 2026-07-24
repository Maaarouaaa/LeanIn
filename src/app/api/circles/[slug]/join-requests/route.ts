import { NextResponse } from "next/server";
import { requireAuthenticatedMember } from "@/lib/auth";
import { MAX_NOTE_LENGTH } from "@/lib/constants";
import { getDataStore } from "@/lib/data/store";
import { logSupabaseError } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

const DUPLICATE_MESSAGE = "You already have a request for this Circle.";

export async function POST(request: Request, context: RouteContext) {
  try {
    const memberId = await requireAuthenticatedMember();
    if (!memberId) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const { slug } = await context.params;
    const body = (await request.json().catch(() => ({}))) as {
      note?: string;
    };

    if (body.note && body.note.length > MAX_NOTE_LENGTH) {
      return NextResponse.json(
        {
          error: `Notes must be ${MAX_NOTE_LENGTH} characters or fewer.`,
        },
        { status: 400 },
      );
    }

    const store = await getDataStore();
    const circle = await store.getCircleBySlug(slug);
    if (!circle) {
      return NextResponse.json({ error: "Circle not found." }, { status: 404 });
    }

    // Scoped by profile + Circle; any prior row blocks a second request.
    const existing = await store.getJoinRequest(memberId, circle.id);
    if (existing) {
      return NextResponse.json(
        {
          error: DUPLICATE_MESSAGE,
          code: "DUPLICATE_REQUEST",
          requestId: existing.id,
          status: existing.status,
          circleId: existing.circleId,
          memberId: existing.profileId,
        },
        { status: 409 },
      );
    }

    const saved = await store.createJoinRequest({
      profileId: memberId,
      circleId: circle.id,
      note: body.note,
    });

    return NextResponse.json(
      {
        id: saved.id,
        status: saved.status,
        circleId: saved.circleId,
        memberId: saved.profileId,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
      },
      { status: 201 },
    );
  } catch (error) {
    logSupabaseError("join-requests API failed", error);
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code: string }).code)
        : undefined;

    if (code === "DUPLICATE_REQUEST") {
      return NextResponse.json(
        {
          error: DUPLICATE_MESSAGE,
          code,
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Unable to create join request. Please try again." },
      { status: 500 },
    );
  }
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const memberId = await requireAuthenticatedMember();
    const { slug } = await context.params;
    const store = await getDataStore();
    const circle = await store.getCircleBySlug(slug);
    if (!circle) {
      return NextResponse.json({ error: "Circle not found." }, { status: 404 });
    }

    const existing = await store.getJoinRequest(memberId, circle.id);
    return NextResponse.json({ request: existing });
  } catch (error) {
    logSupabaseError("join-requests API failed", error);
    return NextResponse.json(
      { error: "Unable to load join request." },
      { status: 500 },
    );
  }
}
