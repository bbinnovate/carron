"use client";
import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
const SmoothScroll = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const lenis = useLenis();
  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
  }, [pathname]);
  return <ReactLenis root>{children}</ReactLenis>;
};
export default SmoothScroll;


