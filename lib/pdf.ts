/**
 * Native PDF generation for both resume templates using pdf-lib.
 * Pure module — no browser APIs — so it can run in the app and in node tests.
 * Layout, type scale and colors mirror the Word templates:
 *   Title: Lexend Medium 24pt #373742 · Subtitle: Lexend 12pt
 *   Body: Lexend Light 11pt #373742 · Section headings: 10pt #ea1b3d
 */
import { PDFDocument, PDFFont, PDFImage, PDFPage, rgb, type RGB } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { ExternalResume, InternalResume, ResumeData, TemplateId } from "./schemas";

export interface PdfAssets {
  lexendLight: Uint8Array;
  lexend: Uint8Array;
  lexendMedium: Uint8Array;
  logoPng: Uint8Array;
}

const PAGE_W = 612; // US Letter, points
const PAGE_H = 792;

const RED = rgb(0xea / 255, 0x1b / 255, 0x3d / 255);
const DARK = rgb(0x37 / 255, 0x37 / 255, 0x42 / 255);
const BLACK = rgb(0, 0, 0); // Title/Subtitle styles in the Word templates are pure black

const BODY_SIZE = 11;
const BODY_LINE = 17;
const H1_SIZE = 10;
const H2_SIZE = 11;

interface Fonts {
  light: PDFFont;
  regular: PDFFont;
  medium: PDFFont;
}

interface ParaOpts {
  font: PDFFont;
  size: number;
  color?: RGB;
  lineHeight?: number;
  spaceBefore?: number;
  spaceAfter?: number;
  justify?: boolean;
  bullet?: boolean;
  /** extra height that must fit on the page together with the first line (keep-with-next) */
  keepWith?: number;
}

class Doc {
  pages: PDFPage[] = [];
  constructor(
    public pdf: PDFDocument,
    public marginTop: number,
    public marginBottom: number,
  ) {}

  page(i: number): PDFPage {
    while (this.pages.length <= i) this.pages.push(this.pdf.addPage([PAGE_W, PAGE_H]));
    return this.pages[i];
  }
}

/** An independent vertical flow of content (a column). Flows share the
 *  document's pages, so the internal template's two columns fill the same pages. */
class Flow {
  pageIndex = 0;
  y: number;
  pendingSpace = 0;

  constructor(
    private doc: Doc,
    private x: number,
    private width: number,
    startY?: number,
  ) {
    this.y = startY ?? PAGE_H - doc.marginTop;
  }

  private get bottom() {
    return this.doc.marginBottom;
  }

  private breakPage() {
    this.pageIndex += 1;
    this.y = PAGE_H - this.doc.marginTop;
    this.pendingSpace = 0;
  }

  gap(h: number) {
    this.pendingSpace = Math.max(this.pendingSpace, h);
  }

  private wrap(text: string, font: PDFFont, size: number, width: number): string[] {
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length === 0) return [];
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= width || !line) {
        line = candidate;
      } else {
        lines.push(line);
        line = word;
      }
    }
    lines.push(line);
    return lines;
  }

  paragraph(text: string, opts: ParaOpts) {
    const {
      font,
      size,
      color = DARK,
      lineHeight = BODY_LINE,
      spaceBefore = 0,
      spaceAfter = 0,
      justify = false,
      bullet = false,
      keepWith = 0,
    } = opts;

    const indent = bullet ? 14 : 0;
    const textWidth = this.width - indent;
    const lines = this.wrap(text, font, size, textWidth);
    if (lines.length === 0) return;

    // space before (collapses with pending gap), then make sure the first
    // line plus any keep-with-next allowance fits
    const before = Math.max(this.pendingSpace, spaceBefore);
    this.pendingSpace = 0;
    if (this.y - before - lineHeight - keepWith < this.bottom) {
      this.breakPage();
    } else {
      this.y -= before;
    }

    lines.forEach((line, i) => {
      if (this.y - lineHeight < this.bottom) this.breakPage();
      const page = this.doc.page(this.pageIndex);
      const baseline = this.y - lineHeight + (lineHeight - size) / 2 + size * 0.22;
      if (bullet && i === 0) {
        page.drawText("•", { x: this.x + 2, y: baseline, size, font, color });
      }
      const lineX = this.x + indent;
      const isLast = i === lines.length - 1;
      if (justify && !isLast) {
        this.drawJustified(page, line, lineX, baseline, textWidth, font, size, color);
      } else {
        page.drawText(line, { x: lineX, y: baseline, size, font, color });
      }
      this.y -= lineHeight;
    });

    this.pendingSpace = spaceAfter;
  }

  private drawJustified(
    page: PDFPage,
    line: string,
    x: number,
    baseline: number,
    width: number,
    font: PDFFont,
    size: number,
    color: RGB,
  ) {
    const words = line.split(" ");
    if (words.length === 1) {
      page.drawText(line, { x, y: baseline, size, font, color });
      return;
    }
    const wordsWidth = words.reduce((w, word) => w + font.widthOfTextAtSize(word, size), 0);
    const gap = (width - wordsWidth) / (words.length - 1);
    // guard against pathological stretching on very short lines
    const spaceW = font.widthOfTextAtSize(" ", size);
    const gapW = gap > spaceW * 4 ? spaceW : gap;
    let cx = x;
    for (const word of words) {
      page.drawText(word, { x: cx, y: baseline, size, font, color });
      cx += font.widthOfTextAtSize(word, size) + gapW;
    }
  }
}

