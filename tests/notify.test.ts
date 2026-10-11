import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import { notifyNewSighting } from "@/lib/notify";

const notice = {
  id: "abc",
  imageUrl: "https://x.supabase.co/storage/v1/object/public/sightings/u/abc.jpg",
  placeName: "Hudiksvall",
  country: "SE",
  sightedAt: new Date("2026-10-11T12:00:00Z"),
  description: '<script>alert("x")</script> on the bus',
  displayName: "Milla",
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("notifyNewSighting", () => {
  it("does nothing without configuration", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("ADMIN_NOTIFY_EMAIL", "");
    await notifyNewSighting(notice);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends an escaped e-mail via Resend", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("ADMIN_NOTIFY_EMAIL", "a@example.com, b@example.com");
    await notifyNewSighting(notice);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.headers.Authorization).toBe("Bearer re_test");
    const body = JSON.parse(init.body);
    expect(body.to).toEqual(["a@example.com", "b@example.com"]);
    expect(body.subject).toBe("🎩 New sighting: Hudiksvall, Sweden");
    expect(body.html).toContain("abc_thumb.jpg");
    expect(body.html).toContain("/s/abc");
    expect(body.html).not.toContain("<script>");
    expect(body.html).toContain("&lt;script&gt;");
  });

  it("never throws if Resend fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("ADMIN_NOTIFY_EMAIL", "a@example.com");
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(notifyNewSighting(notice)).resolves.toBeUndefined();
    spy.mockRestore();
  });
});
