import { NextResponse } from "next/server";
import { requireAuthenticatedMember } from "@/lib/auth";
import { MAX_NOTE_LENGTH } from "@/lib/constants";
import { getDataStore } from "@/lib/data/store";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

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

    const store = getDataStore();
    const circle = await store.getCircleBySlug(slug);
    if (!circle) {
      return NextResponse.json({ error: "Circle not found." }, { status: 404 });
    }

    const existing = await store.getJoinRequest(memberId, circle.id);
    if (existing && existing.status === "pending") {
      return NextResponse.json(
        {
          error: "You already have an active request for this Circle.",
          code: "DUPLICATE_REQUEST",
          requestId: existing.id,
          status: existing.status,
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
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code: string }).code)
        : undefined;

    if (code === "DUPLICATE_REQUEST") {
      return NextResponse.json(
        {
          error: "You already have an active request for this Circle.",
          code,
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create join request.",
      },
      { status: 500 },
    );
  }
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const memberId = await requireAuthenticatedMember();
    const { slug } = await context.params;
    const store = getDataStore();
    const circle = await store.getCircleBySlug(slug);
    if (!circle) {
      return NextResponse.json({ error: "Circle not found." }, { status: 404 });
    }

    const existing = await store.getJoinRequest(memberId, circle.id);
    return NextResponse.json({ request: existing });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load join request.",
      },
      { status: 500 },
    );
  }
}
