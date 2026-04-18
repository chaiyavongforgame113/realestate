import { getCurrentUser } from "@/lib/auth/session";
import { ok, err, handle } from "@/lib/api/respond";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return err("Unauthorized", 401);

    return ok({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        firstName: user.profile?.firstName ?? null,
        lastName: user.profile?.lastName ?? null,
        avatarUrl: user.profile?.avatarUrl ?? null,
        agent: user.agentProfile
          ? {
              displayName: user.agentProfile.displayName,
              verifiedAt: user.agentProfile.verifiedAt,
              rating: user.agentProfile.rating,
            }
          : null,
      },
    });
  } catch (e) {
    return handle(e);
  }
}
