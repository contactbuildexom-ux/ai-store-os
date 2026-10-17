import Image from "next/image";

/**
 * Buildexom logo (icon + wordmark).
 * Transparent PNG: /public/logo.png (888 x 277)
 */
export default function Logo() {
  return (
    <Image
      src="/logo-full.png"
      alt="Buildexom"
      width={888}
      height={277}
      priority
      className="h-11 w-auto sm:h-14"
    />
  );
}