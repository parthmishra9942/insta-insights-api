import { Router, type IRouter } from "express";
import crypto from "node:crypto";
import { db, licensesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const licenseDuration = z.enum(["1month", "lifetime"]);

const generateRequestSchema = z.object({
  count: z.number().int().min(1).max(100).default(1),
  duration: licenseDuration,
  adminSecret: z.string().min(1),
});

const activateRequestSchema = z.object({
  key: z.string().min(1),
  deviceFingerprint: z.string().min(1),
});

const validateRequestSchema = z.object({
  key: z.string().min(1),
  deviceFingerprint: z.string().min(1),
});

const ADMIN_SECRET = process.env["ADMIN_LICENSE_SECRET"];

function generateLicenseKey(): string {
  const segments: string[] = [];

  for (let i = 0; i < 3; i++) {
    segments.push(
      crypto.randomBytes(4).toString("hex").toUpperCase().slice(0, 6)
    );
  }

  return `INSIGHT-${segments.join("-")}`;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

const router: IRouter = Router();

router.post("/licenses/generate", async (req, res) => {
  const parseResult = generateRequestSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      error: "Invalid request",
      details: parseResult.error.format(),
    });
    return;
  }

  const { count, duration, adminSecret } = parseResult.data;

  if (!ADMIN_SECRET || adminSecret !== ADMIN_SECRET) {
    res.status(401).json({
      error: "Unauthorized",
    });
    return;
  }

  const keys: string[] = [];

  for (let i = 0; i < count; i++) {
    keys.push(generateLicenseKey());
  }

  try {
    await db.insert(licensesTable).values(
      keys.map((key) => ({
        key,
        duration,
        status: "unused" as const,
      }))
    );

    res.json({ keys });
  } catch (err) {
    req.log.error({ err }, "Failed to generate licenses");

    res.status(500).json({
      error: "Failed to generate licenses",
    });
  }
});

router.post("/licenses/activate", async (req, res) => {
  const parseResult = activateRequestSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      error: "Invalid request",
      details: parseResult.error.format(),
    });
    return;
  }

  const { key, deviceFingerprint } = parseResult.data;

  try {
    const [existing] = await db
      .select()
      .from(licensesTable)
      .where(eq(licensesTable.key, key))
      .limit(1);

    if (!existing) {
      res.status(404).json({
        error: "License key not found",
      });
      return;
    }

    if (existing.status === "revoked") {
      res.status(410).json({
        error: "License key has been revoked",
      });
      return;
    }

    if (existing.status === "active") {
      if (existing.expiresAt && new Date(existing.expiresAt) < new Date()) {
        res.status(410).json({
          error: "License key has expired",
        });
        return;
      }

      if (existing.deviceFingerprint !== deviceFingerprint) {
        res.status(403).json({
          error: "License is already activated on another device",
        });
        return;
      }

      res.json({
        valid: true,
        duration: existing.duration,
        activatedAt: existing.activatedAt,
        expiresAt: existing.expiresAt,
      });

      return;
    }

    const activatedAt = new Date();

    const expiresAt =
      existing.duration === "1month"
        ? addMonths(activatedAt, 1)
        : null;

    const [updated] = await db
      .update(licensesTable)
      .set({
        status: "active",
        activatedAt,
        expiresAt,
        deviceFingerprint,
      })
      .where(eq(licensesTable.key, key))
      .returning();

    res.json({
      valid: true,
      duration: updated.duration,
      activatedAt: updated.activatedAt,
      expiresAt: updated.expiresAt,
    });
  } catch (err) {
    console.error(err);

    req.log.error({ err }, "Failed to activate license");

    res.status(500).json({
      error: "Failed to activate license",
    });
  }
});

router.post("/licenses/validate", async (req, res) => {
  const parseResult = validateRequestSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      error: "Invalid request",
      details: parseResult.error.format(),
    });
    return;
  }

  const { key, deviceFingerprint } = parseResult.data;

  try {
    const [existing] = await db
      .select()
      .from(licensesTable)
      .where(eq(licensesTable.key, key))
      .limit(1);

    if (!existing) {
      res.json({
        valid: false,
        status: "not_found",
      });
      return;
    }

    if (existing.status === "revoked") {
      res.json({
        valid: false,
        status: "revoked",
      });
      return;
    }

    if (existing.status !== "active") {
      res.json({
        valid: false,
        status: existing.status,
      });
      return;
    }

    if (
      existing.deviceFingerprint &&
      existing.deviceFingerprint !== deviceFingerprint
    ) {
      res.json({
        valid: false,
        status: "device_mismatch",
      });
      return;
    }

    if (existing.expiresAt && new Date(existing.expiresAt) < new Date()) {
      res.json({
        valid: false,
        status: "expired",
        expiresAt: existing.expiresAt,
      });
      return;
    }

    res.json({
      valid: true,
      status: "active",
      duration: existing.duration,
      activatedAt: existing.activatedAt,
      expiresAt: existing.expiresAt,
    });
  } catch (err) {
    console.error(err);

    req.log.error({ err }, "Failed to validate license");

    res.status(500).json({
      error: "Failed to validate license",
      details: String(err),
    });
  }
});

export default router;