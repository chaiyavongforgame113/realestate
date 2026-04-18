import { Navbar } from "@/components/navbar";
import { Container } from "@/components/ui/container";

export default function SearchLoading() {
  return (
    <main className="min-h-screen bg-surface-soft">
      <Navbar />
      <Container className="pt-24 pb-10 md:pt-28">
        <div className="mb-4 h-14 w-full animate-pulse rounded-2xl bg-surface-sunken" />
        <div className="flex items-center justify-between gap-3">
          <div className="h-10 w-28 animate-pulse rounded-lg bg-surface-sunken" />
          <div className="h-10 w-64 animate-pulse rounded-lg bg-surface-sunken" />
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-line bg-white">
              <div className="h-56 animate-pulse bg-surface-sunken" />
              <div className="space-y-2 p-4">
                <div className="h-5 w-1/2 animate-pulse rounded bg-surface-sunken" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-surface-sunken" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-surface-sunken" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </main>
  );
}
