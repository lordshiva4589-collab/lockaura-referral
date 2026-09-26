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

    if (request.method === "POST" && url.pathname === "/password/save") {
      try {
        const body = await request.json();

        const question = String(body.question || "").trim();
        const answer = String(body.answer || "").trim();
        const password = String(body.password || "");
        const passwordType = String(body.passwordType || "Unknown").trim();

        if (!question || !answer || !password) {
          return Response.json(
            { success: false, error: "Missing required fields" },
            { status: 400 }
          );
        }

        await env.DB
          .prepare(
            "INSERT INTO passwords (question, answer, password, password_type, created_at) VALUES (?, ?, ?, ?, ?)"
          )
          .bind(
            question,
            answer,
            password,
            passwordType,
            new Date().toISOString()
          )
          .run();

        return Response.json({
          success: true,
          message: "Password saved"
        });
      } catch {
        return Response.json(
          { success: false, error: "Failed to save password" },
          { status: 500 }
        );
      }
    }

    if (request.method === "POST" && url.pathname === "/password/find") {
      try {
        const body = await request.json();

        const question = String(body.question || "").trim();
        const answer = String(body.answer || "").trim();

        if (!question || !answer) {
          return Response.json(
            { success: false, error: "Missing question or answer" },
            { status: 400 }
          );
        }

        const result = await env.DB
          .prepare(
            "SELECT password, password_type FROM passwords WHERE question = ? AND answer = ? ORDER BY id DESC LIMIT 1"
          )
          .bind(question, answer)
          .first();

        if (!result) {
          return Response.json({
            success: false,
            error: "Password not found"
          });
        }

        return Response.json({
          success: true,
          password: result.password,
          passwordType: result.password_type
        });
      } catch {
        return Response.json(
          { success: false, error: "Failed to find password" },
          { status: 500 }
        );
      }
    }

    return new Response("LockAura Referral API");
  }
};
