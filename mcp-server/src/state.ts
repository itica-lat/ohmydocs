import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

// ─── Types (mirrored from @/types/schemas) ───────────────────────────────

export interface Palette {
  [key: string]: string;
}

export interface GoogleFontRef {
  family: string;
  weights: number[];
  italics: boolean;
  category: "serif" | "sans" | "mono";
}

export interface BrandingProfile {
  id: string;
  name: string;
  palette: Palette;
  fonts: {
    serif: GoogleFontRef;
    sans: GoogleFontRef;
    mono: GoogleFontRef;
  };
  logo: { dataUrl: string; width: number; height: number } | null;
  banner: { dataUrl: string; width: number; height: number } | null;
  readOnly?: boolean;
}

export interface HeaderConfig {
  left: string;
  right: string;
  showOnFirstPage: boolean;
  showPageNumber: boolean;
}

export interface DocumentMetadata {
  author: string;
  team: string;
  institution: string;
  date: string;
  customFields: Record<string, string>;
  header: HeaderConfig;
  footer: HeaderConfig;
}

export interface Block {
  id: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface OhmyDocument {
  id: string;
  title: string;
  metadata: DocumentMetadata;
  brandingId: string;
  templateId: string | null;
  blocks: Block[];
  htmlContent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  blocks: Block[];
  branding: BrandingProfile;
  defaultMetadata: Partial<DocumentMetadata>;
  readOnly?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Defaults ────────────────────────────────────────────────────────────

const DEFAULT_PALETTE: Palette = {
  "color-ink-deepest": "#0b0e14",
  "color-ink-deep": "#1a1f2e",
  "color-accent": "#7c3aed",
  "color-accent-soft": "#a78bfa",
  "color-paper": "#ffffff",
  "color-paper-soft": "#f9fafb",
  "color-rule": "#e5e7eb",
  "color-mute": "#9ca3af",
  "color-ink-on-dark": "#ffffff",
};

const ETERNUM_SANS: GoogleFontRef = {
  family: "DM Sans",
  weights: [400, 500, 700],
  italics: true,
  category: "sans",
};

const ETERNUM_SERIF: GoogleFontRef = {
  family: "DM Serif Display",
  weights: [400],
  italics: false,
  category: "serif",
};

const ETERNUM_MONO: GoogleFontRef = {
  family: "DM Mono",
  weights: [400, 500],
  italics: false,
  category: "mono",
};

export const ETERNUM_BRANDING: BrandingProfile = {
  id: "branding:eternum-default",
  name: "Eternum (default)",
  palette: DEFAULT_PALETTE,
  fonts: { serif: ETERNUM_SERIF, sans: ETERNUM_SANS, mono: ETERNUM_MONO },
  logo: null,
  banner: null,
  readOnly: true,
};

const ETERNUM_BRANDING_ID = "branding:eternum-default";

// ─── Helpers (exported for use in tool files) ────────────────────────────

export function ulid(): string {
  const chars = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  const timestamp = Date.now().toString(36);
  let id = timestamp;
  for (let i = id.length; i < 26; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export function nowISO(): string {
  return new Date().toISOString();
}

function today(): string {
  return nowISO().slice(0, 10);
}

function emptyDocument(title = "Untitled document"): OhmyDocument {
  const now = nowISO();
  return {
    id: `doc_${ulid()}`,
    title,
    metadata: {
      author: "",
      team: "",
      institution: "",
      date: today(),
      customFields: {},
      header: {
        left: "",
        right: "",
        showOnFirstPage: false,
        showPageNumber: true,
      },
      footer: {
        left: "",
        right: "",
        showOnFirstPage: true,
        showPageNumber: true,
      },
    },
    brandingId: ETERNUM_BRANDING_ID,
    templateId: null,
    blocks: [],
    createdAt: now,
    updatedAt: now,
  };
}

// ─── State Manager ───────────────────────────────────────────────────────

interface PersistedState {
  documents: Record<string, OhmyDocument>;
  branding: Record<string, BrandingProfile>;
  activeBrandingId: string;
  templates: Record<string, Template>;
}

const STATE_DIR = join(import.meta.dirname, "..", "data");
const STATE_FILE = join(STATE_DIR, "state.json");

class StateManager {
  private state: PersistedState = {
    documents: {},
    branding: { [ETERNUM_BRANDING_ID]: ETERNUM_BRANDING },
    activeBrandingId: ETERNUM_BRANDING_ID,
    templates: {},
  };

  // ── Persistence ──

  private persist(): void {
    if (!existsSync(STATE_DIR)) {
      mkdirSync(STATE_DIR, { recursive: true });
    }
    writeFileSync(STATE_FILE, JSON.stringify(this.state, null, 2), "utf-8");
  }

  loadPersisted(): void {
    if (existsSync(STATE_FILE)) {
      try {
        const raw = readFileSync(STATE_FILE, "utf-8");
        const parsed = JSON.parse(raw) as PersistedState;
        // Ensure defaults exist
        if (!parsed.branding[ETERNUM_BRANDING_ID]) {
          parsed.branding[ETERNUM_BRANDING_ID] = ETERNUM_BRANDING;
        }
        if (!parsed.activeBrandingId) {
          parsed.activeBrandingId = ETERNUM_BRANDING_ID;
        }
        this.state = parsed;
        console.error(`State loaded from ${STATE_FILE}`);
      } catch (e) {
        console.error(`Failed to load state: ${e}`);
      }
    } else {
      console.error("No persisted state found, starting fresh");
    }
  }

  // ── Getters ──

  getState(): PersistedState {
    return this.state;
  }

  get documents(): Record<string, OhmyDocument> {
    return this.state.documents;
  }

  get branding(): Record<string, BrandingProfile> {
    return this.state.branding;
  }

  get activeBrandingId(): string {
    return this.state.activeBrandingId;
  }

  get templates(): Record<string, Template> {
    return this.state.templates;
  }

  // ── Documents ──

  createDocument(title?: string): OhmyDocument {
    const doc = emptyDocument(title);
    this.state.documents[doc.id] = doc;
    this.persist();
    return doc;
  }

  getDocument(id: string): OhmyDocument | undefined {
    return this.state.documents[id];
  }

  updateDocument(id: string, updates: Partial<OhmyDocument>): OhmyDocument | undefined {
    const doc = this.state.documents[id];
    if (!doc) return undefined;
    const updated = { ...doc, ...updates, id: doc.id, createdAt: doc.createdAt, updatedAt: nowISO() };
    this.state.documents[id] = updated;
    this.persist();
    return updated;
  }

  deleteDocument(id: string): boolean {
    if (!this.state.documents[id]) return false;
    delete this.state.documents[id];
    this.persist();
    return true;
  }

  listDocuments(): OhmyDocument[] {
    return Object.values(this.state.documents).sort(
      (a, b) => (a.updatedAt < b.updatedAt ? 1 : -1),
    );
  }

  // ── Branding ──

  listBrandingProfiles(): BrandingProfile[] {
    return Object.values(this.state.branding);
  }

  getBrandingProfile(id: string): BrandingProfile | undefined {
    return this.state.branding[id];
  }

  upsertBrandingProfile(profile: BrandingProfile): void {
    this.state.branding[profile.id] = profile;
    this.persist();
  }

  deleteBrandingProfile(id: string): boolean {
    if (id === ETERNUM_BRANDING_ID) return false;
    if (!this.state.branding[id]) return false;
    delete this.state.branding[id];
    if (this.state.activeBrandingId === id) {
      this.state.activeBrandingId = ETERNUM_BRANDING_ID;
    }
    this.persist();
    return true;
  }

  setActiveBrandingId(id: string): void {
    if (this.state.branding[id]) {
      this.state.activeBrandingId = id;
      this.persist();
    }
  }

  // ── Templates ──

  listTemplates(): Template[] {
    return Object.values(this.state.templates);
  }

  getTemplate(id: string): Template | undefined {
    return this.state.templates[id];
  }

  upsertTemplate(tpl: Template): void {
    this.state.templates[tpl.id] = tpl;
    this.persist();
  }

  deleteTemplate(id: string): boolean {
    const tpl = this.state.templates[id];
    if (tpl?.readOnly) return false;
    if (!this.state.templates[id]) return false;
    delete this.state.templates[id];
    this.persist();
    return true;
  }

  instantiateTemplate(templateId: string): OhmyDocument | null {
    const tpl = this.state.templates[templateId];
    if (!tpl) return null;
    const now = nowISO();
    const doc: OhmyDocument = {
      id: `doc_${ulid()}`,
      title: tpl.name,
      metadata: {
        author: tpl.defaultMetadata.author ?? "",
        team: tpl.defaultMetadata.team ?? "",
        institution: tpl.defaultMetadata.institution ?? "",
        date: tpl.defaultMetadata.date ?? today(),
        customFields: tpl.defaultMetadata.customFields ?? {},
        header: tpl.defaultMetadata.header ?? {
          left: "",
          right: "",
          showOnFirstPage: false,
          showPageNumber: true,
        },
        footer: tpl.defaultMetadata.footer ?? {
          left: "",
          right: "",
          showOnFirstPage: true,
          showPageNumber: true,
        },
      },
      brandingId: tpl.branding.id,
      templateId: tpl.id,
      blocks: tpl.blocks.map((b) => ({
        ...b,
        id: `blk_${ulid()}`,
      })),
      createdAt: now,
      updatedAt: now,
    };
    this.state.documents[doc.id] = doc;
    this.persist();
    return doc;
  }
}

export const stateManager = new StateManager();
