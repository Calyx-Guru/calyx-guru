"use client";

import { menuIcon } from "@/assets";
import { SiteLogo } from "@/components/home/SiteLogo";
import Image from "next/image";
import { useCallback, useState } from "react";

function SubmenuArrow() {
  return (
    <span className="as_submenu_arrow">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        viewBox="0 0 64 64"
      >
        <path
          d="M54.921 20.297a1 1 0 0 0-.92-.611H10a1 1 0 0 0-.718 1.698l22 22.627a1 1 0 0 0 1.434 0l22-22.628a1 1 0 0 0 .204-1.086z"
          fill="#ffffff"
        />
      </svg>
    </span>
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleMenu = useCallback(() => {
    setMenuOpen((open) => {
      const next = !open;
      document.body.classList.toggle("menuOpen", next);
      return next;
    });
  }, []);

  const toggleSubmenu = useCallback((key: string) => {
    setOpenSubmenu((current) => (current === key ? null : key));
  }, []);

  const closeMenus = useCallback(() => {
    setOpenSubmenu(null);
  }, []);

  return (
    <section className="as_header_wrapper" onClick={closeMenus}>
      <div className="container">
        <div className="row">
          <div className="col-lg-3 col-md-3 col-sm-4 col-xs-6">
            <SiteLogo className="pt-2 pb-2" priority />
          </div>
          <div className="col-lg-9 col-md-9 col-sm-8 col-xs-6">
            <div className="as_right_info">
              <div className="as_menu_wrapper">
                <button
                  type="button"
                  className="as_toggle"
                  aria-label="Toggle menu"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMenu();
                  }}
                >
                  <Image src={menuIcon} alt="" />
                </button>
                <div className={`as_menu${menuOpen ? " open" : ""}`}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
