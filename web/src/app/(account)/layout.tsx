import Image from "next/image";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Container } from "@/components/ui/container";
import { AccountNav } from "@/components/account-nav";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const firstName = user?.profile?.firstName ?? "";
  const lastName = user?.profile?.lastName ?? "";
  const fullName = `${firstName} ${lastName}`.trim() || user?.email?.split("@")[0] || "ผู้ใช้";
  const initial = (firstName?.[0] || user?.email?.[0] || "?").toUpperCase();
  const avatarUrl = user?.profile?.avatarUrl ?? null;

  return (
    <main>
      <Navbar />
      <div className="pt-24 md:pt-28">
        <Container>
          <div className="grid grid-cols-1 gap-6 pb-16 lg:grid-cols-[240px_1fr]">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="mb-4 rounded-2xl border border-line bg-white p-4 shadow-soft">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-brand text-base font-semibold text-white">
                    {avatarUrl ? (
                      <Image src={avatarUrl} alt={fullName} fill sizes="44px" className="object-cover" />
                    ) : (
                      initial
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-display text-sm font-bold">{fullName}</div>
                    <div className="truncate text-xs text-ink-muted">{user?.email ?? ""}</div>
                  </div>
                </div>
              </div>
              <AccountNav />
            </aside>
            <div>{children}</div>
          </div>
        </Container>
      </div>
      <Footer />
    </main>
  );
}
