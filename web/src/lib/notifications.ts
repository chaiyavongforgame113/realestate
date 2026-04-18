import type { NotificationType, PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "./prisma";

interface CreateNotification {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

/**
 * Create a notification. Accepts an optional tx client so callers can
 * wrap multiple writes in a single Prisma transaction.
 */
export async function notify(
  input: CreateNotification,
  tx?: Pick<PrismaClient, "notification">
) {
  const client = tx ?? defaultPrisma;
  return client.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link,
    },
  });
}
