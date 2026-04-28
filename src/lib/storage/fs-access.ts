/**
 * Wraps the File System Access API with a graceful fallback for browsers
 * that don't expose it (Firefox, Safari at time of writing).
 */

interface FSPickerType {
  description: string;
  accept: Record<string, string[]>;
}

interface SaveOptions {
  suggestedName: string;
  types: FSPickerType[];
}

interface OpenOptions {
  types: FSPickerType[];
  multiple?: boolean;
}

type WindowWithFS = typeof window & {
  showSaveFilePicker?: (opts: {
    suggestedName: string;
    types: FSPickerType[];
  }) => Promise<FileSystemFileHandle>;
  showOpenFilePicker?: (opts: {
    types: FSPickerType[];
    multiple?: boolean;
  }) => Promise<FileSystemFileHandle[]>;
};

export function hasFSAccess(): boolean {
  const w = window as WindowWithFS;
  return typeof w.showSaveFilePicker === "function";
}

export async function saveTextFile(
  contents: string,
  opts: SaveOptions,
  mime = "application/json",
): Promise<void> {
  const w = window as WindowWithFS;
  if (w.showSaveFilePicker) {
    const handle = await w.showSaveFilePicker({
      suggestedName: opts.suggestedName,
      types: opts.types,
    });
    const writable = await handle.createWritable();
    await writable.write(new Blob([contents], { type: mime }));
    await writable.close();
    return;
  }
  // Fallback: anchor download.
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = opts.suggestedName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

type OpenedFile = {
  name: string;
  text: string;
};

export async function openTextFile(opts: OpenOptions): Promise<OpenedFile | null> {
  const w = window as WindowWithFS;
  if (w.showOpenFilePicker) {
    const handles = await w.showOpenFilePicker({
      types: opts.types,
      multiple: false,
    });
    const handle = handles[0];
    if (!handle) return null;
    const file = await handle.getFile();
    return { name: file.name, text: await file.text() };
  }
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    const accept = opts.types.flatMap((t) => Object.values(t.accept).flat()).join(",");
    input.accept = accept;
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      resolve({ name: file.name, text: await file.text() });
    });
    input.click();
  });
}
