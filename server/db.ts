import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn("WARNING: DATABASE_URL is not set. Neon operations will fail until it is provided.");
}

export const sql = databaseUrl ? neon(databaseUrl) : null;

let isInitialized = false;

export async function initDb() {
  if (isInitialized || !sql) {
    return;
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS canvases (
        id SERIAL PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS canvas_versions (
        id SERIAL PRIMARY KEY,
        canvas_slug TEXT NOT NULL,
        version_number INT NOT NULL,
        elements JSONB NOT NULL,
        app_state JSONB DEFAULT '{}'::jsonb,
        files JSONB DEFAULT '{}'::jsonb,
        note TEXT DEFAULT '',
        element_count INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_canvas_versions_slug 
      ON canvas_versions(canvas_slug);
    `;

    isInitialized = true;
    console.log("Neon database schema verified/initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Neon database:", error);
    throw error;
  }
}

export interface CanvasVersionMeta {
  id: number;
  canvas_slug: string;
  version_number: number;
  note: string;
  element_count: number;
  created_at: string;
}

export interface CanvasRecord {
  id: number;
  slug: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export async function listCanvases() {
  await initDb();
  if (!sql) throw new Error("DATABASE_URL is not configured");

  const rows = await sql`
    SELECT 
      c.id,
      c.slug,
      c.title,
      c.created_at,
      c.updated_at,
      COALESCE(MAX(v.version_number), 0) as total_versions,
      MAX(v.created_at) as last_saved_at
    FROM canvases c
    LEFT JOIN canvas_versions v ON c.slug = v.canvas_slug
    GROUP BY c.id, c.slug, c.title, c.created_at, c.updated_at
    ORDER BY c.updated_at DESC
  `;

  return rows;
}

export async function getCanvas(slug: string) {
  await initDb();
  if (!sql) throw new Error("DATABASE_URL is not configured");

  const canvasRows = await sql`
    SELECT * FROM canvases WHERE slug = ${slug} LIMIT 1
  `;

  if (!canvasRows || canvasRows.length === 0) {
    return null;
  }

  const canvas = canvasRows[0];

  const versionRows = await sql`
    SELECT id, canvas_slug, version_number, note, element_count, created_at
    FROM canvas_versions
    WHERE canvas_slug = ${slug}
    ORDER BY version_number DESC
  `;

  const latestContentRows = await sql`
    SELECT elements, app_state, files, version_number, created_at
    FROM canvas_versions
    WHERE canvas_slug = ${slug}
    ORDER BY version_number DESC
    LIMIT 1
  `;

  const latest = latestContentRows.length > 0 ? latestContentRows[0] : null;

  return {
    canvas,
    versions: versionRows,
    latest,
  };
}

export async function getCanvasVersion(slug: string, versionNumber: number) {
  await initDb();
  if (!sql) throw new Error("DATABASE_URL is not configured");

  const rows = await sql`
    SELECT id, canvas_slug, version_number, elements, app_state, files, note, element_count, created_at
    FROM canvas_versions
    WHERE canvas_slug = ${slug} AND version_number = ${versionNumber}
    LIMIT 1
  `;

  return rows.length > 0 ? rows[0] : null;
}

export async function saveCanvasVersion(data: {
  slug: string;
  title?: string;
  elements: any;
  appState?: any;
  files?: any;
  note?: string;
}) {
  await initDb();
  if (!sql) throw new Error("DATABASE_URL is not configured");

  const cleanSlug = data.slug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "-");
  const title = data.title || cleanSlug;
  const elements = data.elements || [];
  const appState = data.appState || {};
  const files = data.files || {};
  const note = data.note || "";
  const elementCount = Array.isArray(elements) ? elements.length : 0;

  // 1. Upsert canvas record
  await sql`
    INSERT INTO canvases (slug, title, updated_at)
    VALUES (${cleanSlug}, ${title}, NOW())
    ON CONFLICT (slug)
    DO UPDATE SET 
      title = EXCLUDED.title,
      updated_at = NOW()
  `;

  // 2. Determine next version number
  const versionCountRows = await sql`
    SELECT COALESCE(MAX(version_number), 0) + 1 as next_version
    FROM canvas_versions
    WHERE canvas_slug = ${cleanSlug}
  `;

  const nextVersion = Number(versionCountRows[0].next_version) || 1;

  // 3. Insert new version
  const insertedRows = await sql`
    INSERT INTO canvas_versions (
      canvas_slug,
      version_number,
      elements,
      app_state,
      files,
      note,
      element_count,
      created_at
    )
    VALUES (
      ${cleanSlug},
      ${nextVersion},
      ${JSON.stringify(elements)},
      ${JSON.stringify(appState)},
      ${JSON.stringify(files)},
      ${note},
      ${elementCount},
      NOW()
    )
    RETURNING id, canvas_slug, version_number, note, element_count, created_at
  `;

  return {
    slug: cleanSlug,
    title,
    version: insertedRows[0],
  };
}

export async function deleteCanvas(slug: string) {
  await initDb();
  if (!sql) throw new Error("DATABASE_URL is not configured");

  await sql`
    DELETE FROM canvas_versions WHERE canvas_slug = ${slug}
  `;

  const result = await sql`
    DELETE FROM canvases WHERE slug = ${slug}
    RETURNING slug
  `;

  return { deleted: result.length > 0 };
}
