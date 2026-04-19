import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Container } from "@/components/ui/container";
import { ListingGallery } from "@/components/listing-detail/listing-gallery";
import { ListingInfo } from "@/components/listing-detail/listing-info";
import { AgentCard } from "@/components/listing-detail/agent-card";
import { EnquiryForm } from "@/components/listing-detail/enquiry-form";
import { LocationMap } from "@/components/listing-detail/location-map";
import { SimilarListings } from "@/components/listing-detail/similar-listings";
import { VirtualTour } from "@/components/listing-detail/virtual-tour";
import { BookViewing } from "@/components/appointments/book-viewing";
import { ReviewPanel } from "@/components/reviews/review-panel";
import { VerifiedBadge } from "@/components/chain/verified-badge";
import { ReserveButton } from "@/components/payments/reserve-button";
import { MortgageCalculator } from "@/components/listing-detail/mortgage-calculator";
import { NeighborhoodInsights } from "@/components/listing-detail/neighborhood-insights";
import { prisma } from "@/lib/prisma";
import { toListingDTO } from "@/lib/listings/transform";
import { toCardView } from "@/lib/listings/adapter";

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const record = await prisma.listing.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      agent: { include: { profile: true, agentProfile: true } },
    },
  });

  if (!record || record.status !== "published") notFound();

  const dto = toListingDTO(record);
  const cardView = toCardView(dto);

  return (
    <main>
      <Navbar />
      <div className="pt-20 md:pt-24">
        <Container>
          <ListingGallery listing={cardView} />

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <VerifiedBadge listingId={cardView.id} />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-8">
              <ListingInfo listing={cardView} />
              {cardView.virtualTourUrl && (
                <VirtualTour url={cardView.virtualTourUrl} title={cardView.title} />
              )}
              <LocationMap listing={cardView} />
              <NeighborhoodInsights listing={cardView} />
              <ReviewPanel targetKind="listing" targetId={cardView.id} />
            </div>
            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <AgentCard listing={cardView} />
              <BookViewing listingId={cardView.id} agentId={record.agentId} />
              <ReserveButton
                listingId={cardView.id}
                listingTitle={cardView.title}
                priceBaht={cardView.price}
                className="w-full"
              />
              <EnquiryForm listing={cardView} />
              <MortgageCalculator priceBaht={cardView.price} />
            </aside>
          </div>

          <SimilarListings currentId={cardView.id} />
        </Container>
      </div>
      <Footer />
    </main>
  );
}
