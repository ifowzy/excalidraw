export interface CanvasVersionSummary {
  id: number;
  canvas_slug: string;
  version_number: number;
  note: string;
  element_count: number;
  created_at: string;
}

export interface CanvasData {
  canvas: {
    id: number;
    slug: string;
    title: string;
    created_at: string;
    updated_at: string;
  };
  versions: CanvasVersionSummary[];
  latest: {
    elements: any[];
    app_state: any;
    files: any;
    version_number: number;
    created_at: string;
  } | null;
}

export function getSlugFromPathname(): string | null {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, "");
  if (!path) return null;

  // Handle /s/:slug or direct /:slug
  if (path.startsWith("s/")) {
    const slug = path.slice(2).trim();
    return slug || null;
  }

  // Avoid assets or internal routes
  if (
    path.startsWith("api") ||
    path.startsWith("assets") ||
    path.includes(".") ||
    path === "index.html"
  ) {
    return null;
  }

  return path;
}

export async function fetchCanvasFromNeon(slug: string): Promise<CanvasData | null> {
  try {
    const res = await fetch(`/api/canvases/${encodeURIComponent(slug)}`);
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      throw new Error(`Failed to fetch canvas: ${res.statusText}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching canvas from Neon:", error);
    return null;
  }
}

export async function fetchCanvasVersionFromNeon(
  slug: string,
  versionNumber: number,
): Promise<{
  elements: any[];
  app_state: any;
  files: any;
  version_number: number;
  created_at: string;
} | null> {
  try {
    const res = await fetch(
      `/api/canvases/${encodeURIComponent(slug)}/versions/${versionNumber}`,
    );
    if (!res.ok) {
      throw new Error(`Failed to fetch version: ${res.statusText}`);
    }
    const data = await res.json();
    return data.version;
  } catch (error) {
    console.error("Error fetching version from Neon:", error);
    return null;
  }
}

export async function saveCanvasToNeon(payload: {
  slug: string;
  title?: string;
  elements: readonly any[];
  appState?: any;
  files?: any;
  note?: string;
}): Promise<{
  success: boolean;
  slug: string;
  title: string;
  version: CanvasVersionSummary;
}> {
  // Strip non-serializable fields from appState
  const safeAppState = payload.appState
    ? {
        viewBackgroundColor: payload.appState.viewBackgroundColor,
        gridSize: payload.appState.gridSize,
        gridStep: payload.appState.gridStep,
        theme: payload.appState.theme,
      }
    : {};

  const res = await fetch(`/api/canvases/${encodeURIComponent(payload.slug)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: payload.title || payload.slug,
      elements: payload.elements,
      appState: safeAppState,
      files: payload.files || {},
      note: payload.note || "",
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Save failed with status ${res.status}`);
  }

  return await res.json();
}

export async function deleteCanvasFromNeon(slug: string): Promise<boolean> {
  const res = await fetch(`/api/canvases/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete canvas: ${res.statusText}`);
  }
  const data = await res.json();
  return data.deleted;
}

export async function listAllCanvasesFromNeon(): Promise<any[]> {
  try {
    const res = await fetch("/api/canvases");
    if (!res.ok) return [];
    const data = await res.json();
    return data.canvases || [];
  } catch (error) {
    console.error("Failed to list canvases:", error);
    return [];
  }
}
