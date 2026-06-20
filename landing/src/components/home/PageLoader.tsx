"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { loaderImg } from "@/assets";

export function PageLoader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setHidden(true), 500);
    return () => window.clearTimeout(timer);
  }, []);

  if (hidden) {
    return null;
  }

  return (
    <div className="as_loader">
      <div className="as_spinner">
        <Image
          src={loaderImg}
          alt=""
          className="img-responsive"
          priority
        />
      </div>
    </div>
  );
}
