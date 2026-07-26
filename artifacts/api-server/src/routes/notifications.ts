import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/notifications
router.get("/notifications", async (req, res) => {
  const userId = parseInt(req.query.userId as string);
  if (!userId) return res.status(400).json({ error: "userId required" });

  const notifications = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, userId))
    .orderBy(notificationsTable.createdAt);

  return res.json(
    notifications.map((n) => ({
      id: n.id,
      userId: n.userId,
      title: n.title,
      message: n.message,
      read: n.read,
      type: n.type ?? null,
      createdAt: n.createdAt.toISOString(),
    }))
  );
});

// PUT /api/notifications/:id/read
router.put("/notifications/:id/read", async (req, res) => {
  const id = parseInt(req.params.id);
  const [notification] = await db
    .update(notificationsTable)
    .set({ read: true })
    .where(eq(notificationsTable.id, id))
    .returning();

  if (!notification) return res.status(404).json({ error: "Notification not found" });

  return res.json({
    id: notification.id,
    userId: notification.userId,
    title: notification.title,
    message: notification.message,
    read: notification.read,
    type: notification.type ?? null,
    createdAt: notification.createdAt.toISOString(),
  });
});

export default router;
