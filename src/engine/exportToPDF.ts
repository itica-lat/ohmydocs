const PRINT_MODE_CLASS = "ohmydocs-print-mode";

/**
 * exportToPDF()
 *
 * Adds a CSS class to the document root that hides all app chrome (sidebar,
 * toolbar, etc.) via the companion @media print rules in print.css, then
 * triggers window.print(). The class is removed after the print dialog closes.
 *
 * Works in all modern browsers. The resulting PDF quality depends on the
 * browser's print-to-PDF engine. For pixel-perfect server-side output see the
 * Puppeteer stub below.
 */
export function exportToPDF(): void {
  const root = document.documentElement;
  root.classList.add(PRINT_MODE_CLASS);

  // Give the browser one frame to apply styles before opening the dialog.
  requestAnimationFrame(() => {
    window.print();
    root.classList.remove(PRINT_MODE_CLASS);
  });
}

// ── Puppeteer server-side stub ────────────────────────────────────────────────
//
// Integration point for headless PDF export:
//
//   import puppeteer from "puppeteer";
//
//   export async function exportToPDFServer(url: string, outputPath: string): Promise<void> {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto(url, { waitUntil: "networkidle0" });
//
//     // The engine renders fixed-size page sheets, so we set the PDF page
//     // dimensions to match PAGE_CONFIG exactly (794 × 1122 px at 96 dpi).
//     await page.pdf({
//       path: outputPath,
//       width: "794px",
//       height: "1122px",
//       printBackground: true,
//       margin: { top: 0, bottom: 0, left: 0, right: 0 },
//     });
//
//     await browser.close();
//   }
//
// Mount the app at `url` with ?mode=print in the query string, detect it in
// DocumentEditor, and render only the <PageRenderer> without the app shell.
