import React, { useState } from "react";
import { THEME, DEFAULT_CANVAS_BACKGROUND_PICKS } from "@excalidraw/common";
import { Popover } from "radix-ui";

import { Island } from "./Island";
import { IconButton } from "./IconButton";
import { ColorPicker } from "./ColorPicker/ColorPicker";
import {
  LoadIcon,
  save,
  boltIcon,
  searchIcon,
  SunIcon,
  MoonIcon,
  palette,
  share,
} from "./icons";
import { useI18n } from "../i18n";
import { useUIAppState } from "../context/ui-appState";
import {
  useAppProps,
  useExcalidrawActionManager,
  useExcalidrawElements,
  useExcalidrawSetAppState,
} from "./App";
import {
  actionLoadScene,
  actionSaveToActiveFile,
  actionToggleSearchMenu,
  actionToggleTheme,
} from "../actions";
import { openConfirmModal } from "./OverwriteConfirm/OverwriteConfirmState";
import Trans from "./Trans";
import { trackEvent } from "../analytics";
import Stack from "./Stack";

import "./FloatingTopLeftMenu.scss";

export const FloatingTopLeftMenu: React.FC = () => {
  const { t } = useI18n();
  const appState = useUIAppState();
  const setAppState = useExcalidrawSetAppState();
  const actionManager = useExcalidrawActionManager();
  const elements = useExcalidrawElements();
  const appProps = useAppProps();
  const [isBgPickerOpen, setIsBgPickerOpen] = useState(false);

  const handleLoadScene = async () => {
    if (
      !elements.length ||
      (await openConfirmModal({
        title: t("overwriteConfirm.modal.loadFromFile.title"),
        actionLabel: t("overwriteConfirm.modal.loadFromFile.button"),
        color: "warning",
        description: (
          <Trans
            i18nKey="overwriteConfirm.modal.loadFromFile.description"
            bold={(text) => <strong>{text}</strong>}
            br={() => <br />}
          />
        ),
      }))
    ) {
      actionManager.executeAction(actionLoadScene);
    }
  };

  const handleSave = () => {
    if (actionManager.isActionEnabled(actionSaveToActiveFile)) {
      actionManager.executeAction(actionSaveToActiveFile);
    } else {
      setAppState({ openDialog: { name: "jsonExport" } });
    }
  };

  const handleShare = () => {
    setAppState({ openDialog: { name: "jsonExport" } });
  };

  const handleCommandPalette = () => {
    trackEvent("command_palette", "open", "menu");
    setAppState({ openDialog: { name: "commandPalette" } });
  };

  const handleSearch = () => {
    actionManager.executeAction(actionToggleSearchMenu);
  };

  const handleThemeToggle = () => {
    const nextTheme = appState.theme === THEME.DARK ? THEME.LIGHT : THEME.DARK;
    if (appProps.onThemeChange) {
      appProps.onThemeChange(nextTheme);
    } else {
      actionManager.executeAction(actionToggleTheme);
    }
  };

  return (
    <Island padding={1} className="floating-top-left-island">
      <Stack.Row gap={1} align="center">
        <IconButton
          type="button"
          icon={LoadIcon}
          title={t("buttons.load")}
          aria-label={t("buttons.load")}
          data-testid="floating-load-button"
          onClick={handleLoadScene}
        />
        <IconButton
          type="button"
          icon={save}
          title={t("buttons.save")}
          aria-label={t("buttons.save")}
          data-testid="floating-save-button"
          onClick={handleSave}
        />
        <IconButton
          type="button"
          icon={share}
          title={t("labels.share")}
          aria-label={t("labels.share")}
          data-testid="floating-share-button"
          onClick={handleShare}
        />
        <IconButton
          type="button"
          icon={boltIcon}
          title={t("commandPalette.title")}
          aria-label={t("commandPalette.title")}
          data-testid="floating-command-palette-button"
          onClick={handleCommandPalette}
        />
        <IconButton
          type="button"
          icon={searchIcon}
          title={t("search.title")}
          aria-label={t("search.title")}
          data-testid="floating-search-button"
          onClick={handleSearch}
        />
        <IconButton
          type="button"
          icon={appState.theme === THEME.DARK ? SunIcon : MoonIcon}
          title={
            appState.theme === THEME.DARK
              ? t("buttons.lightMode")
              : t("buttons.darkMode")
          }
          aria-label={
            appState.theme === THEME.DARK
              ? t("buttons.lightMode")
              : t("buttons.darkMode")
          }
          data-testid="floating-theme-button"
          onClick={handleThemeToggle}
        />
        <Popover.Root open={isBgPickerOpen} onOpenChange={setIsBgPickerOpen}>
          <Popover.Trigger asChild>
            <IconButton
              type="button"
              icon={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {palette}
                  <span
                    style={{
                      position: "absolute",
                      bottom: "-2px",
                      right: "-2px",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: appState.viewBackgroundColor,
                      border: "1px solid var(--default-border-color)",
                    }}
                  />
                </div>
              }
              title={t("labels.canvasBackground")}
              aria-label={t("labels.canvasBackground")}
              data-testid="floating-canvas-bg-button"
            />
          </Popover.Trigger>
          <Popover.Content
            className="floating-bg-picker-content"
            sideOffset={8}
            align="start"
            style={{
              zIndex: "var(--zIndex-popup)",
              backgroundColor: "var(--island-bg-color)",
              padding: "0.75rem",
              borderRadius: "var(--border-radius-lg)",
              boxShadow: "var(--shadow-island)",
              border: "1px solid var(--default-border-color)",
            }}
          >
            <div style={{ padding: "0.25rem 0" }}>
              <div
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  color: "var(--color-primary)",
                }}
              >
                {t("labels.canvasBackground")}
              </div>
              <ColorPicker
                palette={null}
                topPicks={DEFAULT_CANVAS_BACKGROUND_PICKS}
                label={t("labels.canvasBackground")}
                type="canvasBackground"
                color={appState.viewBackgroundColor}
                onChange={(color) => {
                  setAppState({ viewBackgroundColor: color });
                }}
                data-testid="canvas-background-picker"
                elements={elements}
                appState={appState}
                updateData={(formData) => {
                  if (formData?.viewBackgroundColor) {
                    setAppState({
                      viewBackgroundColor: formData.viewBackgroundColor,
                    });
                  }
                }}
              />
            </div>
          </Popover.Content>
        </Popover.Root>
      </Stack.Row>
    </Island>
  );
};
