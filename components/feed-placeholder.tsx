import { Skeleton } from '@/components/ui/skeleton'

// Phase 1 shows the masonry layout that Phase 2 (pins) will fill with content.
const HEIGHTS = [
  240, 320, 200, 280, 360, 220, 300, 260, 340, 210, 290, 250, 330, 230, 310,
  270,
]

export function FeedPlaceholder() {
  return (
    <section aria-label="Feed" aria-busy="true">
      <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 xl:columns-5 [&>*]:mb-4">
        {HEIGHTS.map((h, i) => (
          <Skeleton
            key={i}
            className="w-full rounded-2xl"
            style={{ height: h }}
          />
        ))}
      </div>
    </section>
  )
}
