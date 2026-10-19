"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export function DashboardTableScroll({ children }: { children: ReactNode }) {
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);

  const syncScrollbar = useCallback(() => {
    const scrollbar = scrollbarRef.current;
    const content = contentRef.current;
    if (!scrollbar || !content) return;
    if (scrollbar.scrollLeft !== content.scrollLeft) scrollbar.scrollLeft = content.scrollLeft;
  }, []);

  const syncContent = useCallback(() => {
    const scrollbar = scrollbarRef.current;
    const content = contentRef.current;
    if (!scrollbar || !content) return;
    if (content.scrollLeft !== scrollbar.scrollLeft) content.scrollLeft = scrollbar.scrollLeft;
  }, []);

  useEffect(() => {
    const scrollbar = scrollbarRef.current;
    const content = contentRef.current;
    if (!scrollbar || !content) return;

    const updateDimensions = () => {
      setContentWidth(content.scrollWidth);
      setViewportWidth(content.clientWidth);
    };
    const observer = new ResizeObserver(updateDimensions);
    observer.observe(content);
    if (content.firstElementChild) observer.observe(content.firstElementChild);
    updateDimensions();

    return () => observer.disconnect();
  }, []);

  const hasHorizontalOverflow = contentWidth > viewportWidth;

  return (
    <>
      {hasHorizontalOverflow && (
        <div
          ref={scrollbarRef}
          role="region"
          aria-label="Scroll table horizontally"
          tabIndex={0}
          onScroll={syncContent}
          className="dashboard-table-scrollbar sticky top-[76px] z-20 h-5 w-full min-w-0 max-w-full overflow-x-auto overflow-y-hidden border-b border-slate-200 bg-white"
        >
          <div aria-hidden="true" style={{ width: contentWidth, height: 1 }} />
        </div>
      )}
      <div ref={contentRef} onScroll={syncScrollbar} className="dashboard-table-content w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain">
        {children}
      </div>
    </>
  );
}
