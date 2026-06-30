import { prisma } from "@/lib/prisma";

// Writes an audit log entry. Never throws — logging must not break the main action.
export async function logAction(
  user: { id: string; name: string; shopId: string },
  action: string,
  details?: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        action: action,
        details: details || null,
        shopId: user.shopId,
        userId: user.id,
        userName: user.name,
      },
    });
  } catch (e) {
    // If logging fails, we ignore it so the main action still succeeds.
    console.error("Audit log failed:", e);
  }
}