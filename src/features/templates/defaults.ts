import type { Template } from "@/types/schemas"
import type { Block } from "@/blocks/types"
import { blockRegistry } from "@/blocks/registry"
import { ETERNUM_BRANDING } from "@/lib/palette/defaults"

const now = "2026-01-01T00:00:00.000Z"

function fix(blocks: Block[]): Template["blocks"] {
  return blocks.map((b, i) => ({
    ...b,
    id: `seed-${b.type}-${i}`,
    createdAt: now,
    updatedAt: now,
  })) as Template["blocks"]
}

function f<T extends Block["type"]>(
  type: T,
  over: Partial<Extract<Block, { type: T }>>,
): Block {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return blockRegistry[type].factory(over as any) as Block
}

const technical = (): Template => ({
  id: "tpl:eternum-technical",
  name: "Eternum Technical Document",
  description:
    "Cover, sections with decorative numerals, code blocks, glossary, signatures.",
  blocks: fix([
    f("cover", {
      label: "ADMINISTRATION OF OPERATING SYSTEMS · FIRST DELIVERY",
      title: "Management and administration *of operating system packages*",
      highlightWord: "of operating system packages",
      metadata: [
        { label: "SYSTEM", value: "SGRSI — Resource Management System" },
        { label: "TEAM", value: "Eternum Team" },
        { label: "OS", value: 'Debian GNU/Linux 13 "Trixie"' },
        { label: "DELIVERY", value: "First" },
      ],
      callout: null,
    }),
    f("header-bar", {
      left: "ETERNUM · ADMIN OS · DELIVERY 1",
      right: "CONTEXT",
    }),
    f("section", {
      number: "01",
      heading: "Context and architecture *decisions*",
      lead: "Package management in this project operates in two layers: distribution packages and runtime containers, each with separate update cadences.",
    }),
    f("paragraph", {
      text: "This document captures the rationale behind every package selected, including security-sensitive choices and rollback paths.",
    }),
    f("callout", {
      variant: "info",
      label: "NOTE ON PACKAGE DOCUMENTATION",
      body: "The rubric requires a list of installed packages with documented versions. Each entry below includes a justification.",
    }),
    f("code-block", {
      language: "bash",
      code: "apt update && apt upgrade -y\napt install -y podman buildah skopeo",
    }),
    f("section", {
      number: "02",
      heading: "Inventory of *installed packages*",
      lead: "",
    }),
    f("table", {
      headers: ["PACKAGE", "VERSION", "JUSTIFICATION"],
      rows: [
        ["podman", "5.4.x", "Container runtime, rootless by default."],
        ["buildah", "1.40.x", "OCI image builder."],
        ["skopeo", "1.18.x", "Image transport and inspection."],
      ],
    }),
    f("divider", {}),
    f("section", { number: "03", heading: "Glossary", lead: "" }),
    f("glossary-entry", {
      entries: [
        {
          term: "OCI",
          expansion: "Open Container Initiative",
          context: "Standard for container image formats.",
        },
        {
          term: "APT",
          expansion: "Advanced Package Tool",
          context: "Debian package manager front-end.",
        },
      ],
    }),
    f("signature-block", {
      slots: [
        { name: "", role: "TEAM LEAD", description: "Operations & delivery" },
        { name: "", role: "EDITOR", description: "Editorial sign-off" },
      ],
    }),
    f("footer-bar", { left: "ETERNUM TEAM", right: "INTERNAL · DRAFT" }),
  ]),
  branding: ETERNUM_BRANDING,
  defaultMetadata: {
    team: "Eternum Team",
    institution: "",
    customFields: {},
  },
  readOnly: true,
  createdAt: now,
  updatedAt: now,
})

const brief = (): Template => ({
  id: "tpl:eternum-brief",
  name: "Eternum Brief",
  description: "Lighter, prose-forward layout. No decorative numerals.",
  blocks: fix([
    f("mono-label", { text: "ETERNUM · BRIEF" }),
    f("subsection", { heading: "Subject of the *brief*" }),
    f("paragraph", {
      text: "Open with the situation, the audience, and the decision being asked of the reader.",
    }),
    f("paragraph", {
      text: "Continue with the relevant constraints (time, budget, dependencies) and prior art so reviewers can engage without back-channel questions.",
    }),
    f("quote", {
      text: "A brief should be readable in five minutes and disagreed with in ten.",
      attribution: "Internal handbook",
    }),
    f("subsection", { heading: "Recommendation" }),
    f("paragraph", {
      text: "State the recommended path, then list the next two milestones with owners and dates.",
    }),
    f("list", {
      ordered: true,
      items: [
        "Confirm constraints with stakeholders",
        "Land scope by end of week",
      ],
    }),
    f("footer-bar", { left: "ETERNUM BRIEF", right: "CIRCULATE" }),
  ]),
  branding: ETERNUM_BRANDING,
  defaultMetadata: { team: "Eternum Team", customFields: {} },
  readOnly: true,
  createdAt: now,
  updatedAt: now,
})

const reglament = (): Template => ({
  id: "tpl:eternum-reglament",
  name: "Eternum Internal Reglament",
  description: "Formal articles, signatures.",
  blocks: fix([
    f("cover", {
      label: "ETERNUM · INTERNAL REGLAMENT",
      title: "Operational *norms* and procedures",
      highlightWord: "norms",
      metadata: [
        { label: "EFFECTIVE", value: "2026-01-01" },
        { label: "REVISION", value: "01" },
      ],
      callout:
        "This document is binding for all members of Eternum during the cited period.",
    }),
    f("header-bar", { left: "ETERNUM · REGLAMENT", right: "ARTICLES" }),
    f("section", { number: "I", heading: "Object and *scope*", lead: "" }),
    f("paragraph", {
      text: "These norms govern the internal conduct of the Eternum Team while delivering project assignments.",
    }),
    f("section", { number: "II", heading: "Membership and *roles*", lead: "" }),
    f("list", {
      ordered: true,
      items: [
        "Each member is assigned a primary role for each delivery cycle.",
        "Role rotation is permitted between cycles, with team-lead approval.",
      ],
    }),
    f("section", {
      number: "III",
      heading: "Discipline and amendments",
      lead: "",
    }),
    f("paragraph", {
      text: "Amendments to this reglament require a majority vote and a written change record.",
    }),
    f("signature-block", {
      slots: [
        { name: "", role: "PRESIDENT", description: "Eternum Team" },
        { name: "", role: "SECRETARY", description: "Records & ratification" },
      ],
    }),
    f("footer-bar", { left: "ETERNUM REGLAMENT", right: "REV. 01" }),
  ]),
  branding: ETERNUM_BRANDING,
  defaultMetadata: { team: "Eternum Team", customFields: {} },
  readOnly: true,
  createdAt: now,
  updatedAt: now,
})

export const DEFAULT_TEMPLATES: Template[] = [technical(), brief(), reglament()]
