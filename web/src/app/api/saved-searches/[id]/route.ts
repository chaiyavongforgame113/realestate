import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { ok, err, handle } from "@/lib/api/respond";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return err("Unauthorized", 401);
    const { id } = await params;

    const saved = await prisma.savedSearch.findUnique({ where: { id } });
    if (!saved || saved.userId !== session.userId) return err("Not found", 404);

    await prisma.savedSearch.delete({ where: { id } });
    return ok({ ok: true });
  } catch (e) {
    return handle(e);
  }
}
