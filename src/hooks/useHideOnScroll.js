import { useEffect, useState } from "react";

export default function useHideOnScroll() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let previousScrollY = window.scrollY;
    let accumulatedDelta = 0;
    let scrollDirection = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - previousScrollY;
      const nextDirection = Math.sign(delta);

      if (currentScrollY <= 0) {
        setIsVisible(true);
        accumulatedDelta = 0;
      } else if (nextDirection !== 0) {
        accumulatedDelta =
          nextDirection === scrollDirection
            ? accumulatedDelta + delta
            : delta;
        scrollDirection = nextDirection;

        if (Math.abs(accumulatedDelta) >= 8) {
          setIsVisible(nextDirection < 0);
          accumulatedDelta = 0;
        }
      }

      previousScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return isVisible;
}