/* ---------- shared building blocks ---------- */

function sectionHeading(flow: Flow, fonts: Fonts, text: string) {
  flow.paragraph(text, {
    font: fonts.regular,
    size: H1_SIZE,
    color: RED,
    lineHeight: 15,
    spaceBefore: 16,
    spaceAfter: 4,
    keepWith: BODY_LINE * 2,
  });
}

function label(flow: Flow, fonts: Fonts, text: string) {
  flow.paragraph(text, {
    font: fonts.regular,
    size: H2_SIZE,
    lineHeight: BODY_LINE,
    spaceBefore: 7,
    spaceAfter: 1,
    keepWith: BODY_LINE,
  });
}

function body(flow: Flow, fonts: Fonts, text: string, justify = false) {
  flow.paragraph(text, { font: fonts.light, size: BODY_SIZE, justify });
}

function bullets(flow: Flow, fonts: Fonts, items: string[], justify = false) {
  for (const item of items) {
    flow.paragraph(item, { font: fonts.light, size: BODY_SIZE, bullet: true, justify });
  }
}

/** Page-1 header shared by both templates: name block left, logo right. */
function drawHeader(
  doc: Doc,
  fonts: Fonts,
  logo: PDFImage,
  marginX: number,
  data: { name: string; jobTitle: string; experienceSummary: string; specialization: string },
): number {
  const page = doc.page(0);
  const right = PAGE_W - marginX;
  let y = PAGE_H - doc.marginTop;

  // "A PROUD MEMBER OF" + logo, right-aligned
  const memberText = "A PROUD MEMBER OF";
  const memberSize = 8;
  const memberW = fonts.light.widthOfTextAtSize(memberText, memberSize);
  page.drawText(memberText, { x: right - memberW, y: y - memberSize, size: memberSize, font: fonts.light, color: DARK });
  const logoW = 150;
  const logoH = logoW * (logo.height / logo.width);
  page.drawImage(logo, { x: right - logoW, y: y - memberSize - 8 - logoH, width: logoW, height: logoH });
  const logoBottom = y - memberSize - 8 - logoH;

  // name block, left
  y -= 26;
  page.drawText(crop(fonts.medium, 24, data.name, right - marginX - logoW - 20), {
    x: marginX, y: y - 24, size: 24, font: fonts.medium, color: BLACK, // Title style is black
  });
  y -= 24 + 14;
  const sub: Array<[string, PDFFont, number, RGB]> = [
    [data.jobTitle, fonts.regular, 12, BLACK], // Subtitle style is black
    [data.experienceSummary, fonts.light, BODY_SIZE, DARK],
    [data.specialization, fonts.light, BODY_SIZE, DARK],
  ];
  for (const [text, font, size, color] of sub) {
    page.drawText(crop(font, size, text, right - marginX - logoW - 20), {
      x: marginX, y: y - size, size, font, color,
    });
    y -= size + 7;
  }

  return Math.min(y, logoBottom) - 6; // content start Y
}

function crop(font: PDFFont, size: number, text: string, maxWidth: number): string {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  let t = text;
  while (t.length > 1 && font.widthOfTextAtSize(`${t}…`, size) > maxWidth) t = t.slice(0, -1);
  return `${t}…`;
}

/* ---------- template renderers ---------- */

