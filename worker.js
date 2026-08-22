export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/referral") {
      try {
        const body = await request.json();
        const referralId = String(body.referralId || "").trim();

        if (!/^[A-Za-z0-9_-]{1,64}$/.test(referralId)) {
          return Response.json(
            { success: false, error: "Invalid referral ID" },
            { status: 400 }
          );
        }

        await env.DB
          .prepare(
            "INSERT INTO referrals (referral_id, created_at) VALUES (?, ?)"
          )
          .bind(referralId, new Date().toISOString())
          .run();

        return Response.json({
          success: true,
          message: "Referral recorded"
        });
      } catch {
        return Response.json(
          { success: false, error: "Invalid request" },
          { status: 400 }
        );
      }
    }

    return new Response("LockAura Referral API");
  }
};
