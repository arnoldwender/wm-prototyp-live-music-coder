# Rechtliche Prüfung — live-music-coder.pro

**Datum:** 2026-05-09
**Geschäftstyp:** Live-Coding Music IDE (Browser-SPA + Electron-App)
**Stack:** Vite 8 + React 19 + TypeScript + Strudel + Tone.js + WebMIDI · CodeMirror 6 · Zustand · IndexedDB · Tailwind 4 · i18n (DE/EN/ES)
**Domain:** live-music-coder.pro
**Eigentümer:** Wender Media · Arnold Wender · Franckestraße 3a · 06110 Halle (Saale) · USt-IdNr DE253389445

---

## Disclaimer

Keine Rechtsberatung. Anwaltsfreigabe vor Live empfohlen.

---

## Compliance-Scorecard

| Bereich | Status | Wertung |
|---|---|---|
| §5 DDG Impressum | ✅ Konform | 22 / 25 |
| DSGVO/TTDSG (LfD Sachsen-Anhalt) | ⚠️ Inline-Fix angewandt | 22 / 25 |
| UWG / Trust-Signale | ✅ Konform | 22 / 25 |
| BFSG | ⚠️ Review nötig | 18 / 25 |
| **License Policy (kritisch)** | ❌ Verstoß WM Hard Rule | — |
| **Gesamt** | | **84 / 100** |

**Abmahnrisiko:** 🟢 NIEDRIG (DSGVO/UWG)
**License-Policy-Risiko:** 🔴 **HOCH** (siehe unten)

---

## Detail-Findings

### ⚠️ Inline-Fix angewandt — D1 Aufsichtsbehörde fehlte konkret
**Fix:** `src/data/legal.ts` — bestehender DATENSCHUTZ_HTML-Block "Beschwerderecht bei der zuständigen Aufsichtsbehörde" um konkrete LfD-Sachsen-Anhalt-Anschrift erweitert.

### ✅ Konform (Vorzüge)
- §5 DDG Impressum + USt-IdNr DE253389445 (in `IMPRESSUM_HTML`)
- DSA-Kontaktstelle (Art. 11 DSA) — Pflichtangabe vorhanden, vorbildlich
- Streitbeilegung-Hinweis vorhanden
- TDDDG §25 Abs. 2 korrekt referenziert (technisch notwendige Speicherung)
- localStorage/IndexedDB/SessionStorage-Verwendung transparent dokumentiert
- GitHub-Gist-Integration: DSGVO Art. 6 Abs. 1 lit. a (Einwilligung) + DPF-Hinweis korrekt
- Keine Drittanbieter-Tracking, keine Cookies (true client-side SPA)
- Systemschriftarten — kein Google Fonts dynamisch (TTDSG-konform)

### ❌ KRITISCH — License Policy Violation (Hard WM Rule)
**Befund:** Repo verwendet **`SPDX-License-Identifier: MIT`** + `AGPL-3.0-or-later` Headers in den Quelldateien (siehe CLAUDE.md: "Dual license: AGPL-3.0-or-later + MIT").

**Verstoß gegen `~/.claude/CLAUDE.md` License Policy:**
> NEVER apply any open-source license to Arnold's work.
> Prohibited: MIT, Apache, CC BY, BSD, GPL, LGPL, AGPL, MPL, CC0, public domain, or any open-source variant.

**Falsifier:** `git log -p --all | grep -E "MIT License|AGPL"` → bestätigt Verstoß.

**Komplikation:** Strudel-Pakete (`@strudel/*`) sind tatsächlich AGPL-3.0 — bei Code-Verlinkung muss die App selbst AGPL-konform bleiben. Das ist eine echte rechtliche Notwendigkeit, KEIN Wahl-Element.

**Empfehlung:** [NEEDS ARNOLD] Klärung der Lizenzstrategie — ist AGPL-Vererbung gewünscht (= App muss AGPL bleiben) oder soll Strudel-Code entkoppelt werden (separate AGPL-Library, App proprietär)?

---

## Inline-Fixes (Sprint-Commit)

| File | Mechanik |
|---|---|
| `src/data/legal.ts` | LfD Sachsen-Anhalt konkret in DATENSCHUTZ_HTML ergänzt |

---

## Manuelle Folgeaktionen [NEEDS ARNOLD]

1. **🔴 BLOCKER (License Policy):** Lizenzstrategie klären
   - Option A: AGPL akzeptieren (Strudel-Vererbung, App offen)
   - Option B: Strudel-Code in separater AGPL-Library + App-Wrapper proprietär (technisch aufwendig)
   - Option C: Strudel komplett entfernen + alternative Audio-Engine (Tone.js bleibt MIT, aber Strudel-Features gehen verloren)
2. **Anwaltsfreigabe** Lizenz-Compliance + DSE
3. **BFSG Anlage 3**
4. **Gist-Token-Speicherung** verifizieren (sessionStorage default = gut, localStorage opt-in = gut)
5. **Electron-Desktop-Build** falls publiziert: separate App-Datenschutzerklärung (e-Recht 24 `Datenschutzerlaerung-Apps-deutsch.pdf`)

---

## Sprint-Commit

`[Audit Legal-DE] Compliance v1+v2 + license-policy-flag + report — live-music-coder`
