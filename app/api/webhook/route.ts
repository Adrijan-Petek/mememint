import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/utils/database/server";
import { ParseWebhookEvent, parseWebhookEvent } from "@farcaster/miniapp-node";
import { randomUUID } from "crypto";

type WebhookPayload = {
  header: string;
  payload: string;
  signature: string;
};

type NotificationDetails = {
  url?: string;
  token?: string;
};

type EventPayload = {
  event: "miniapp_added" | "miniapp_removed" | "notifications_enabled" | "notifications_disabled";
  notificationDetails?: NotificationDetails;
};

const UNKNOWN_APP_FID = 0;

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, "base64").toString("utf-8");
}

async function ensureTable() {
  await sql(`
    CREATE TABLE IF NOT EXISTS notification_tokens (
      fid BIGINT NOT NULL,
      app_fid BIGINT NOT NULL,
      notification_url TEXT,
      notification_token TEXT,
      enabled BOOLEAN NOT NULL DEFAULT true,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (fid, app_fid)
    )
  `);
}

async function parseEvent(requestJson: WebhookPayload) {
  const header = JSON.parse(decodeBase64Url(requestJson.header));
  const payload = JSON.parse(decodeBase64Url(requestJson.payload));
  return {
    fid: Number(header?.fid ?? 0),
    appFid: Number(header?.fid ?? 0) || UNKNOWN_APP_FID,
    event: payload as EventPayload,
  };
}

async function upsertNotification(fid: number, appFid: number, details?: NotificationDetails) {
  const url = details?.url ?? null;
  const token = details?.token ?? null;
  await sql(
    `INSERT INTO notification_tokens (fid, app_fid, notification_url, notification_token, enabled, updated_at)
     VALUES ($1, $2, $3, $4, true, NOW())
     ON CONFLICT (fid, app_fid)
     DO UPDATE SET notification_url = EXCLUDED.notification_url,
                   notification_token = EXCLUDED.notification_token,
                   enabled = true,
                   updated_at = EXCLUDED.updated_at`,
    [fid, appFid, url, token]
  );
}

async function disableNotification(fid: number, appFid: number) {
  await sql(
    `UPDATE notification_tokens
     SET enabled = false,
         notification_url = NULL,
         notification_token = NULL,
         updated_at = NOW()
     WHERE fid = $1 AND app_fid = $2`,
    [fid, appFid]
  );
}

async function sendMiniAppNotification({
  notificationUrl,
  token,
  title,
  body,
  targetUrl,
}: {
  notificationUrl: string;
  token: string;
  title: string;
  body: string;
  targetUrl: string;
}) {
  await fetch(notificationUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      notificationId: randomUUID(),
      title,
      body,
      targetUrl,
      tokens: [token],
    }),
  });
}

export async function POST(request: NextRequest) {
  let requestJson: WebhookPayload;
  try {
    requestJson = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  try {
    await ensureTable();

    const { fid, appFid, event } = await parseEvent(requestJson);
    if (!fid || Number.isNaN(fid)) {
      return NextResponse.json({ ok: false, error: "missing_fid" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_URL || request.nextUrl.origin;

    switch (event.event) {
      case "miniapp_added":
      case "notifications_enabled":
        if (event.notificationDetails) {
          await upsertNotification(fid, appFid ?? UNKNOWN_APP_FID, event.notificationDetails);
          await sendMiniAppNotification({
            notificationUrl: event.notificationDetails.url ?? "",
            token: event.notificationDetails.token ?? "",
            title: "Welcome to Mememint",
            body: "Mini app added — you're ready to mint and play.",
            targetUrl: appUrl,
          });
        }
        break;
      case "miniapp_removed":
      case "notifications_disabled":
        await disableNotification(fid, appFid ?? UNKNOWN_APP_FID);
        break;
      default:
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const err = error as ParseWebhookEvent.ErrorType | Error;
    return NextResponse.json(
      { ok: false, error: err?.name || "webhook_error" },
      { status: 400 }
    );
  }
}
