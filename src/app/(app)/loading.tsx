import { PageSkeleton } from '@/components/skeleton/skeleton';

// Static skeleton without fetching, shown while the next page segment is prepared.
export default function Loading() {
  return (
    <div aria-busy="true">
      <p className="sr-only">Loading data.</p>
      <PageSkeleton />
    </div>
  );
}
