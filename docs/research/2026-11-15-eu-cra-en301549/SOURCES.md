# Sources — EN 301 549 V4.1.1 OJEU Status & EU Cyber Resilience Act Open-Source Scope

Downloaded sequentially with `curl -sS -L --max-time 60` (1-second pause between requests), recorded verbatim in [`FETCH-LOG.txt`](FETCH-LOG.txt). Integrity manifest: [`fuentes/MANIFEST.sha256`](fuentes/MANIFEST.sha256) (`cd fuentes && shasum -a 256 -c MANIFEST.sha256`). Plain-text derivations in `texto/` generated via `python3 -I html_to_text.py` for deterministic line-level quote verification (`python3 -I check_quotes.py`).

| ID | Saved File in `fuentes/` | Requested URL | HTTP | Notes |
| --- | --- | --- | --- | --- |
| `E01` | `E01-ec-accessible-eu-en-301-549-v4-1-1.html` | `https://accessible-eu-centre.ec.europa.eu/content-corner/news/european-accessibility-standard-en-301-549-has-been-updated-2026-09-07_en` | `200` | Primary European Commission (DG Justice and Consumers / AccessibleEU) publication (`78,571` bytes) |
| `E02` | `E02-ec-digital-strategy-cra-open-source.html` | `https://digital-strategy.ec.europa.eu/en/policies/cra-open-source` | `503` | `503 - Backend fetch failed` (`40,650` bytes EU error page). Preserved as proof of attempt; **BLOCKED** (not cited for substantive CRA rules) |
| `E03` | `E03-openresource-cra-for-maintainers.html` | `https://openresource.dev/articles/cyber-resilience-act-for-maintainers/` | `200` | Secondary maintainer reference (`67,363` bytes, `CC BY-SA 4.0`, updated `2026-10-07`) summarizing Regulation (EU) 2024/2847 & Commission Guidance of `2026-07-27` |
