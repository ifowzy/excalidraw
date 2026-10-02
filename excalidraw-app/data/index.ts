import {
  compressData,
  decompressData,
  toByteString,
} from "@excalidraw/excalidraw/data/encode";
import { deflate, inflate } from "pako";
import {
  decryptData,
  generateEncryptionKey,
  IV_LENGTH_BYTES,
} from "@excalidraw/excalidraw/data/encryption";
import { serializeAsJSON } from "@excalidraw/excalidraw/data/json";
import { isInvisiblySmallElement } from "@excalidraw/element";
import { isInitializedImageElement } from "@excalidraw/element";
import { t } from "@excalidraw/excalidraw/i18n";
import { bytesToHexString } from "@excalidraw/common";

import type { UserIdleState } from "@excalidraw/common";
import type { ImportedDataState } from "@excalidraw/excalidraw/data/types";
import type { SceneBounds } from "@excalidraw/element";
import type {
  ExcalidrawElement,
  FileId,
  OrderedExcalidrawElement,
} from "@excalidraw/element/types";
import type {
  AppState,
  BinaryFileData,
  BinaryFiles,
  SocketId,
} from "@excalidraw/excalidraw/types";
import type { MakeBrand } from "@excalidraw/common/utility-types";

import {
  DELETED_ELEMENT_TIMEOUT,
  FILE_UPLOAD_MAX_BYTES,
  ROOM_ID_BYTES,
} from "../app_constants";

import { encodeFilesForUpload } from "./FileManager";
import { saveFilesToFirebase } from "./firebase";

import type { WS_SUBTYPES } from "../app_constants";

export type SyncableExcalidrawElement = OrderedExcalidrawElement &
  MakeBrand<"SyncableExcalidrawElement">;

export const isSyncableElement = (
  element: OrderedExcalidrawElement,
): element is SyncableExcalidrawElement => {
  if (element.isDeleted) {
    if (element.updated > Date.now() - DELETED_ELEMENT_TIMEOUT) {
      return true;
    }
    return false;
  }
  return !isInvisiblySmallElement(element);
};

export const getSyncableElements = (
  elements: readonly OrderedExcalidrawElement[],
) =>
  elements.filter((element) =>
    isSyncableElement(element),
  ) as SyncableExcalidrawElement[];

const BACKEND_V2_GET = import.meta.env.VITE_APP_BACKEND_V2_GET_URL;
const BACKEND_V2_POST = import.meta.env.VITE_APP_BACKEND_V2_POST_URL;

const generateRoomId = async () => {
  const buffer = new Uint8Array(ROOM_ID_BYTES);
  window.crypto.getRandomValues(buffer);
  return bytesToHexString(buffer);
};

export type EncryptedData = {
  data: ArrayBuffer;
  iv: Uint8Array;
};

export type SocketUpdateDataSource = {
  INVALID_RESPONSE: {
    type: WS_SUBTYPES.INVALID_RESPONSE;
  };
  SCENE_INIT: {
    type: WS_SUBTYPES.INIT;
    payload: {
      elements: readonly OrderedExcalidrawElement[];
    };
  };
  SCENE_UPDATE: {
    type: WS_SUBTYPES.UPDATE;
    payload: {
      elements: readonly OrderedExcalidrawElement[];
    };
  };
  MOUSE_LOCATION: {
    type: WS_SUBTYPES.MOUSE_LOCATION;
    payload: {
      socketId: SocketId;
      pointer: { x: number; y: number; tool: "pointer" | "laser" };
      button: "down" | "up";
      selectedElementIds: AppState["selectedElementIds"];
      username: string;
    };
  };
  USER_VISIBLE_SCENE_BOUNDS: {
    type: WS_SUBTYPES.USER_VISIBLE_SCENE_BOUNDS;
    payload: {
      socketId: SocketId;
      username: string;
      sceneBounds: SceneBounds;
    };
  };
  IDLE_STATUS: {
    type: WS_SUBTYPES.IDLE_STATUS;
    payload: {
      socketId: SocketId;
      userState: UserIdleState;
      username: string;
    };
  };
};

export type SocketUpdateDataIncoming =
  SocketUpdateDataSource[keyof SocketUpdateDataSource];

export type SocketUpdateData =
  SocketUpdateDataSource[keyof SocketUpdateDataSource] & {
    _brand: "socketUpdateData";
  };

const RE_COLLAB_LINK = /^#room=([a-zA-Z0-9_-]+),([a-zA-Z0-9_-]+)$/;

export const isCollaborationLink = (link: string) => {
  const hash = new URL(link).hash;
  return RE_COLLAB_LINK.test(hash);
};

