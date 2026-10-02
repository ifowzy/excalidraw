import React, { useState, useEffect } from "react";
import {
  Cloud,
  History,
  Save,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Clock,
  RotateCcw,
  X,
  FolderOpen,
  Plus,
} from "lucide-react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import {
  CanvasVersionSummary,
  saveCanvasToNeon,
  deleteCanvasFromNeon,
  fetchCanvasVersionFromNeon,
  listAllCanvasesFromNeon,
} from "../data/neonStorage";

interface CloudVersionControlProps {
  excalidrawAPI: ExcalidrawImperativeAPI | null;
  currentSlug: string | null;
  onSlugChange: (newSlug: string) => void;
  versions: CanvasVersionSummary[];
  onVersionsUpdate: (newVersions: CanvasVersionSummary[]) => void;
  activeVersionNumber: number | null;
  onSelectVersion: (versionData: any, versionNumber: number) => void;
  onResetCanvas: () => void;
  notificationMessage?: string | null;
  onClearNotification?: () => void;
}

export const CloudVersionControl: React.FC<CloudVersionControlProps> = ({
  excalidrawAPI,
  currentSlug,
  onSlugChange,
  versions,
  onVersionsUpdate,
  activeVersionNumber,
  onSelectVersion,
  onResetCanvas,
  notificationMessage,
  onClearNotification,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"versions" | "settings" | "canvases">("versions");
  const [slugInput, setSlugInput] = useState(currentSlug || "");
  const [versionNote, setVersionNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [allCanvases, setAllCanvases] = useState<any[]>([]);
  const [isLoadingCanvases, setIsLoadingCanvases] = useState(false);

  useEffect(() => {
    if (currentSlug) {
      setSlugInput(currentSlug);
    }
  }, [currentSlug]);

  const latestVersion = versions.length > 0 ? versions[0].version_number : 1;
  const isViewingOldVersion =
    activeVersionNumber !== null &&
    versions.length > 0 &&
    activeVersionNumber !== latestVersion;

  const origin = window.location.origin;
  const fullShareUrl = currentSlug ? `${origin}/${currentSlug}` : origin;

  const handleCopyLink = () => {
    if (!currentSlug) return;
    navigator.clipboard.writeText(fullShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (customNote?: string) => {
    if (!excalidrawAPI) return;

    let targetSlug = slugInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
    if (!targetSlug) {
      targetSlug = `canvas-${Math.random().toString(36).substring(2, 9)}`;
      setSlugInput(targetSlug);
    }

    try {
      setIsSaving(true);
      setStatusMessage("Saving snapshot to Neon...");

      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const files = excalidrawAPI.getFiles();

      const result = await saveCanvasToNeon({
        slug: targetSlug,
        title: targetSlug,
        elements,
        appState,
        files,
        note: customNote !== undefined ? customNote : versionNote,
      });

      if (result.success) {
        onSlugChange(targetSlug);
        const updated = [result.version, ...versions.filter((v) => v.version_number !== result.version.version_number)];
        onVersionsUpdate(updated);
        onSelectVersion(null, result.version.version_number);
        setVersionNote("");
        setStatusMessage(`Saved as Version ${result.version.version_number}!`);
        setTimeout(() => setStatusMessage(null), 3000);

        // Update URL path without full refresh
        if (window.location.pathname !== `/${targetSlug}`) {
          window.history.pushState({}, "", `/${targetSlug}`);
        }
      }
    } catch (error: any) {
      console.error(error);
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadVersion = async (versionNum: number) => {
    if (!currentSlug) return;
    try {
      setStatusMessage(`Loading Version ${versionNum}...`);
      const versionData = await fetchCanvasVersionFromNeon(currentSlug, versionNum);
      if (versionData) {
        onSelectVersion(versionData, versionNum);
        setStatusMessage(`Viewing Version ${versionNum}`);
        setTimeout(() => setStatusMessage(null), 2500);
        setIsModalOpen(false);
      }
    } catch (error: any) {
      setStatusMessage(`Failed to load version: ${error.message}`);
    }
  };

  const handleDeleteCanvas = async () => {
    if (!currentSlug) return;
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${currentSlug}" and all its ${versions.length} versions from Neon?`,
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await deleteCanvasFromNeon(currentSlug);
      setIsModalOpen(false);
      onResetCanvas();
      window.history.pushState({}, "", "/");
      onSlugChange("");
      onVersionsUpdate([]);
      setStatusMessage("Canvas deleted from Neon.");
    } catch (error: any) {
      alert(`Delete failed: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenCanvasesTab = async () => {
    setActiveTab("canvases");
    setIsLoadingCanvases(true);
    const list = await listAllCanvasesFromNeon();
    setAllCanvases(list);
    setIsLoadingCanvases(false);
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <>
      {/* Top Banner for Loaded Version or Viewing Old Version */}
      {isViewingOldVersion && (
        <div className="fowzy-version-banner fowzy-version-banner--warning">
          <span>
            <strong>Historical Version {activeVersionNumber}</strong> — You are viewing an older snapshot.
          </span>
          <div className="fowzy-version-banner__actions">
            <button
              type="button"
              className="fowzy-banner-btn fowzy-banner-btn--primary"
              onClick={() => handleSave(`Restored from v${activeVersionNumber}`)}
              disabled={isSaving}
            >
              <RotateCcw size={14} />
              Restore as Latest
            </button>
            <button
              type="button"
              className="fowzy-banner-btn"
              onClick={() => handleLoadVersion(latestVersion)}
            >
              Return to Latest (v{latestVersion})
            </button>
          </div>
        </div>
      )}

      {notificationMessage && !isViewingOldVersion && (
        <div className="fowzy-version-banner fowzy-version-banner--info">
          <span>{notificationMessage}</span>
          <div className="fowzy-version-banner__actions">
            <button
              type="button"
              className="fowzy-banner-btn"
              onClick={() => setIsModalOpen(true)}
            >
              <History size={14} />
              View Versions ({versions.length})
            </button>
            {onClearNotification && (
              <button
                type="button"
                className="fowzy-banner-close"
                onClick={onClearNotification}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Cloud & Version Bar Controls (Embedded in Navbar) */}
      <div className="fowzy-cloud-bar">
        {/* Slug Indicator / Link Button */}
        <button
          type="button"
          className="fowzy-cloud-slug-btn"
          onClick={() => setIsModalOpen(true)}
          title="Customize permanent link & version history"
        >
          <Cloud size={16} className="fowzy-cloud-icon" />
          <span className="fowzy-cloud-slug">
            {currentSlug ? `/${currentSlug}` : "Permanent Link..."}
          </span>
          {versions.length > 0 && (
            <span className="fowzy-version-badge">
              v{activeVersionNumber || latestVersion}
            </span>
          )}
        </button>

        {/* Quick Save Button */}
        <button
          type="button"
          className="fowzy-nav-btn fowzy-nav-btn--save"
          onClick={() => handleSave()}
          disabled={isSaving}
          title="Save new version snapshot to Neon"
        >
          <Save size={16} />
          <span className="fowzy-nav-btn__label">
            {isSaving ? "Saving..." : "Save"}
          </span>
        </button>

        {/* History Button */}
        <button
          type="button"
          className="fowzy-nav-btn fowzy-nav-btn--history"
          onClick={() => {
            setActiveTab("versions");
            setIsModalOpen(true);
          }}
          title="Open Version History"
        >
          <History size={16} />
          <span className="fowzy-nav-btn__label">
            History {versions.length > 0 ? `(${versions.length})` : ""}
          </span>
        </button>
      </div>

      {/* Main Cloud & Version History Modal */}
      {isModalOpen && (
        <div className="fowzy-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div
            className="fowzy-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="fowzy-modal-header">
              <div className="fowzy-modal-title">
                <Cloud size={20} />
                <h2>Neon Database & Version Control</h2>
              </div>
              <button
                type="button"
                className="fowzy-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Permanent Link Box */}
            <div className="fowzy-link-box">
              <label className="fowzy-link-label">Permanent Link</label>
              <div className="fowzy-link-input-row">
                <span className="fowzy-link-prefix">{origin}/</span>
                <input
                  type="text"
                  value={slugInput}
                  onChange={(e) => setSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "-"))}
                  placeholder="e.g. new-workflow"
                  className="fowzy-slug-input"
                />
                <button
                  type="button"
                  className="fowzy-copy-btn"
                  onClick={handleCopyLink}
                  title="Copy permanent link to clipboard"
                  disabled={!currentSlug}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <p className="fowzy-link-hint">
                Anyone with this link will view this canvas and its version history.
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="fowzy-modal-tabs">
              <button
                type="button"
                className={`fowzy-tab-btn ${activeTab === "versions" ? "is-active" : ""}`}
                onClick={() => setActiveTab("versions")}
              >
                <History size={16} />
                Versions ({versions.length})
              </button>
              <button
                type="button"
                className={`fowzy-tab-btn ${activeTab === "canvases" ? "is-active" : ""}`}
                onClick={handleOpenCanvasesTab}
              >
                <FolderOpen size={16} />
                All Canvases
              </button>
              <button
                type="button"
                className={`fowzy-tab-btn ${activeTab === "settings" ? "is-active" : ""}`}
                onClick={() => setActiveTab("settings")}
              >
                Settings
              </button>
            </div>

            {/* Tab 1: Version History */}
            {activeTab === "versions" && (
              <div className="fowzy-tab-content">
                {/* Save New Version Form */}
                <div className="fowzy-save-version-row">
                  <input
                    type="text"
                    value={versionNote}
                    onChange={(e) => setVersionNote(e.target.value)}
                    placeholder="Add an optional note (e.g. 'Updated user flow')"
                    className="fowzy-version-note-input"
                  />
                  <button
                    type="button"
                    className="fowzy-btn fowzy-btn--primary"
                    onClick={() => handleSave()}
                    disabled={isSaving}
                  >
                    <Save size={16} />
                    {isSaving ? "Saving..." : "Save Version"}
                  </button>
                </div>

                {statusMessage && (
                  <div className="fowzy-status-banner">{statusMessage}</div>
                )}

                {/* Versions List */}
                <div className="fowzy-versions-list">
                  {versions.length === 0 ? (
                    <div className="fowzy-empty-versions">
                      <Clock size={32} />
                      <p>No snapshots saved yet.</p>
                      <span>Click <strong>Save Version</strong> to save your first snapshot to Neon.</span>
                    </div>
                  ) : (
                    versions.map((ver) => {
                      const isCurrent = (activeVersionNumber || latestVersion) === ver.version_number;
                      return (
                        <div
                          key={ver.id}
                          className={`fowzy-version-item ${isCurrent ? "is-active" : ""}`}
                        >
                          <div className="fowzy-version-info">
                            <div className="fowzy-version-badge-row">
                              <span className="fowzy-version-tag">
                                v{ver.version_number}
                              </span>
                              {ver.version_number === latestVersion && (
                                <span className="fowzy-latest-pill">Latest</span>
                              )}
                              {isCurrent && (
                                <span className="fowzy-active-pill">Active</span>
                              )}
                              <span className="fowzy-version-time">
                                {formatDate(ver.created_at)}
                              </span>
                            </div>
                            {ver.note && (
                              <p className="fowzy-version-note">{ver.note}</p>
                            )}
                            <span className="fowzy-version-elements">
                              {ver.element_count} elements
                            </span>
                          </div>

                          <div className="fowzy-version-actions">
                            {isCurrent ? (
                              <span className="fowzy-viewing-label">Viewing</span>
                            ) : (
                              <button
                                type="button"
                                className="fowzy-btn fowzy-btn--secondary"
                                onClick={() => handleLoadVersion(ver.version_number)}
                              >
                                <RotateCcw size={14} />
                                Restore
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: All Canvases on Neon */}
            {activeTab === "canvases" && (
              <div className="fowzy-tab-content">
                <div className="fowzy-canvases-header">
                  <h3>Saved Canvases on Neon</h3>
                  <button
                    type="button"
                    className="fowzy-btn fowzy-btn--primary"
                    onClick={() => {
                      setIsModalOpen(false);
                      onResetCanvas();
                      window.history.pushState({}, "", "/");
                      onSlugChange("");
                      onVersionsUpdate([]);
                    }}
                  >
                    <Plus size={14} />
                    New Whiteboard
                  </button>
                </div>

                {isLoadingCanvases ? (
                  <div className="fowzy-empty-versions">Loading canvases...</div>
                ) : allCanvases.length === 0 ? (
                  <div className="fowzy-empty-versions">No canvases found in Neon.</div>
                ) : (
                  <div className="fowzy-canvases-grid">
                    {allCanvases.map((canvas) => (
                      <div
                        key={canvas.id}
                        className={`fowzy-canvas-card ${currentSlug === canvas.slug ? "is-selected" : ""}`}
                        onClick={() => {
                          window.location.href = `/${canvas.slug}`;
                        }}
                      >
                        <div className="fowzy-canvas-card__title">
                          /{canvas.slug}
                        </div>
                        <div className="fowzy-canvas-card__meta">
                          <span>{canvas.total_versions} versions</span>
                          <span>{formatDate(canvas.updated_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Settings & Danger Zone */}
            {activeTab === "settings" && (
              <div className="fowzy-tab-content">
                <div className="fowzy-danger-zone">
                  <h4>Danger Zone</h4>
                  <p>
                    Permanently delete this canvas (<strong>/{currentSlug || "untitled"}</strong>) and all its version snapshots from Neon.
                  </p>
                  <button
                    type="button"
                    className="fowzy-btn fowzy-btn--danger"
                    onClick={handleDeleteCanvas}
                    disabled={!currentSlug || isDeleting}
                  >
                    <Trash2 size={16} />
                    {isDeleting ? "Deleting..." : "Delete Canvas from Neon"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
