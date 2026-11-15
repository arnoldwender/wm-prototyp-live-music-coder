# Facts — EN 301 549 v4.1.1 Harmonisation Status & EU Cyber Resilience Act (CRA) Open-Source Scope (2026-11-15)

## Scope & Question

Focused regulatory verification executed during the `v1.3.2` launch-readiness audit of **Live Music Coder** (`2026-11-15`):

1. **Accessibility benchmark (BFSG / EAA / EN 301 549):** Has `EN 301 549 v4.1.1` (which adopts `WCAG 2.2`) already been cited in the Official Journal of the European Union (OJEU) for presumption of conformity, or does `EN 301 549 v3.2.1` (`WCAG 2.1 Level AA`) remain the active harmonised standard while `WCAG 2.2 AA` serves as the forward engineering target?
2. **EU Cyber Resilience Act (`Regulation (EU) 2024/2847`, Article 14 active from 11 September 2026):** How do `Recitals 18–19`, `Article 14`, and `Article 24` distinguish non-monetised Free and Open-Source Software (`AGPL-3.0-or-later` / `MIT`) from commercially monetised software products?

Method: Two targeted web queries ([`BUSQUEDAS.md`](BUSQUEDAS.md)), primary/reference downloads logged in [`FETCH-LOG.txt`](FETCH-LOG.txt) and hashed in [`fuentes/MANIFEST.sha256`](fuentes/MANIFEST.sha256), plain-text derivation via [`html_to_text.py`](html_to_text.py), and automated line-by-line quote verification via `python3 -I check_quotes.py`. This is a focused source note with explicit boundaries, not formal legal advice.

## Summary of Sources

| ID | Source | Status |
| --- | --- | --- |
| `E01` | European Commission — AccessibleEU / DG JUST (`2026-09-07`): *The European accessibility standard EN 301 549 has been updated* | **CONFIRMED** (primary institutional source) |
| `E02` | European Commission — DG CONNECT: *Cyber Resilience Act and Open-Source Software* (`digital-strategy.ec.europa.eu`) | **BLOCKED** (`HTTP 503 Backend fetch failed` at fetch time; saved in `fuentes/` as proof) |
| `E03` | Open {re}Source (`2026-10-07`, `CC BY-SA 4.0`): *The EU Cyber Resilience Act for Open-Source Maintainers, in Plain Words* | **CONFIRMED** (secondary guide indexing `Regulation (EU) 2024/2847` & Commission Guidance of `2026-07-27`; not the primary OJEU statute) |

## Verified Quotes (`check_quotes.py`)

### E01 · EN 301 549 v4.1.1 & OJEU Citation Status · **CONFIRMED**

| # | Claim | `file:line` | Literal Quote |
| --- | --- | --- | --- |
| 1 | Publication date of the AccessibleEU notice | `texto/E01-ec-accessible-eu-en-301-549-v4-1-1.txt:56` | `7 September 2026` |
| 2 | EN 301 549 v4.1.1 published in September 2026 adopts WCAG 2.2 replacing WCAG 2.1 | `texto/E01-ec-accessible-eu-en-301-549-v4-1-1.txt:59` | `A new version of the European accessibility standard, EN 301 549 v4.1.1, was published in September 2026. The biggest change is that it adopts WCAG 2.2 as the accessibility benchmark for websites, software and digital documents, replacing WCAG 2.1.` |
| 3 | v4.1.1 is not yet the active legal reference standard for EAA or WAD | `texto/E01-ec-accessible-eu-en-301-549-v4-1-1.txt:60` | `However, organisations should be aware that the new version is not yet the legal reference standard for demonstrating compliance with the European Accessibility Act (EAA) or the EU Web Accessibility Directive (WAD).` |
| 4 | Until formal OJEU citation, EN 301 549 v3.2.1 (2021, WCAG 2.1 AA) remains the active harmonised reference | `texto/E01-ec-accessible-eu-en-301-549-v4-1-1.txt:61` | `Until the European Commission formally cites EN 301 549 v4.1.1 in the Official Journal of the European Union, the current reference remains EN 301 549 v3.2.1 (2021), which is based on WCAG 2.1 Level AA.` |
| 5 | Presumption of conformity with EAA and WAD attaches once formally cited in OJEU | `texto/E01-ec-accessible-eu-en-301-549-v4-1-1.txt:64` | `Once the standard is formally cited, meeting EN 301 549 v4.1.1 will give organisations a presumption of conformity with both the European Accessibility Act and the Web Accessibility Directive.` |
| 6 | Site managed by European Commission DG Justice and Consumers | `texto/E01-ec-accessible-eu-en-301-549-v4-1-1.txt:80` | `Directorate-General for Justice and Consumers` |

