import React, { useEffect, useRef, useState } from "react";
import {
  Contrast,
  Network,
  Palette,
  MessageSquare,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { useGrayscale } from "../context/GrayscaleContext";

interface NavigationProps {
  onToggleFooter?: () => void;
  isFooterOpen?: boolean;
  children?: React.ReactNode;
}

export const Navigation: React.FC<NavigationProps> = ({
  onToggleFooter,
  isFooterOpen,
  children,
}) => {
  const { isGrayscale, toggleGrayscale } = useGrayscale();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Close mobile dropdown when clicking outside
  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const doc = navRef.current?.ownerDocument || document;
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    doc.addEventListener("mousedown", handlePointerDown);
    doc.addEventListener("touchstart", handlePointerDown);
    return () => {
      doc.removeEventListener("mousedown", handlePointerDown);
      doc.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isMobileMenuOpen]);

  const handleHomeNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.top && window.top !== window.self) {
      try {
        window.top.location.href = "https://fowzy.site";
        return;
      } catch {
        // Fallback if cross-origin top navigation restricted
      }
    }
    window.location.href = "https://fowzy.site";
  };

  return (
    <header className="fowzy-navbar" ref={navRef}>
      <div className="fowzy-navbar__inner">
        {/* Brand Logo / Home Anchor - Points directly to https://fowzy.site */}
        <div className="fowzy-navbar__brand-container">
          <a
            href="https://fowzy.site"
            target="_top"
            rel="noopener noreferrer"
            onClick={handleHomeNavigation}
            className="fowzy-navbar__brand"
            title="Return to fowzy.site Home"
          >
            <h1 className="fowzy-navbar__logo">FOWZY 🎯</h1>
            <span className="fowzy-navbar__badge">CANVAS</span>
          </a>
        </div>

        {/* Embedded Cloud Controls Slot */}
        {children && <div className="fowzy-navbar__center">{children}</div>}

        {/* Action Controls & Navigation Links */}
        <div className="fowzy-navbar__actions">
          {/* Desktop Actions */}
          <div className="fowzy-navbar__actions-desktop">
            {/* Grayscale Mode Circle Switcher */}
            <button
              type="button"
              id="grayscale-toggle-btn"
              aria-label="Toggle Grayscale Mode"
              title={
                isGrayscale
                  ? "Grayscale Mode: Active (Click for Color)"
                  : "Grayscale Mode: Inactive (Click for Grayscale)"
              }
              onClick={toggleGrayscale}
              className={`fowzy-grayscale-btn ${
                isGrayscale ? "is-active" : "is-inactive"
              }`}
            >
              <Contrast size={18} />
            </button>

            {/* Design Process CTA */}
            <a
              href="https://fowzy.site/process"
              target="_blank"
              rel="noopener noreferrer"
              className="fowzy-nav-btn fowzy-nav-btn--process"
            >
              <Palette size={16} />
              <span className="fowzy-nav-btn__label">Design Process</span>
            </a>

            {/* Map Link */}
            <a
              href="https://fowzy.site/map"
              target="_blank"
              rel="noopener noreferrer"
              className="fowzy-nav-btn fowzy-nav-btn--map"
            >
              <Network size={16} />
              <span className="fowzy-nav-btn__label">Map</span>
            </a>

            {/* Footer & Contact Toggle */}
            {onToggleFooter && (
              <button
                type="button"
                onClick={onToggleFooter}
                title="Toggle Global Footer & Contact"
                className={`fowzy-nav-btn fowzy-nav-btn--footer ${
                  isFooterOpen ? "is-open" : ""
                }`}
              >
                <MessageSquare size={16} />
                <span className="fowzy-nav-btn__label">
                  {isFooterOpen ? "Close Footer" : "Contact"}
                </span>
              </button>
            )}
          </div>

          {/* Mobile Menu Trigger Button (Hidden on Desktop >= 768px) */}
          <button
            type="button"
            className={`fowzy-nav-btn fowzy-mobile-menu-trigger ${
              isMobileMenuOpen ? "is-active" : ""
            }`}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Mobile Navigation Menu"
            title="Navigation Menu"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Popover */}
      {isMobileMenuOpen && (
        <div className="fowzy-mobile-dropdown">
          <button
            type="button"
            className="fowzy-mobile-menu-item"
            onClick={() => {
              toggleGrayscale();
              setIsMobileMenuOpen(false);
            }}
          >
            <Contrast size={18} />
            <span>Grayscale Mode</span>
            <span
              className={`fowzy-mobile-badge ${
                isGrayscale ? "is-active" : ""
              }`}
            >
              {isGrayscale ? "ON" : "OFF"}
            </span>
          </button>

          <a
            href="https://fowzy.site/process"
            target="_blank"
            rel="noopener noreferrer"
            className="fowzy-mobile-menu-item"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Palette size={18} />
            <span>Design Process</span>
            <ExternalLink size={14} className="fowzy-mobile-external" />
          </a>

          <a
            href="https://fowzy.site/map"
            target="_blank"
            rel="noopener noreferrer"
            className="fowzy-mobile-menu-item"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Network size={18} />
            <span>Map</span>
            <ExternalLink size={14} className="fowzy-mobile-external" />
          </a>

          {onToggleFooter && (
            <button
              type="button"
              className="fowzy-mobile-menu-item"
              onClick={() => {
                onToggleFooter();
                setIsMobileMenuOpen(false);
              }}
            >
              <MessageSquare size={18} />
              <span>{isFooterOpen ? "Close Footer" : "Contact & Footer"}</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
