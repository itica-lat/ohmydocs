export type Locale = "en" | "es"

export const translations = {
  en: {
    "sidebar.documents": "Documents",
    "sidebar.new": "New",
    "sidebar.empty": "No documents yet.",
    "sidebar.emptyHint": "Click New to start your first Eternum document.",
    "toolbar.read": "Read",
    "toolbar.edit": "Edit",
    "toolbar.pure": "Pure",
    "toolbar.exitPure": "Exit Pure",
    "toolbar.zoomOut": "Zoom out",
    "toolbar.zoomIn": "Zoom in",
    "toolbar.exportHtml": "HTML",
    "toolbar.exportMd": "MD",
    "toolbar.exportJson": "JSON",
    "toolbar.darkMode": "Dark",
    "toolbar.lightMode": "Light",
    "rightPanel.metadata": "Metadata",
    "rightPanel.branding": "Branding",
    "rightPanel.templates": "Templates",
    "rightPanel.noDoc": "Open a document to edit its metadata.",
    "landing.title": "Welcome to OhMyDocs!",
    "landing.subtitle":
      "Select a document from the sidebar or create a new one to get started.",
    "insert.label": "Add block",
  },
  es: {
    "sidebar.documents": "Documentos",
    "sidebar.new": "Nuevo",
    "sidebar.empty": "Sin documentos aun.",
    "sidebar.emptyHint":
      "Haz clic en Nuevo para crear tu primer documento Eternum.",
    "toolbar.read": "Leer",
    "toolbar.edit": "Editar",
    "toolbar.pure": "Puro",
    "toolbar.exitPure": "Salir",
    "toolbar.zoomOut": "Alejar",
    "toolbar.zoomIn": "Acercar",
    "toolbar.exportHtml": "HTML",
    "toolbar.exportMd": "MD",
    "toolbar.exportJson": "JSON",
    "toolbar.darkMode": "Oscuro",
    "toolbar.lightMode": "Claro",
    "rightPanel.metadata": "Metadatos",
    "rightPanel.branding": "Marca",
    "rightPanel.templates": "Plantillas",
    "rightPanel.noDoc": "Abre un documento para editar sus metadatos.",
    "landing.title": "Bienvenido a OhMyDocs!",
    "landing.subtitle":
      "Selecciona un documento del panel o crea uno nuevo para comenzar.",
    "insert.label": "Agregar bloque",
  },
} satisfies Record<Locale, Record<string, string>>

export type TranslationKey = keyof typeof translations["en"]
