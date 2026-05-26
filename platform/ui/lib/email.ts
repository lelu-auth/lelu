const FROM = "Lelu <noreply@lelu-ai.com>";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://lelu-ai.com";

async function send(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping email send.");
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[email] Resend error:", res.status, body);
    throw new Error("Failed to send email");
  }
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
): Promise<void> {
  const link = `${BASE_URL}/api/auth/verify-email?token=${token}`;
  const firstName = name.split(" ")[0];

  await send(
    to,
    "Verify your Lelu account",
    `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #E7E5E4;border-radius:12px;overflow:hidden;">

        <tr>
          <td style="background:#0A0A0A;padding:28px 40px;text-align:center;">
            <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.02em;">lelu</span>
          </td>
        </tr>

        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0A0A0A;letter-spacing:-0.02em;">
              Verify your email
            </p>
            <p style="margin:0 0 28px;font-size:15px;color:#737373;line-height:1.6;">
              Hi ${firstName}, thanks for signing up. Click the button below to verify your email address and activate your account.
            </p>

            <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td style="background:#0A0A0A;border-radius:8px;">
                  <a href="${link}"
                     style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:-0.01em;">
                    Verify email address →
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 6px;font-size:13px;color:#A3A3A3;">
              This link expires in 24 hours. If you didn't create a Lelu account, you can ignore this email.
            </p>
            <p style="margin:0;font-size:12px;color:#C4C4C4;word-break:break-all;">
              ${link}
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:20px 40px;border-top:1px solid #E7E5E4;">
            <p style="margin:0;font-size:12px;color:#A3A3A3;text-align:center;">
              © ${new Date().getFullYear()} Lelu · <a href="${BASE_URL}" style="color:#A3A3A3;">lelu-ai.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
  );
}
