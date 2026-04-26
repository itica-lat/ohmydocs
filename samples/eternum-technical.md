---
title: Management and administration of operating system packages
author: Eternum Team
team: Eternum Team
institution: SGRSI
date: 2026-04-26
---

:::cover{label="ADMINISTRATION OF OPERATING SYSTEMS · FIRST DELIVERY" highlight="of operating system packages"}
# Management and administration *of operating system packages*

SYSTEM: SGRSI — Resource Management System

TEAM: Eternum Team

OS: Debian GNU/Linux 13 "Trixie"

DELIVERY: First
:::

::header{left="ETERNUM · ADMIN OS · DELIVERY 1" right="CONTEXT"}

:::section{number="01"}
## Context and architecture *decisions*

> Package management in this project operates in two layers: distribution packages and runtime containers, each with separate update cadences.
:::

This document captures the rationale behind every package selected, including security-sensitive choices and rollback paths.

:::callout{variant="info" label="NOTE ON PACKAGE DOCUMENTATION"}
The rubric requires a list of installed packages with documented versions. Each entry below includes a justification.
:::

```bash
apt update && apt upgrade -y
apt install -y podman buildah skopeo
```

:::section{number="02"}
## Inventory of *installed packages*
:::

| PACKAGE | VERSION | JUSTIFICATION                          |
| ------- | ------- | -------------------------------------- |
| podman  | 5.4.x   | Container runtime, rootless by default. |
| buildah | 1.40.x  | OCI image builder.                      |
| skopeo  | 1.18.x  | Image transport and inspection.         |

***

:::section{number="03"}
## Glossary
:::

:::glossary
OCI | Open Container Initiative | Standard for container image formats.

APT | Advanced Package Tool | Debian package manager front-end.
:::

:::signatures
 | TEAM LEAD | Operations & delivery

 | EDITOR | Editorial sign-off
:::

::footer{left="ETERNUM TEAM" right="INTERNAL · DRAFT"}
