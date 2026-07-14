import { Router, type IRouter } from "express";
import { db, licensesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { requireAdminAuth } from "../middleware/auth";

const router: IRouter = Router();

router.use(requireAdminAuth);

// Get all licenses
router.get("/admin/licenses", async (_req, res): Promise<void> => {
  try {
    const licenses = await db.select().from(licensesTable);
    res.json(licenses);
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch licenses",
    });
    return;
  }
});

// Generate a new license
router.post("/admin/licenses/generate", async (req, res): Promise<void> => {
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

    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Failed to generate license",
    });

    return;
  }
});

// Revoke a license
router.post(
  "/admin/licenses/:id/revoke",
  async (req, res): Promise<void> => {
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
        res.status(404).json({
          error: "License not found",
        });

        return;
      }

      res.json({
        success: true,
        license: updated,
      });

      return;
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: "Failed to revoke license",
      });

      return;
    }
  },
);

// View activated devices
router.get("/admin/devices", async (_req, res): Promise<void> => {
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

    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Failed to fetch devices",
    });

    return;
  }
});

export default router;