function renderExternal(doc: Doc, fonts: Fonts, logo: PDFImage, d: ExternalResume) {
  const margin = 72; // 1" like the Word template
  const startY = drawHeader(doc, fonts, logo, margin, d);
  const flow = new Flow(doc, margin, PAGE_W - margin * 2, startY);

  // The Word template justifies all body text (docDefaults jc="both"), so the
  // PDF justifies it too to stay visually aligned with the DOCX.
  const ebody = (text: string) => body(flow, fonts, text, true);
  const ebullets = (items: string[]) => bullets(flow, fonts, items, true);

  sectionHeading(flow, fonts, "Overview");
  ebody(d.overview);

  sectionHeading(flow, fonts, "Education & Training");
  for (const edu of d.education) {
    label(flow, fonts, edu.year);
    ebody(edu.qualification);
  }

  sectionHeading(flow, fonts, "Skills");
  ebody(d.skills.join(", "));

  sectionHeading(flow, fonts, "Tools/Certifications");
  ebody(d.toolsAndCertifications.join(", "));

  sectionHeading(flow, fonts, "Projects/Experience");
  d.projects.forEach((p, i) => {
    if (i > 0) flow.gap(10);
    label(flow, fonts, `Project ${i + 1}`);
    ebody(p.client);
    label(flow, fonts, "Team Size");
    ebody(p.teamSize);
    label(flow, fonts, "Role");
    ebody(p.role);
    flow.gap(7);
    ebody(p.description);
    flow.gap(7);
    ebullets(p.responsibilities);
  });

  sectionHeading(flow, fonts, "Experience");
  d.experience.forEach((e, i) => {
    if (i > 0) flow.gap(10);
    label(flow, fonts, e.company);
    ebody(e.position);
    ebody(e.duration);
    flow.gap(7);
    ebullets(e.highlights);
  });
}

function renderInternal(doc: Doc, fonts: Fonts, logo: PDFImage, d: InternalResume) {
  const margin = 43; // 0.6" like the Word template
  const startY = drawHeader(doc, fonts, logo, margin, d);

  // table grid of the Word template: left ~70.7%, right ~29.3%
  const contentW = PAGE_W - margin * 2;
  const leftW = Math.round(contentW * 0.68);
  const rightX = margin + leftW + 18;
  const rightW = PAGE_W - margin - rightX;

  const left = new Flow(doc, margin, leftW, startY);
  const right = new Flow(doc, rightX, rightW, startY);

  /* left column */
  sectionHeading(left, fonts, "Overview");
  body(left, fonts, d.overview, true);

  sectionHeading(left, fonts, "Education & Training");
  for (const edu of d.education) {
    label(left, fonts, edu.year);
    body(left, fonts, edu.qualification);
  }

  if (d.projects.length > 0) {
    sectionHeading(left, fonts, "Projects");
    d.projects.forEach((p, i) => {
      if (i > 0) left.gap(12);
      label(left, fonts, `Project ${i + 1} - ${p.duration}`);
      body(left, fonts, p.title);
      label(left, fonts, "Tools & Technologies");
      body(left, fonts, p.toolsAndTechnologies.join(", "));
      label(left, fonts, "Team Size");
      body(left, fonts, p.teamSize);
      label(left, fonts, "Role");
      body(left, fonts, p.role);
      label(left, fonts, "Project Link");
      body(left, fonts, p.projectLink);
      left.gap(7);
      body(left, fonts, p.description, true);
      left.gap(7);
      bullets(left, fonts, p.responsibilities);
    });
  }

  /* right column (sidebar) */
  sectionHeading(right, fonts, "Skills");
  for (const s of d.skills) {
    label(right, fonts, s.name);
    body(right, fonts, `(${s.rating}/5)`);
  }

  sectionHeading(right, fonts, "Certifications");
  bullets(right, fonts, d.certifications);

  sectionHeading(right, fonts, "Tools");
  bullets(right, fonts, [d.tools.join(", ")]);

  if (d.managerialExperience.length > 0) {
    sectionHeading(right, fonts, "Managerial Experience");
    for (const item of d.managerialExperience) body(right, fonts, item);
  }

  sectionHeading(right, fonts, "Domain");
  for (const item of d.domains) body(right, fonts, item);

  sectionHeading(right, fonts, "Languages");
  for (const item of d.languages) body(right, fonts, item);
}

/* ---------- entry point ---------- */

export async function buildResumePdf(id: TemplateId, data: ResumeData, assets: PdfAssets): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  pdf.setTitle(`${(data as { name?: string }).name ?? "Resume"} — ${id} profile`);

  const fonts: Fonts = {
    light: await pdf.embedFont(assets.lexendLight, { subset: true }),
    regular: await pdf.embedFont(assets.lexend, { subset: true }),
    medium: await pdf.embedFont(assets.lexendMedium, { subset: true }),
  };
  const logo = await pdf.embedPng(assets.logoPng);

  const doc = new Doc(pdf, 40, 48);
  if (id === "external") {
    renderExternal(doc, fonts, logo, data as ExternalResume);
  } else {
    renderInternal(doc, fonts, logo, data as InternalResume);
  }

  return pdf.save();
}
