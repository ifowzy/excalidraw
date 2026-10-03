import { Router, Request, Response } from "express";
import {
  getCanvas,
  getCanvasVersion,
  saveCanvasVersion,
  deleteCanvas,
  listCanvases,
} from "./db";

export const apiRouter = Router();

// List all saved canvases
apiRouter.get("/canvases", async (_req: Request, res: Response) => {
  try {
    const canvases = await listCanvases();
    res.json({ success: true, canvases });
  } catch (error: any) {
    console.error("Error listing canvases:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to list canvases" });
  }
});

// Get a canvas by slug with version list and latest data
apiRouter.get("/canvases/:slug", async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug);
    const canvasData = await getCanvas(slug);
    if (!canvasData) {
      return res.status(404).json({ success: false, error: "Canvas not found" });
    }
    res.json({ success: true, ...canvasData });
  } catch (error: any) {
    console.error("Error fetching canvas:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch canvas" });
  }
});

// Get a specific version of a canvas
apiRouter.get("/canvases/:slug/versions/:version", async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug);
    const versionNumber = parseInt(String(req.params.version), 10);
    if (isNaN(versionNumber)) {
      return res.status(400).json({ success: false, error: "Invalid version number" });
    }

    const versionData = await getCanvasVersion(slug, versionNumber);
    if (!versionData) {
      return res.status(404).json({ success: false, error: "Version not found" });
    }

    res.json({ success: true, version: versionData });
  } catch (error: any) {
    console.error("Error fetching version:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to fetch version" });
  }
});

// Save a new version for a canvas slug
apiRouter.post("/canvases/:slug", async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug);
    const { title, elements, appState, files, note } = req.body;

    if (!elements || !Array.isArray(elements)) {
      return res.status(400).json({ success: false, error: "Elements array is required" });
    }

    const saved = await saveCanvasVersion({
      slug,
      title,
      elements,
      appState,
      files,
      note,
    });

    res.json({ success: true, ...saved });
  } catch (error: any) {
    console.error("Error saving canvas:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to save canvas" });
  }
});

// Delete a canvas and all versions
apiRouter.delete("/canvases/:slug", async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug);
    const result = await deleteCanvas(slug);
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Error deleting canvas:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to delete canvas" });
  }
});
