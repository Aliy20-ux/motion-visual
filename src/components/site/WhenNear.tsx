import { useEffect, useRef, useState, type ReactNode } from 'react';

// Mounts its children only once the visitor scrolls close to this spot. The quote form drags in the bot-check
// (about 1.6 MB from Cloudflare) and the Supabase client, which nobody needs while looking at the hero. The
// placeholder keeps the section's id and height, so anchor links ("Start a project") and the page length don't change.
// `heights` are the section's real heights on phone (< 768px), tablet (< 1024px) and desktop, measured on the live layout,
// so the page doesn't grow underneath a visitor who is scrolling or jumping past the placeholder.
const placeholderHeight = (heights: [number, number, number]) =>
  typeof window === 'undefined' ? heights[2] : window.innerWidth < 768 ? heights[0] : window.innerWidth < 1024 ? heights[1] : heights[2];

export default function WhenNear({ id, heights, children }: { id: string; heights: [number, number, number]; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const el = ref.current;
    if (near || !el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true);
      },
      { rootMargin: '1200px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  if (near) return <>{children}</>;
  return <div ref={ref} id={id} style={{ minHeight: placeholderHeight(heights) }} />;
}
