import type { AnchorHTMLAttributes } from "react";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };
/** Native links keep this standalone static export independent of the portfolio's Next.js router. */
export default function StaticLink({href, ...props}: Props) {
  const prefix = "/demos/rent-car-station";
  const destination = href.startsWith("/") && !href.startsWith("//") && !href.startsWith(prefix + "/") ? prefix + href : href;
  return <a href={destination} {...props} />;
}
