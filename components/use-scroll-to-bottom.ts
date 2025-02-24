import { useEffect, useRef, type RefObject } from 'react';

export function useScrollToBottom<T extends HTMLElement>(): [
  RefObject<T>,
  RefObject<T>,
] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);
  const shouldAutoScrollRef = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
      // Function to check if user is near bottom (within 100px)
      const isNearBottom = () => {
        const threshold = 100;
        return (
          container.scrollHeight - container.scrollTop - container.clientHeight <=
          threshold
        );
      };

      // Update shouldAutoScroll on user scroll
      const handleScroll = () => {
        shouldAutoScrollRef.current = isNearBottom();
      };

      // Add scroll listener
      container.addEventListener('scroll', handleScroll);

      // MutationObserver that only scrolls if user was near bottom
      const observer = new MutationObserver(() => {
        if (shouldAutoScrollRef.current) {
          end.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });

      return () => {
        observer.disconnect();
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  return [containerRef, endRef];
}
