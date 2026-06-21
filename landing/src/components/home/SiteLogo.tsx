import { logoImg } from "@/assets";
import Image from "next/image";
import Link from "next/link";

type SiteLogoProps = {
  className?: string;
  priority?: boolean;
};

export function SiteLogo({ className, priority = false }: SiteLogoProps) {
  const wrapperClass = ["as_logo", className].filter(Boolean).join(" ");

  return (
    <div className={wrapperClass}>
      <Link href="/" className="as_logo_link">
        <Image
          src={logoImg}
          alt=""
          priority={priority}
          height={50}
          style={{ objectFit: "contain", width: "auto" }}
        />
        <span className="as_logo_wordmark">
          <span>Calyx</span>
          <span>Guru</span>
        </span>
      </Link>
    </div>
  );
}
