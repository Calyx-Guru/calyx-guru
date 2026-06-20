"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { logoImg, menuIcon } from "@/assets";

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
            <div className="as_logo">
              <Link href="/">
                <Image src={logoImg} alt="" priority />
              </Link>
            </div>
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
                <div className={`as_menu${menuOpen ? " open" : ""}`}>
                  <ul>
                    <li>
                      <Link href="/" className="active">
                        home
                      </Link>
                    </li>
                    <li>
                      <Link href="#">about us</Link>
                    </li>
                    <li>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleSubmenu("pages");
                        }}
                      >
                        pages
                      </a>
                      <SubmenuArrow />
                      <ul
                        className={`as_submenu${openSubmenu === "pages" ? " openSub_menu" : ""}`}
                      >
                        <li>
                          <Link href="#">service</Link>
                        </li>
                        <li>
                          <Link href="#">service single</Link>
                        </li>
                        <li>
                          <Link href="#">appointment</Link>
                        </li>
                        <li>
                          <Link href="#">pricing plans</Link>
                        </li>
                        <li>
                          <Link href="/delete-account">delete account</Link>
                        </li>
                        <li>
                          <Link href="#">404</Link>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleSubmenu("shop");
                        }}
                      >
                        shop
                      </a>
                      <SubmenuArrow />
                      <ul
                        className={`as_submenu${openSubmenu === "shop" ? " openSub_menu" : ""}`}
                      >
                        <li>
                          <Link href="#">Shop</Link>
                        </li>
                        <li>
                          <Link href="#">Shop Single</Link>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleSubmenu("blog");
                        }}
                      >
                        blog
                      </a>
                      <SubmenuArrow />
                      <ul
                        className={`as_submenu${openSubmenu === "blog" ? " openSub_menu" : ""}`}
                      >
                        <li>
                          <Link href="#">blog</Link>
                        </li>
                        <li>
                          <Link href="#">blog single</Link>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <Link href="#">contact</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