export const getCollaborationLinkData = (link: string) => {
  const hash = new URL(link).hash;
  const match = hash.match(RE_COLLAB_LINK);
  if (match && match[2].length !== 22) {
    window.alert(t("alerts.invalidEncryptionKey"));
    return null;
  }
  return match ? { roomId: match[1], roomKey: match[2] } : null;
};

export const generateCollaborationLinkData = async () => {
  const roomId = await generateRoomId();
  const roomKey = await generateEncryptionKey();

  if (!roomKey) {
    throw new Error("Couldn't generate room key");
  }

  return { roomId, roomKey };
};

export const getCollaborationLink = (data: {
  roomId: string;
  roomKey: string;
}) => {
  return `${window.location.origin}${window.location.pathname}#room=${data.roomId},${data.roomKey}`;
};

/**
 * Decodes shareLink data using the legacy buffer format.
 * @deprecated
 */
const legacy_decodeFromBackend = async ({
  buffer,
  decryptionKey,
}: {
  buffer: ArrayBuffer;
  decryptionKey: string;
}) => {
  let decrypted: ArrayBuffer;

  try {
    // Buffer should contain both the IV (fixed length) and encrypted data
    const iv = buffer.slice(0, IV_LENGTH_BYTES);
    const encrypted = buffer.slice(IV_LENGTH_BYTES, buffer.byteLength);
    decrypted = await decryptData(new Uint8Array(iv), encrypted, decryptionKey);
  } catch (error: any) {
    // Fixed IV (old format, backward compatibility)
    const fixedIv = new Uint8Array(IV_LENGTH_BYTES);
    decrypted = await decryptData(fixedIv, buffer, decryptionKey);
  }

  // We need to convert the decrypted array buffer to a string
  const string = new window.TextDecoder("utf-8").decode(
    new Uint8Array(decrypted),
  );
  const data: ImportedDataState = JSON.parse(string);

  return {
    elements: data.elements || null,
    appState: data.appState || null,
  };
};

export const importFromBackend = async (
  id: string,
  decryptionKey: string,
): Promise<ImportedDataState> => {
  try {
    const response = await fetch(`${BACKEND_V2_GET}${id}`);

    if (!response.ok) {
      window.alert(t("alerts.importBackendFailed"));
      return {};
    }
    const buffer = await response.arrayBuffer();

    try {
      const { data: decodedBuffer } = await decompressData(
        new Uint8Array(buffer),
        {
          decryptionKey,
        },
      );
      const data: ImportedDataState = JSON.parse(
        new TextDecoder().decode(decodedBuffer),
      );

      return {
        elements: data.elements || null,
        appState: data.appState || null,
      };
    } catch (error: any) {
      console.warn(
        "error when decoding shareLink data using the new format:",
        error,
      );
      return legacy_decodeFromBackend({ buffer, decryptionKey });
    }
  } catch (error: any) {
    window.alert(t("alerts.importBackendFailed"));
    console.error(error);
    return {};
  }
};

export const encodeSceneToHash = (
  elements: readonly ExcalidrawElement[],
  appState: Partial<AppState>,
  files: BinaryFiles,
): string => {
  const jsonStr = serializeAsJSON(elements, appState, files, "local");
  const deflated = deflate(jsonStr);
  const binaryString = toByteString(deflated);
  const base64 = window.btoa(binaryString);
  const base64url = base64
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `#scene=${base64url}`;
};

export const decodeSceneFromHash = (
  hashString: string,
): ImportedDataState | null => {
  try {
    const raw = hashString.startsWith("#") ? hashString.slice(1) : hashString;
    const match = raw.match(/^(?:scene|data)=([a-zA-Z0-9_-]+)$/);
    if (!match) {
      return null;
    }
    const base64url = match[1];
    const base64 = base64url
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(base64url.length + ((4 - (base64url.length % 4)) % 4), "=");
    const binaryString = window.atob(base64);
    const buffer = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      buffer[i] = binaryString.charCodeAt(i);
    }
    const inflated = inflate(buffer, { to: "string" });
    const data: ImportedDataState = JSON.parse(inflated);
    return {
      elements: data.elements || null,
      appState: data.appState || null,
      files: data.files || null,
    };
  } catch (err) {
    console.error("Failed to decode scene from client-side hash:", err);
    return null;
  }
};

type ExportToBackendResult =
  | { url: null; errorMessage: string }
  | { url: string; errorMessage: null };

export const exportToBackend = async (
  elements: readonly ExcalidrawElement[],
  appState: Partial<AppState>,
  files: BinaryFiles,
): Promise<ExportToBackendResult> => {
  try {
    const hash = encodeSceneToHash(elements, appState, files);
    const url = `${window.location.origin}${window.location.pathname}${hash}`;
    return { url, errorMessage: null };
  } catch (error: any) {
    console.error(error);
    return { url: null, errorMessage: t("alerts.couldNotCreateShareableLink") };
  }
};
