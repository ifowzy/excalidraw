import React from "react";
import { Mail, X } from "lucide-react";

interface GlobalFooterProps {
  onClose?: () => void;
  isDrawer?: boolean;
}

const LinkedinIcon = ({ size = 22, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const FigmaIcon = ({ size = 22, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z" />
    <path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z" />
    <path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z" />
    <path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z" />
    <path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z" />
  </svg>
);

export const GlobalFooter: React.FC<GlobalFooterProps> = ({
  onClose,
  isDrawer = false,
}) => {
  return (
    <footer
      className={`fowzy-footer ${isDrawer ? "fowzy-footer--drawer" : ""}`}
      id="contact"
    >
      <div className="fowzy-footer__inner">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Footer"
            className="fowzy-footer__close-btn"
          >
            <X size={20} />
          </button>
        )}

        {/* Animated Callout Headline */}
        <h2 className="fowzy-footer__title">
          Let's map out the next system.
        </h2>

        {/* Contact Action Buttons */}
        <div className="fowzy-footer__buttons">
          <a
            href="mailto:hello@fowzy.site"
            className="fowzy-footer__btn fowzy-footer__btn--email"
          >
            <Mail size={22} className="stroke-[2.5]" />
            <span>Email Me</span>
          </a>

          <a
            href="https://linkedin.com/in/ifowzy"
            target="_blank"
            rel="noopener noreferrer"
            className="fowzy-footer__btn fowzy-footer__btn--linkedin"
          >
            <LinkedinIcon size={22} className="stroke-[2.5]" />
            <span>LinkedIn</span>
          </a>

          <a
            href="https://figma.com/@fowzy"
            target="_blank"
            rel="noopener noreferrer"
            className="fowzy-footer__btn fowzy-footer__btn--figma"
          >
            <FigmaIcon size={22} className="stroke-[2.5]" />
            <span>Figma</span>
          </a>
        </div>

        {/* Floating Animated Geometric Shapes */}
        <div className="fowzy-footer__geometry">
          <div className="fowzy-footer__geo-cube" />
          <div className="fowzy-footer__geo-ball" />
        </div>

        {/* Copyright & Monospace Tagline */}
        <p className="fowzy-footer__copyright">
          © 2026 Islam Fowzy | hello@fowzy.site
        </p>
      </div>
    </footer>
  );
};
