"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface INavbarProps {}

const navigation = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Blog",
    href: "/blog",
  },
  {
    label: "Category",
    href: "/category",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

const Header: React.FunctionComponent<INavbarProps> = (props) => {
  const pathname = usePathname();
  const [active, setActive] = useState(pathname);
  const pathBlog = "/" + pathname.split("/")[1];

  useEffect(() => {
    setActive(pathname);
  }, [pathname]);

  return (
    <>
      <header>
        <nav className="header-nav">
          <ul className="header-menu">
            {navigation.map((item, index) => (
              <li
                key={index}
                className={`header-item ${
                  active === item.href || pathBlog === item.href
                    ? "is-active"
                    : ""
                }`}
              >
                <Link
                  className="header-link"
                  href={item.href}
                  onClick={() => setActive(item.href)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
    </>
  );
};

export default Header;
