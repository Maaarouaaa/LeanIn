import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_PROFILE_ID } from "@/lib/constants";
import { resetMemoryStore } from "@/lib/data/memory";
import { SEED_CIRCLES } from "@/lib/data/seed";
import { POST } from "@/app/api/circles/[slug]/join-requests/route";

vi.mock("@/lib/auth", () => ({
  requireAuthenticatedMember: async () => DEMO_PROFILE_ID,
  getAuthenticatedMemberId: async () => DEMO_PROFILE_ID,
}));

describe("POST /api/circles/:slug/join-requests", () => {
  beforeEach(() => {
    resetMemoryStore();
  });

  it("persists a join request and returns id + status", async () => {
    const circle = SEED_CIRCLES[0];
    const response = await POST(
      new Request("http://localhost/api/circles/x/join-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: "Excited to join." }),
      }),
      { params: Promise.resolve({ slug: circle.slug }) },
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.id).toBeTruthy();
    expect(body.status).toBe("pending");
    expect(body.memberId).toBe(DEMO_PROFILE_ID);
    expect(body.circleId).toBe(circle.id);
  });

  it("blocks duplicate active requests", async () => {
    const circle = SEED_CIRCLES[2];
    const first = await POST(
      new Request("http://localhost/api/circles/x/join-requests", {
        method: "POST",
        body: JSON.stringify({}),
      }),
      { params: Promise.resolve({ slug: circle.slug }) },
    );
    expect(first.status).toBe(201);

    const second = await POST(
      new Request("http://localhost/api/circles/x/join-requests", {
        method: "POST",
        body: JSON.stringify({}),
      }),
      { params: Promise.resolve({ slug: circle.slug }) },
    );
    expect(second.status).toBe(409);
    const body = await second.json();
    expect(body.code).toBe("DUPLICATE_REQUEST");
  });

  it("validates note length", async () => {
    const circle = SEED_CIRCLES[1];
    const response = await POST(
      new Request("http://localhost/api/circles/x/join-requests", {
        method: "POST",
        body: JSON.stringify({ note: "x".repeat(1001) }),
      }),
      { params: Promise.resolve({ slug: circle.slug }) },
    );
    expect(response.status).toBe(400);
  });
});
