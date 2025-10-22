// src/layout/Navbar.tsx
import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { HiOutlineMenu, HiX } from "react-icons/hi";
import referralProLogo from "./../assets/referralProLogo.png";
import NotificationDropdown from "../components/NotificationDropdown";
import ProfileDropdown from "../components/ProfileDropdown";
import { useUserContext } from "../context/UserProvider";

type NavItem = { label: string; href: string };

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/Dashboard" },
  { label: "Analytics", href: "/Dashboard/Analytics" },
  { label: "Team", href: "/Dashboard/Team" },
  { label: "Referral", href: "/Dashboard/Referral" },
];

const Navbar: React.FC = () => {
  const [elevated, setElevated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { user  } = useUserContext();

  // read once so it doesn't change mid-render (prevents flicker)
  const [cachedBizType] = useState(
    () => (localStorage.getItem("userBizType") || "").trim().toLowerCase()
  );

  // prefer live value, fallback to cache
  const effectiveBizType = useMemo(() => {
    const live = (user?.biz_type || "").trim().toLowerCase();
    return live || cachedBizType; // live overrides cached as soon as it arrives
  }, [user?.biz_type, cachedBizType]);

  // show Team ONLY for sole
  const showTeam = effectiveBizType !== "sole";

  // if we truly don't know yet (no cache + still loading), keep Team hidden (no flash)
  const finalItems = useMemo<NavItem[]>(() => {
    const base = NAV_ITEMS.filter((i) => i.label !== "Team" && i.href !== "/Dashboard/Team");
    if (showTeam) {
      // insert Team back at the right spot
      const withTeam: NavItem[] = [];
      for (const it of NAV_ITEMS) {
        if (it.label === "Team") {
          withTeam.push(it);
        } else {
          // if Team wasn't this position, push matching from base
          const found = base.find((b) => b.href === it.href);
          if (found) withTeam.push(found);
        }
      }
      return withTeam;
    }
    // unknown state (no cache + loading) or non-sole => hide Team
    return base;
  }, [showTeam]);

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-50 border-b border-gray-300 bg-primary-gray transition-shadow",
        elevated ? "shadow-md" : "shadow-none",
      ].join(" ")}
    >
      <nav className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Left: Logo + Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-200/40"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <HiX className="h-6 w-6" /> : <HiOutlineMenu className="h-6 w-6" />}
          </button>

          <img src={referralProLogo} alt="Referral Pro" className="h-6 w-auto" />
        </div>

        {/* Center: Desktop Links */}
        <ul className="hidden md:flex items-center gap-3">
          {finalItems.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                end={item.href.toLowerCase() === "/dashboard"}
                className={({ isActive }) =>
                  [
                    "px-4 py-2 rounded-full text-sm transition",
                    isActive
                      ? "text-primary-purple bg-primary-purple/15"
                      : "text-slate-600 hover:text-slate-800 hover:bg-slate-200/40",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right: Profile + Notification */}
        <div className="flex items-center gap-3">
          <NotificationDropdown />
          <ProfileDropdown />
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <ul className="flex flex-col px-4 py-3 space-y-1">
            {finalItems.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  end={item.href.toLowerCase() === "/dashboard"}
                  className={({ isActive }) =>
                    [
                      "block px-3 py-2 rounded-md text-sm font-medium",
                      isActive
                        ? "text-primary-purple bg-primary-purple/10"
                        : "text-slate-700 hover:bg-slate-100",
                    ].join(" ")
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;
