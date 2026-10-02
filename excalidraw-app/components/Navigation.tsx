import React from "react";
import { Contrast, Network, Palette, MessageSquare } from "lucide-react";
import { useGrayscale } from "../context/GrayscaleContext";

interface NavigationProps {
  onToggleFooter?: () => void;
  isFooterOpen?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  onToggleFooter,
  isFooterOpen,
}) => {
  const { isGrayscale, toggleGrayscale } = useGrayscale();

  return (
    <header className="fowzy-navbar">
      <div className="fowzy-navbar__inner">
        {/* Brand Logo / Home Anchor */}
        <div className="fowzy-navbar__brand-container">
          <a
            href="https://fowzy.site"
            target="_blank"
            rel="noopener noreferrer"
            className="fowzy-navbar__brand"
          >
            <h1 className="fowzy-navbar__logo">FOWZY 🎯</h1>
          </a>
          <span className="fowzy-navbar__badge">CANVAS</span>
        </div>

        {/* Action Controls & Navigation Links */}
        <div className="fowzy-navbar__actions">
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
      </div>
    </header>
  );
};
