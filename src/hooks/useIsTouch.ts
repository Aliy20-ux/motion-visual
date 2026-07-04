import { useEffect, useState } from 'react';

// Several sections rely on group-hover to reveal an accent border, a location line, or a
// gradient treatment on a name — fine on desktop, but on a device with no hover concept the
// content those styles gate just never appears, leaving cards that look like plain boxes
// with names in them. Components use this to treat what looks like the "hover" state on
// desktop as the permanent resting state on touch, instead of relying on a hover that will
// never fire.
export function useIsTouch() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    setIsTouch(!window.matchMedia('(hover: hover)').matches);
  }, []);
  return isTouch;
}