### E02 · European Commission DG CONNECT CRA Open-Source Page · **INFO (BLOCKED)**

| # | Claim | `file:line` | Literal Quote |
| --- | --- | --- | --- |
| 1 | Upstream server returned HTTP 503 backend failure during archival fetch | `texto/E02-ec-digital-strategy-cra-open-source.txt:4` | `503 - Backend fetch failed` |
| 2 | Server unavailability notice | `texto/E02-ec-digital-strategy-cra-open-source.txt:22` | `The server is temporarily unavailable` |

### E03 · CRA Article 14 & Recitals 18–19 FOSS Scope (Secondary Guide) · **CONFIRMED**

| # | Claim | `file:line` | Literal Quote |
| --- | --- | --- | --- |
| 1 | Article last updated October 7, 2026 | `texto/E03-openresource-cra-for-maintainers.txt:12` | `Updated 2026-10-07` |
| 2 | References Regulation (EU) 2024/2847 and the Commission CRA Guidance of July 27, 2026 | `texto/E03-openresource-cra-for-maintainers.txt:15` | `Two texts answer almost everything: the regulation itself, Regulation (EU) 2024/2847, and the Commission’s guidance of July 27, 2026, whose third chapter is about open source, with 22 worked examples.` |
| 3 | Recital 18 excludes open-source software not monetised by its manufacturer; monetisation triggers manufacturer obligations | `texto/E03-openresource-cra-for-maintainers.txt:21` | `Software “not monetised by their manufacturers” is out, in the regulation’s words (recital 18). If you do, you’re its manufacturer, with the full set of obligations.` |
| 4 | Manufacturer reporting of actively exploited vulnerabilities and severe incidents via ENISA Single Reporting Platform started September 11, 2026 | `texto/E03-openresource-cra-for-maintainers.txt:57` | `From September 11, 2026, through ENISA's Single Reporting Platform, for products already on the market too (Articles 14 and 69(3))` |
| 5 | Article 14 reporting timeline for manufacturers: 24h early warning, 72h notification, 14d final report | `texto/E03-openresource-cra-for-maintainers.txt:59` | `Manufacturers send an early warning within 24 hours of becoming aware of an actively exploited vulnerability, a notification within 72 hours, and a final report within 14 days of a fix being available (Article 14).` |
| 6 | Open-source stewards neither affix CE marking (Recital 19) nor face CRA administrative fines (Article 64(10)) | `texto/E03-openresource-cra-for-maintainers.txt:64` | `Stewards can’t put a CE marking on the software (recital 19), and they can’t be fined under the CRA (Article 64(10)).` |

## Engineering Decisions & Boundaries

1. **Accessibility engineering target vs. legal claim precision (`E01`):**
   - We engineer **Live Music Coder** directly against **WCAG 2.2 Level AA** (including SC 2.4.11/2.4.13 focus visibility and SC 2.5.8 `24×24` CSS px target size on inline CodeMirror sliders, plus `44×44` px primary chrome controls) so the application is future-proof ahead of OJEU citation of `EN 301 549 v4.1.1`.
   - Public legal/documentation copy distinguishes voluntary `WCAG 2.2 AA` engineering conformance from formal harmonised-standard presumption of conformity (`EN 301 549 v3.2.1` until OJEU citation).
2. **CRA vulnerability handling (`E02`, `E03`):**
   - As long as **Live Music Coder** is distributed free of charge without paid gating of binaries or security fixes (`AGPL-3.0-or-later` / `MIT`), non-monetised FOSS falls outside commercial `manufacturer` scope (`Recital 18`). We maintain `.github/SECURITY.md` with GitHub Private Vulnerability Reporting (`48h` acknowledgement target) as good open-source security hygiene.
   - **Boundary / Trigger:** Before introducing any paid commercial licensing tier, paid binary distribution, or gated Pro edition in the EU, a primary legal review of `Regulation (EU) 2024/2847` (`Article 14` ENISA 24h/72h/14d reporting and `Article 13` Annex I / SBOM duties from `2027-12-11`) must be completed using the official OJEU text (re-fetching `E02` / EUR-Lex `OJ:L_202402847` when reachable).
