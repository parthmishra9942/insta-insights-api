import { Router, type IRouter } from "express";
import { db, licensesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { requireAdminAuth } from "../middleware/auth";

const router: IRouter = Router();

router.use(requireAdminAuth);

// Get all licenses
router.get("/admin/licenses", async (_req, res) => {
  try {
    const licenses = await db.select().from(licensesTable);
    res.json(licenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch licenses",
    });
  }
});

// Generate a new license
router.post("/admin/licenses/generate", async (req, res) => {
  try {
    const duration = req.body.duration ?? "1month";

    const key =
      "INSIGHT-" +
      crypto.randomBytes(3).toString("hex").toUpperCase() +
      "-" +
      crypto.randomBytes(3).toString("hex").toUpperCase() +
      "-" +
      crypto.randomBytes(3).toString("hex").toUpperCase();

    const [license] = await db
      .insert(licensesTable)
      .values({
        key,
        duration,
        status: "unused",
      })
      .returning();

    res.json({
      success: true,
      license,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Failed to generate license",
    });
  }
});

// Revoke a license
router.post("/admin/licenses/:id/revoke", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [updated] = await db
      .update(licensesTable)
      .set({
        status: "revoked",
      })
      .where(eq(licensesTable.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({
        error: "License not found",
      });
    }

    res.json({
      success: true,
      license: updated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to revoke license",
    });
  }
});

// View activated devices
router.get("/admin/devices", async (_req, res) => {
  try {
    const devices = await db
      .select({
        key: licensesTable.key,
        deviceFingerprint: licensesTable.deviceFingerprint,
        activatedAt: licensesTable.activatedAt,
        expiresAt: licensesTable.expiresAt,
      })
      .from(licensesTable);

    res.json(devices);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch devices",
    });
  }
});

export default router;