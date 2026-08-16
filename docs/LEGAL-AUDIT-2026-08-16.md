# Rechtliche Prüfung — Live Music Coder (live-music-coder.pro)

**Prüfzeitraum: 2026-08-16/17 · Stand: 2026-08-17 · Vor Verwendung durch Anwalt prüfen lassen /
Pending counsel review.**

Dies ist **keine Rechtsberatung**. Der Verfasser ist kein zugelassener Rechtsanwalt. Dieses Dokument
ist das Arbeitsergebnis einer technisch-rechtlichen Prüfung und dient als Grundlage für eine
anwaltliche Freigabe.

---

## 0 · Prüfgegenstand und Methode

| Feld | Wert |
|---|---|
| Projekt | `wm-prototyp-live-music-coder` |
| Live-Domain | `https://live-music-coder.pro` (HTTP 200, eigene Domain, `www` → 301 auf apex) |
| Geschäftstyp | Kostenloses Entwickler-/Kreativwerkzeug (Live-Coding-Music-IDE), kein Shop, keine Konten, keine Zahlungen, kein Server-Backend |
| Betreiber | Arnold Wender · Werbeagentur Wender Media · Halle (Saale) |
| Stack | Vite + React 19 SPA, statisch auf Netlify; zusätzlich Electron-Desktop-App über GitHub Releases |
| Sprachen | DE / EN / ES (i18next, Browser-Erkennung) |
| Lizenz | AGPL-3.0-or-later (kombinierte App) + MIT (Eigenanteile) — **ratifiziert, kein Drift** |
| Vorgutachten | `LEGAL-AUDIT-REPORT-DE-2026-05-09.md` (3 Monate alt) |

### Prüfmethode (Falsifikate, nicht Annahmen)

Jeder Befund unten wurde gegen den **ausgelieferten Zustand** geprüft, nicht gegen den Quellcode
allein:

- `dist/` ist bitgleich mit dem Live-Deployment verifiziert (`index-Dw5e0hz9.js` in `dist/index.html`
  == `index-Dw5e0hz9.js` in der Live-Antwort). Alle Aussagen über „was ausgeliefert wird" beruhen
  darauf.
- Netzwerkverhalten wurde mit einem eigenen Headless-Probe **gegen die Live-Seite** gemessen
  (Chromium, `networkidle2` + 12 s Nachlauf, **null Nutzerinteraktion**), nicht aus dem Code
  abgeleitet.
- Bilder wurden **angesehen** (Read-Tool), nicht nach Dateiname oder Verzeichnis klassifiziert.
- Zahlenangaben wurden gegen die **gerenderte Seite** gezählt, nicht gegen das Datenarray.
- Primärquellen: e-Recht24-Checkliste `Pflichtangaben-im-Impressum.pdf`, `LICENSE-AGPL` im Repo
  (§ 4, § 5, § 13 wörtlich gelesen), EUR-Lex (RL (EU) 2024/2853), gesetze-im-internet.de (BFSG),
  Netlify Privacy Statement (Stand 10.04.2026), GitHub Privacy Statement (Stand 27.04.2026).

---

## 1 · Scorecard

| Bereich | Bewertung | Bemerkung |
|---|---|---|
| § 5 DDG Impressum | 21 / 25 | Vollständig, zwei Formfehler, MStV-Zeile fehlt |
| DSGVO / TDDDG | 13 / 25 | Unangekündigter Drittland-Request, unvollständige Speicher-Tabelle, DSE nur auf Deutsch |
| UWG / Transparenz | 14 / 25 | **Falsche KI-Kennzeichnung**, drei falsche Produktaussagen |
| Lizenz-Compliance (AGPL/MIT) | 13 / 25 | Quellangebot vorhanden aber nicht prominent; Desktop-Build ohne Lizenztexte; LICENSING.md widerspricht den SPDX-Headern |
| **Gesamt** | **61 / 100** | |

**Abmahnrisiko gesamt: MITTEL.** Kein einzelner Befund ist ein klassischer Massenabmahn-Tatbestand
(kein fehlendes Impressum, keine fehlende DSE, kein Cookie-Banner-Verstoß, keine Google Fonts, keine
Preisangaben). Die zwei ernsten Befunde sind **F-3 (unangekündigter Drittland-Request)** und
**F-6 (falsche KI-Kennzeichnung)**.

### Delta zum Vorgutachten vom 2026-05-09

Das Vorgutachten kam auf 84 / 100. **Das ist keine Regression — es ist Prüftiefe.** Die Differenz
erklärt sich vollständig aus vier Punkten:

| Punkt | 2026-05-09 | 2026-08-17 |
|---|---|---|
| „License Policy Violation (HOCH)" | Als Hard-Rule-Verstoß gemeldet, Lizenzstrategie als BLOCKER offen | **Aufgehoben.** `~/.claude/CLAUDE.md` Exception 2 listet dieses Repo ausdrücklich als bewusste AGPL-3.0-Veröffentlichung. Commit `193e9b9` („replace open-source with proprietary") wurde durch `7f77e28` revertiert. Der GitHub-Stand (public, kein Fork, AGPL) bestätigt das. **Nicht mehr flaggen.** Stattdessen prüft dieses Audit, ob die AGPL-*Pflichten* erfüllt sind (Abschnitt F-11) — das hatte nie jemand geprüft. |
| GitHub-CDN-Request für Dirt-Samples | Nicht geprüft | Live gemessen, unangekündigt, ohne Einwilligung (F-3) |
| KI-Kennzeichnung im Footer | Existierte noch nicht (Commit `20cd2c2` vom 17.07.2026) | **Sachlich falsch** (F-6) |
| Dreisprachigkeit der Rechtstexte | Nicht geprüft | Deutsche Rechtstexte unter spanischen/englischen Reitern (F-8) |

Der einzige echte *neue* Fehler seit Mai ist **F-6** — er wurde am 17.07.2026 eingeführt und ist am
selben Tag live gegangen.

---

## 2 · Befunde

### F-1 · Impressum § 5 DDG — vorhanden, erreichbar, zwei Formfehler

**Abmahnrisiko: NIEDRIG** · Rechtsgrundlage: § 5 DDG, § 18 Abs. 2 MStV, § 36 VSBG

Geprüft gegen `e-Recht24-Checkliste-Pflichtangaben-im-Impressum.pdf` (Abschnitt I + II).

Erfüllt:

- Name des Unternehmens: „Werbeagentur Wender Media" — vorhanden
- Name der verantwortlichen Person: „Arnold Wender" — vorhanden
- Ladungsfähige Anschrift: Franckestraße 3a, 06110 Halle — vorhanden
- Schnelle Kontaktaufnahme: Telefon `0345-68676857`, E-Mail `info@wendermedia.com` — vorhanden
- USt-IdNr: vorhanden
- Rechtsform / Vertretung / Registereintrag: **nicht erforderlich** — Einzelunternehmen, keine
  juristische Person (Checkliste II.1 greift nicht)
- Kammer / Berufsbezeichnung: **nicht erforderlich** — Werbeagentur ist kein zulassungspflichtiges
  Gewerbe nach § 5 Abs. 1 Nr. 5 DDG (Checkliste II.2 greift nicht)
- Erreichbarkeit **von jeder Seite**: Footer der Landing-Page und `StatusBar` im Editor verlinken
  `/legal`; die SPA-Route liefert live HTTP 200 auf **eigener Domain**, kein Cross-Domain-301.
  Die WM-STRICT-RULE „jede Live-Site serviert ihre eigenen Rechtsseiten" ist **eingehalten**.

Mängel:

1. **USt-IdNr ist mit Bindestrich geschrieben:** `DE-253389445`. Das amtliche Format nach § 27a UStG
   ist `DE253389445` (Länderkürzel plus neun Ziffern, ohne Trennzeichen). Kosmetisch, aber die
   Angabe soll maschinell prüfbar sein (MIAS/VIES).
2. **Falsche Fundstelle beim DSA.** Der Impressum-Block nennt „Digital Services Act - DSA
   (Verordnung (EU) 2022/265)". Der DSA ist **Verordnung (EU) 2022/2065**. Live verifiziert — die
   falsche Zahl steht im ausgelieferten Bundle. (Zur Sache: Art. 11/12 DSA binden „Anbieter von
   Vermittlungsdiensten"; Live Music Coder liefert ausschließlich eigene Inhalte und hostet keine
   Nutzerinhalte auf eigenen Servern, ist also **kein** Vermittlungsdienst. Die Kontaktstelle ist
   freiwillig und schadet nicht — die **Zahl** muss trotzdem stimmen, sonst ist die Rechtsauskunft
   im Impressum unrichtig.)
3. **§ 18 Abs. 2 MStV fehlt.** Die Site betreibt einen Blog (`/blog`, 7 Beiträge) und einen
   Changelog. Ob diese Beiträge „journalistisch-redaktionell gestaltet" sind, ist eine Wertung —
   es handelt sich um Produkt- und Entwicklungstexte des eigenen Hauses, was eher dagegen spricht.
   Die e-Recht24-Checkliste (Abschnitt II.3) verlangt in diesem Fall eine Zeile „Verantwortlich
   für den Inhalt nach § 18 Abs. 2 MStV" mit Name und Anschrift. Da Name und Anschrift ohnehin
   identisch sind, kostet die Zeile nichts und beseitigt die Wertungsfrage.

**Zu § 36 VSBG:** Die vorhandene Erklärung („nicht bereit oder verpflichtet") ist korrekt und
schadet nicht. Pflicht ist sie hier nicht — es werden keine Verbraucherverträge geschlossen und
das Unternehmen liegt unter der 10-Mitarbeiter-Schwelle des § 36 Abs. 3 VSBG.

**Abhilfe:** In `src/data/legal.ts`, `IMPRESSUM_HTML`: Bindestrich in der USt-IdNr entfernen,
`2022/265` → `2022/2065` korrigieren, MStV-Verantwortlichen-Zeile ergänzen.

---

### F-2 · EU-ODR-Plattform — KONFORM, keine Aktion nötig

**Abmahnrisiko: KEINES** · Rechtsgrundlage: VO (EU) 2024/3228 (hebt VO (EU) 524/2013 auf)

Die EU-Plattform für Online-Streitbeilegung wurde zum **20.07.2025** abgeschaltet; die
Verlinkungspflicht ist entfallen und ein **überlebender Link ist seither selbst abmahnfähig**
(irreführende Angabe über eine nicht existierende Beschwerdemöglichkeit).

**Gemessenes Ergebnis: null Treffer.** Weder `ec.europa.eu/consumers/odr` noch „OS-Plattform",
„Online-Streitbeilegung" oder „ODR" kommen irgendwo in `src/`, `public/`, `electron/`,
`index.html` vor; der Live-Test der `/legal`-Seite bestätigt `hasODR: false`.

Dieses Repo ist an der Stelle sauber. **Keine Aktion.**

---

### F-3 · Dirt-Samples werden ohne Einwilligung und ohne Ankündigung von GitHub geladen

**Abmahnrisiko: MITTEL** (behördlich relevanter DSGVO-Verstoß; als Wettbewerbsverstoß nach der
Google-Fonts-Rechtsprechung denkbar, aber schwächer, weil kein Tracking und kein Fingerprinting)
· Rechtsgrundlage: Art. 6 Abs. 1, Art. 13 Abs. 1 lit. e, Art. 44 ff. DSGVO; § 25 TDDDG

**Der Befund, live gemessen.** Beim Aufruf von `https://live-music-coder.pro/editor` — ohne
Klick, ohne Tastendruck, ohne jede Nutzerinteraktion — feuert die Anwendung genau einen
Drittland-Request:

```
https://raw.githubusercontent.com/tidalcycles/Dirt-Samples/master/strudel.json
```

Herkunft: `StrudelEditor.tsx:258` ruft im Mount-`useEffect`
`repl.evaluate("samples('github:tidalcycles/Dirt-Samples/master')")` auf. Strudel löst das
`github:`-Pseudoschema in `node_modules/@strudel/webaudio/supradough.mjs:62` zu
`https://raw.githubusercontent.com/...` auf und führt in `fetchSampleMap` ein unbedingtes
`await fetch(url)` aus. Dieselbe Kette existiert in `ExampleGallery.tsx:85` und
`useInlinePlayer.ts:50`. Beim tatsächlichen Abspielen folgen die einzelnen `.wav`-Dateien vom
selben Host.

Übermittelt werden dabei an GitHub Inc. (Microsoft, USA): **IP-Adresse**, User-Agent,
TLS-Fingerprint sowie — wegen `Referrer-Policy: strict-origin-when-cross-origin` — der Origin
`https://live-music-coder.pro`. Der Empfänger erfährt also, dass diese IP eine bestimmte deutsche
Website nutzt.

Warum das ein Verstoß ist, in drei Schritten:

1. **§ 25 TDDDG greift hier nicht als Rettungsanker.** § 25 regelt das *Speichern von* bzw. den
   *Zugriff auf* Informationen im Endgerät. Ein ausgehender `fetch` speichert nichts im Endgerät —
   er ist keine Einwilligungspflicht nach § 25, sondern eine **Übermittlung** nach DSGVO. Die
   bestehende DSE beruft sich für localStorage/IndexedDB zutreffend auf § 25 Abs. 2 TDDDG; für den
   CDN-Aufruf trägt dieses Argument **nicht**.
2. **Es fehlt eine tragfähige Rechtsgrundlage.** Einwilligung (lit. a) gibt es nicht — es existiert
   keinerlei Consent-Schicht. Bleibt berechtigtes Interesse (lit. f). Das ist argumentierbar
   (funktionale Notwendigkeit: ohne Sample-Map spielt der Editor keine Drums), wird aber dadurch
   geschwächt, dass die Samples **selbst gehostet werden könnten** — `public/samples/` existiert
   bereits und die eigene `LICENSE.md` dort beschreibt genau diesen Weg
   (`samples('./samples/strudel.json')`). Wenn die mildere Alternative im eigenen Repo dokumentiert
   ist, fällt die Interessenabwägung schwerer aus.
3. **Unabhängig von der Rechtsgrundlage fehlt die Information.** Art. 13 Abs. 1 lit. e verlangt die
   Nennung der Empfänger. Die DSE nennt GitHub **ausschließlich** im Abschnitt „GitHub Gist
   Integration" und beschreibt ihn als „optional und wird nur aktiviert, wenn Sie sich aktiv dafür
   entscheiden". Der Sample-Abruf ist das Gegenteil: automatisch, unvermeidbar, ohne Entscheidung.
   Die DSE ist an dieser Stelle nicht nur unvollständig, sondern **inhaltlich unzutreffend**.

**Entlastend (gehört in die Bewertung):** Der Empfänger ist **DPF-zertifiziert** (GitHub Privacy
Statement, Stand 27.04.2026: „GitHub has certified to the U.S. Department of Commerce that it
adheres to the EU-U.S. Data Privacy Framework Principles"). Es handelt sich um **kein Tracking**,
keinen Cookie, kein Fingerprinting und keinen Werbedienst. Die Landing-Page ist vollständig sauber:
gemessen **null** Drittanbieter-Requests und **null** Storage-Schreibvorgänge auf `/`.

**Abhilfe — drei Optionen, absteigend nach Rechtssicherheit:**

1. **Self-Hosting.** Dirt-Samples in `public/samples/` spiegeln, `strudel.json` erzeugen, Aufruf auf
   `samples('./samples/strudel.json')` umstellen. Dann gibt es überhaupt keinen Drittland-Transfer
   mehr. Lizenzrechtlich zu klären (siehe F-11d: Dirt-Samples steht laut eigener `LICENSE.md` unter
   GPL-3.0), Volumen laut `sw.js`-Kommentar 50–200 MB — also nicht in den Service-Worker-Cache.
2. **Lazy Loading mit Aufklärung.** Sample-Ladevorgang erst beim ersten Play-Klick auslösen und
   davor einen einzeiligen, nicht blockierenden Hinweis anzeigen („Zum Abspielen werden
   Audio-Samples von GitHub (USA) geladen — dabei wird deine IP-Adresse an GitHub übertragen").
   Das verschiebt den Request hinter eine bewusste Nutzerhandlung.
3. **Minimum, nicht verhandelbar:** Neuer DSE-Abschnitt „Audio-Samples von GitHub", der den
   Empfänger (GitHub Inc.), den Zweck, die Automatik, die übertragenen Daten (IP), die
   Rechtsgrundlage und die DPF-Garantie benennt — getrennt vom bestehenden Gist-Abschnitt.

---

### F-4 · Consent-Schicht — existiert nicht, wird aber auch fast nicht gebraucht

**Abmahnrisiko: NIEDRIG** · Rechtsgrundlage: § 25 Abs. 2 TDDDG, Art. 6 DSGVO

Klar gesagt: **Es gibt keinen Cookie-Banner und keine Consent-Schicht.** Und das ist hier
überwiegend **richtig so** — das Gegenteil wäre der Fehler.

Gemessen: keine Cookies (weder First- noch Third-Party), kein Analytics, kein Meta Pixel, kein
Google-Dienst, keine externen Schriften (`font-src 'self' data:`, Systemschriften), kein
Consent-Tool. Der Service Worker cached ausschließlich Same-Origin
(`if (!request.url.startsWith(self.location.origin)) return;`) und lässt `/samples/` bewusst aus.

Ein Consent-Dialog für nicht existierende Verarbeitungen wäre selbst ein § 5-UWG-Problem, und
technisch Erforderliches braucht nach § 25 Abs. 2 TDDDG ohnehin keine Einwilligung. Der
DSE-Abschnitt „Cookies" sagt das bereits korrekt.

**Die eine Ausnahme ist F-3.** Der GitHub-CDN-Aufruf ist der einzige Vorgang, der über
„technisch erforderlich im eigenen Haus" hinausgeht. Die Abhilfe dafür ist **kein Cookie-Banner**,
sondern eine der drei Optionen aus F-3 — vorzugsweise Self-Hosting, das die Frage ersatzlos
auflöst.

**Nicht tun:** Ein Consent-Banner mit Kategorien „Analyse"/„Marketing" einbauen. Es gibt weder
das eine noch das andere; das wäre exakt das Cookie-Banner-Theater aus dem WM-Prüfraster.

---

### F-5 · Verzeichnis der clientseitigen Speicherung ist unvollständig

**Abmahnrisiko: NIEDRIG** · Rechtsgrundlage: Art. 13 DSGVO, § 25 Abs. 2 TDDDG

Die DSE („Lokale Datenspeicherung") nennt für localStorage: „App-Einstellungen (Theme,
Schriftgröße, Tastenbelegung, Sprache), Streak-Daten, Onboarding-Status" und für IndexedDB die
Projektpersistenz. Tatsächlich geschrieben wird mehr:

| Mechanismus | Schlüssel / Name | In der DSE? |
|---|---|---|
| localStorage | `lmc-editor-settings`, `lmc-font-size`, `lmc-keybindings`, `lmc-line-numbers`, `lmc-line-wrap`, `lmc-highlight-events`, `lmc-flash-eval`, `lmc-lang`, `lmc-synth-panel-collapsed` | ja (als „App-Einstellungen") |
| localStorage | `lmc-streak`, `lmc-onboarded`, `lmc-tutorial-done` | ja |
| localStorage | `lmc-midi-learn` (MIDI-CC-Zuordnungen) | **nein** |
| localStorage | `lmc-saved-gists` (Gist-Metadaten) | **nein** |
| localStorage | `lmc-gist-token-enc` (AES-GCM-Chiffrat des PAT) | sinngemäß ja (Gist-Abschnitt) |
| localStorage | `lmc-gist-token-persist` (Alt-Schlüssel, **Klartext**, nur lesend zur Migration) | **nein** |
| sessionStorage | `lmc-gist-token` (PAT im Klartext), `lmc-gist-key` (AES-Schlüssel) | teilweise (Gist-Abschnitt) |
| IndexedDB | `live-music-coder` | ja |
| Cache Storage | `lmc-<Zeitstempel>` (Service Worker, App-Shell) | **nein** |

Zusätzlich fehlt **sessionStorage als eigene Kategorie** im Abschnitt „Lokale Datenspeicherung" —
es wird nur beiläufig im Gist-Abschnitt erwähnt.

Auf `/editor` werden ohne jede Interaktion sofort drei Schlüssel geschrieben
(`lmc-editor-settings`, `lmc-synth-panel-collapsed`, `lmc-streak`) — alle drei funktional und von
§ 25 Abs. 2 TDDDG gedeckt.

**Abhilfe:** Die Tabelle in `DATENSCHUTZ_HTML` gegen die obige Liste angleichen; Cache Storage und
sessionStorage als Kategorien aufnehmen. Der Alt-Schlüssel `lmc-gist-token-persist` wird in
`clearStoredToken()` bereits gelöscht (`gist.ts:124`) — die Migration ist sauber, nur die DSE weiß
nichts davon.

---

### F-6 · Die KI-Kennzeichnung im Footer ist sachlich falsch (umgekehrte Falschangabe)

**Abmahnrisiko: MITTEL** · Rechtsgrundlage: § 5 Abs. 1 UWG (unwahre Angabe), **nicht** Art. 50 KI-VO

Der Footer der Landing-Page (und damit auch der Electron-App) sagt in allen drei Sprachen:

> „Einige Bilder auf dieser Website sind KI-generiert."
> „Some images on this website are AI-generated."
> „Algunas imágenes de este sitio web son generadas por IA."

**Das stimmt nicht.** Vollständige Bestandsaufnahme, geprüft und nicht geschätzt:

- `<img>`-Tags in `src/`: **null**. Kein einziger.
- Rasterbilder im gesamten Repo (ohne `node_modules/`, `dist/`, `release/`, `out/`): genau vier —
  `public/icon-192.png`, `public/icon-512.png`, `public/og-image.png`, `build/icon.png`.
- Zu jedem davon existiert eine **Vektor-Quelldatei im selben Verzeichnis** (`og-image.svg`,
  `favicon.svg`, `icons.svg`), und keine dieser SVG-Dateien enthält eingebettete Rasterdaten
  (`grep -c base64` = 0 in allen drei). Die PNGs sind Exporte dieser SVGs.
- Die Bilder wurden **angesehen**, nicht nach Dateinamen eingeordnet: `og-image.png` ist eine
  Markenkarte (Raster-Hintergrund, Blitz-Logo, saubere Typografie „Live Music Coder / Write Code,
  Hear Music, Live"), `icon-512.png` ist dasselbe Blitz-Logo mit Verlauf. Keine Fotorealistik,
  keine Gesichter, keine der bekannten Generator-Artefakte.
- PNG-Metadaten: **null** Treffer auf Generator-Signaturen.

Die Kennzeichnung wurde am 17.07.2026 mit Commit `20cd2c2` („[Fix] KI-Kennzeichnung im Footer
(EU AI Act Art. 50)") eingeführt und ist im Live-Bundle nachweisbar. Sie ist eine **vorauseilende
Kennzeichnung für Inhalte, die es nicht gibt** — und damit eine unwahre Angabe über die eigenen
Inhalte im Sinne von § 5 UWG. Genau dieses Muster wurde am 02.08.2026 flottenweit auf sieben
Live-Sites gefunden.

**Und Art. 50 KI-VO verlangt hier gar nichts.** Geprüft, statt angenommen:

- **Art. 50 Abs. 2** (maschinenlesbare Markierung) bindet den **Anbieter** eines KI-Systems.
  Wender Media entwickelt kein KI-System und bringt keines in Verkehr. Greift nicht.
- **Art. 50 Abs. 4 UAbs. 1** bindet den **Betreiber**, aber nur für **Deepfakes** — Bild-, Ton-
  oder Videoinhalte, die „wirklichen Personen, Gegenständen, Orten ... ähneln und einem Menschen
  fälschlicherweise als echt vorkommen würden". Greift nicht.
- **Art. 50 Abs. 4 UAbs. 2** bindet den Betreiber für **KI-Texte zur Information der Öffentlichkeit
  über Angelegenheiten von öffentlichem Interesse**. Der Blog behandelt Audio-Engines, Canvas-
  Visualisierer und MIDI-Debugging — kein öffentliches Interesse im Sinne der Norm. Greift nicht.

**Es gibt aber sehr wohl KI-Inhalte auf dieser Site — nur andere.** Die Sessions-Bibliothek besteht
aus **KI-komponierter Musik**; die Seite sagt das selbst offensiv („Stücke, geschrieben von einer
KI, die sich nicht erinnern wird, sie geschrieben zu haben"). Live gemessen: `/sessions` zeigt
**49 Einträge und 49 Badges** „KI-komponiert" / „AI-composed" — **eine Kennzeichnung unmittelbar am
Inhalt, an jedem einzelnen Element**, plus Komponisten-Angabe („Claude", „Claude Sonnet 4.6").
Auf der Detailseite ebenfalls (`SessionPiece.tsx:185`).

Das ist deutlich besser als ein Footer-Sammelhinweis und erfüllt den Maßstab der
e-Recht24-Checkliste, obwohl **keine Pflicht** dazu besteht (Musik ohne Bezug zu realen Personen
oder Orten ist kein Deepfake). Freiwillige Transparenz, sauber umgesetzt — **behalten**.

**Abhilfe:** Den Footer-Satz `footer.aiDisclosure` in allen drei Locales **löschen** und den
`<p>`-Block in `Landing.tsx:227-230` entfernen. Nicht „ein Badge nachrüsten" — es gibt kein Bild,
das eines bräuchte. Wenn ein Hinweis gewünscht ist, muss er das benennen, was tatsächlich zutrifft
(KI-**komponierte Musik**), und dafür ist die Kennzeichnung an den Sessions bereits vorhanden.

---

### F-7 · Drei Produktaussagen widersprechen dem eigenen Code

**Abmahnrisiko: NIEDRIG** · Rechtsgrundlage: § 5 Abs. 1 Nr. 1 UWG (Angaben über Merkmale der
Dienstleistung); Art. 12 Abs. 1 DSGVO für (b)

**(a) „Gists sind standardmäßig öffentlich — bei Bedarf als geheim markieren."**
(`sharing.gistText`, alle drei Locales)
Der Code erzeugt **ausnahmslos geheime** Gists: `gist.ts:166` — `public: false`, hart verdrahtet,
ohne Schalter in der UI. Die Doku beschreibt damit sowohl eine falsche Voreinstellung als auch eine
**Bedienmöglichkeit, die nicht existiert**. Ein Nutzer, der bewusst einen öffentlichen Gist zum
Teilen anlegen will, bekommt stillschweigend einen privaten.

**(b) „Token wird unverschlüsselt im Browser gespeichert."** (`gist.rememberWarning`, alle drei
Locales — EN: „Stores token in browser storage (unencrypted)", ES: „El token se guarda sin cifrar
en el navegador")
Falsch seit dem B-1-Fix. `setStoredToken(token, remember=true)` verschlüsselt mit **AES-GCM 256**
über SubtleCrypto (`gist.ts:41-50, 106-117`); in localStorage landet nur IV + Chiffrat, der
Schlüssel liegt sitzungsgebunden in sessionStorage und ist beim nächsten Tab weg. Die Warnung
beschreibt den Zustand **vor** dem Fix.
Das ist die für den Nutzer *ungefährliche* Richtung — sie warnt zu viel, nicht zu wenig. Es bleibt
eine unrichtige Sicherheitsangabe (Art. 12 Abs. 1 DSGVO: Informationen müssen „präzise" sein) und
sie schmälert grundlos das Vertrauen in eine tatsächlich saubere Implementierung.

**(c) Zahlenangaben zu den Sessions.**

| Quelle | Behauptung | Tatsächlich (gerendert gezählt) |
|---|---|---|
| `sharing.sessionsText` (DE/EN/ES) | „43 ... Stücke aus 10 Genres" | **49** Stücke, **mindestens 11** Genres |
| `README.md:83` | „51 Curated Sessions" | **49** |
| `CLAUDE.md` | „51 curated sessions (15 genres)" | **49** |
| GitHub-Repo-Beschreibung | „43 sessions, 190+ examples" | 49 Sessions; 219 Beispiele (**„190+" ist korrekt**) |

Drei verschiedene Zahlen für dieselbe Sache in drei Dokumenten, keine davon richtig.
Wettbewerbsrechtlich ist die Relevanz gering (kostenloses Werkzeug, keine Kaufentscheidung hängt
daran), aber es ist derselbe Mechanismus, der bei kommerziellen WM-Sites teuer wird.

**Abhilfe:** (a) und (b) Locale-Strings an den Code angleichen (oder in (a) den fehlenden Schalter
tatsächlich bauen — das wäre die bessere Lösung, weil ein öffentlicher Gist ein legitimer Wunsch
ist). (c) Die Zahl an die Funktion binden, die die Seite rendert (`SESSIONS_LIBRARY.length`), statt
sie zu tippen — dann kann sie nicht mehr veralten.

---

### F-8 · Deutsche Rechtstexte unter spanischen und englischen Reitern

**Abmahnrisiko: MITTEL** · Rechtsgrundlage: Art. 12 Abs. 1 DSGVO („in präziser, transparenter,
verständlicher und leicht zugänglicher Form in einer **klaren und einfachen Sprache**")

**Live gemessen mit einem `es-MX`-Browser:**

```
lang: "en"
Reiter:  "Aviso legal" | "Política de privacidad"
Inhalt:  "Impressum / Arnold Wender / Werbeagentur Wender Media / Kontakt / Umsatzsteuer-ID ..."
```

Die Seiten-Chrome ist vollständig lokalisiert — Reiter, Skip-Link („Saltar al contenido"),
Navigation („Abrir editor"). Der **Rechtstext selbst ist ausschließlich Deutsch**, weil
`src/data/legal.ts` zwei feste deutsche HTML-Strings exportiert, die `Legal.tsx:120` über das
React-Roh-HTML-Prop unverändert in den DOM setzt — ohne jeden Sprachbezug.

Das ist schlechter als „nur auf Deutsch verfügbar": Die Oberfläche **verspricht** eine spanische
Datenschutzerklärung und liefert eine deutsche. Ein spanischsprachiger Betroffener kann seine
Rechte nach Art. 15–21 DSGVO nicht ausüben, wenn er die Belehrung nicht lesen kann. Art. 12 Abs. 1
verlangt Verständlichkeit für die betroffene Person, nicht für den Verantwortlichen.

Drei begleitende Defekte am selben Ort:

1. **`<html lang="en">` ist statisch** (`index.html:2`). i18next wechselt die Sprache zur Laufzeit,
   aber niemand aktualisiert das `lang`-Attribut. Ein deutscher Nutzer bekommt deutschen Text in
   einem als Englisch ausgezeichneten Dokument. Live auf allen geprüften Routen bestätigt
   (`lang: "en"` auch bei `es-MX`-Browser). Das ist zugleich ein **WCAG 3.1.1**-Verstoß
   (Language of Page) — Screenreader sprechen deutschen Text mit englischer Aussprache.
2. **`StatusBar.tsx:165,167` verdrahtet die Labels „Impressum" und „Datenschutz" fest** — auf einer
   dreisprachigen Site. Für den Editor, der als PWA-`start_url` die meistgesehene Route ist, sind
   das die **einzigen** Rechtslinks, und sie sind für EN-/ES-Nutzer unbeschriftet. Die passenden
   Keys existieren bereits (`legal.impressum`, `legal.datenschutz`) und werden auf der Landing-Page
   auch benutzt. Daneben steht „What's New" fest auf Englisch.
3. **Der Tab-Deeplink funktioniert nur beim ersten Aufruf.** `Legal.tsx:18-20` liest
   `location.hash` ausschließlich im `useState`-Initialisierer. Wer bereits auf `/legal` steht und
   im Footer auf „Datenschutz" (`/legal#datenschutz`) klickt, sieht **weiterhin das Impressum** —
   React-Router ändert den Hash, aber die Komponente wird nicht neu montiert und es gibt keinen
   Effekt, der auf `location.hash` hört. Praktische Folge: Die Datenschutzerklärung ist aus dem
   Editor heraus mit einem Klick **nicht** erreichbar, wenn man vorher schon auf `/legal` war.
   Erreichbarkeit ist eine Rechtspflicht, kein Komfortmerkmal.

**Abhilfe:**

- `legal.ts` auf `{ de, en, es }` umstellen und `Legal.tsx` die aktive `i18n.language` auswählen
  lassen. **Rechtstexte niemals maschinell übersetzen und ohne Prüfung ausliefern** — der englische
  und der spanische Text müssen als eigenständige Rechtstexte vom Anwalt freigegeben werden. Bis
  dahin ist die ehrliche Zwischenlösung ein sichtbarer Hinweis über dem deutschen Text
  („This legal notice is authoritative in German only." / „Este aviso legal solo es vinculante en
  alemán.") — das ist eine zulässige Sprachwahl, das stillschweigende Ausliefern unter einem
  spanischen Reiter nicht.
- `lang`-Attribut per Effekt an `i18n.language` binden.
- `StatusBar.tsx:165,167` auf `t('legal.impressum')` / `t('legal.datenschutz')` umstellen,
  „What's New" auf einen Locale-Key.
- In `Legal.tsx` einen `useEffect` auf `location.hash` ergänzen, der den Tab nachzieht.

---

### F-9 · BFSG — nicht anwendbar (begründet), Barrierefreiheit trotzdem lückenhaft

**Abmahnrisiko: KEINES aus dem BFSG** · Rechtsgrundlage: § 1 Abs. 2 und 3, § 2 Nr. 26, § 3 Abs. 3,
§ 14 BFSG

**Ergebnis: Live Music Coder fällt nicht in den Anwendungsbereich des BFSG.** Begründung in drei
unabhängigen Schritten — jeder für sich genügt:

1. **Der Dienstleistungs-Arm greift nicht.** § 1 Abs. 3 BFSG enthält eine **abschließende Liste**:
   Telekommunikationsdienste, Elemente von Personenbeförderungsdiensten, Bankdienstleistungen für
   Verbraucher, E-Books samt zugehöriger Software und „Dienstleistungen im elektronischen
   Geschäftsverkehr". Der letzte Punkt ist in § 2 Nr. 26 BFSG definiert als Dienste, die
   „im Fernabsatz ... auf individuelles Anfordern eines Verbrauchers **im Hinblick auf den Abschluss
   eines Verbrauchervertrags**" erbracht werden, unter Verweis auf § 1 Abs. 4 Nr. 1 DDG
   („in der Regel gegen Entgelt"). Live Music Coder schließt **keine Verträge**: kein Konto, keine
   Zahlung, kein Warenkorb, kein Abo, kein Login, keine Registrierung, keine Bezahlschranke. Es ist
   kein Dienst im elektronischen Geschäftsverkehr.
2. **Der Produkt-Arm greift nicht.** § 1 Abs. 2 BFSG zählt auf: Hardwaresysteme für
   Universalrechner **einschließlich ihrer Betriebssysteme**, Selbstbedienungsterminals,
   Verbraucherendgeräte mit interaktivem Leistungsumfang für Telekommunikations- bzw. audiovisuelle
   Mediendienste und E-Book-Lesegeräte. Eine Anwendungssoftware — auch als Electron-Desktop-Build —
   ist keines davon.
3. **Selbst wenn (1) griffe, greift die Kleinstunternehmer-Ausnahme.** § 3 Abs. 3 BFSG:
   „Absatz 1 gilt nicht für Kleinstunternehmen, die Dienstleistungen anbieten oder erbringen."
   Kleinstunternehmen = unter 10 Beschäftigte und höchstens 2 Mio. € Jahresumsatz. Wender Media
   erfüllt das. **Achtung:** Diese Ausnahme gilt **nur für Dienstleistungen**, nicht für Produkte —
   sie trägt hier nur, weil (2) den Produkt-Arm ohnehin ausschließt.

**Folge:** Eine **Barrierefreiheitserklärung nach § 14 Abs. 1 Nr. 2 i. V. m. Anlage 3 Nr. 1 BFSG
ist nicht geschuldet.** Sie fehlt — zu Recht. Es gibt keinen Anlass, eine anzulegen, und eine
Erklärung anzulegen, die eine Konformität behauptet, die nicht gemessen wurde, wäre schlechter als
keine.

**Aber „exempt" ist ein Zeitpunkt-Status, kein Dauerzustand.** Sobald irgendetwas
Vertragsähnliches dazukommt (Pro-Version, Spenden mit Gegenleistung, Konten, In-App-Kauf im
Desktop-Build), kippt Punkt 1 sofort, und die Marktüberwachungsstelle MLBF prüft seit 26.09.2025
stichprobenartig.

**Unabhängig davon dokumentierte Barrierefreiheitslücken** (nicht abmahnbar, aber real, und sie
gehören in eine spätere Erklärung, falls sie je fällig wird):

- **Mobile Erreichbarkeit.** Laut `docs/ARCHITECTURE-2026-08-16.md` §5.53 blendet `EditorLayout`
  unterhalb von 768 px die ActivityBar, den Node-Graph, die Resize-Handles und das DetailPanel aus;
  `ContentSidebar`/`SiteNav` verschwinden unterhalb `lg`. Auf dem Telefon bleiben Editor plus ein
  fixer 120-px-Visualizer-Streifen. **Alles**, was in ActivityBar oder DetailPanel liegt, ist auf
  dem Telefon unerreichbar. Das trifft nicht die Rechtsseiten (die liegen im StatusBar-Footer und
  auf `/legal`), aber es macht die App auf Mobilgeräten zu einem Torso — WCAG 2.1 AA verlangt
  Bedienbarkeit unabhängig vom Viewport.
- **`<html lang>` falsch** — WCAG 3.1.1, siehe F-8.
- **164 rohe Pixel-Literale und mehrere rohe Farbwerte** außerhalb der Design-Tokens
  (ARCHITECTURE §5.41) — kein A11y-Verstoß per se, aber der Grund, warum Kontrast- und
  Zoom-Verhalten nicht systematisch garantiert werden können.
- Positiv: Skip-Link vorhanden (`Legal.tsx:35`, lokalisiert), ARIA-Tabs-Muster korrekt
  (`role="tablist"`, `aria-selected`, `aria-controls`), Tastaturbedienbarkeit der VirtualKeyboard
  laut Release v1.1.0 nachgerüstet.

---

### F-10 · EU AI Act — keine Pflicht, aber eine selbst verursachte Falschangabe

**Abmahnrisiko: KEINES aus der KI-VO** (siehe F-6 für den UWG-Teil)

Zusammengefasst, damit keine Pflicht erfunden wird, die es nicht gibt:

| Norm | Adressat | Greift hier? |
|---|---|---|
| Art. 50 Abs. 1 (Interaktion mit KI) | Anbieter | **Nein** — kein Chatbot, kein KI-Assistent, keine Konversationsfläche im Produkt |
| Art. 50 Abs. 2 (maschinenlesbare Markierung) | **Anbieter** eines KI-Systems | **Nein** — Wender Media ist Nutzer von KI-Werkzeugen, nicht Anbieter eines KI-Systems |
| Art. 50 Abs. 4 UAbs. 1 (Deepfake) | **Betreiber** | **Nein** — die KI-Inhalte sind original komponierte Musik ohne Ähnlichkeit zu realen Personen, Gegenständen oder Orten |
| Art. 50 Abs. 4 UAbs. 2 (KI-Text von öffentlichem Interesse) | Betreiber | **Nein** — Blog und Changelog behandeln Produkt- und Technikthemen |
| Art. 50 Abs. 3 (Emotionserkennung/Biometrie) | Betreiber | **Nein** |

Das Produkt selbst enthält **keine KI-Funktion**: keine Modellaufrufe, keine KI-API im Code, kein
Inferenz-Endpunkt. Die Sessions sind vorab von einer KI komponierte Strudel-Patterns, die als
statischer Text im Bundle liegen.

Die Kennzeichnung, die dennoch vorhanden ist, teilt sich in zwei:

- **Am richtigen Inhalt, freiwillig, vorbildlich:** 49 von 49 Sessions tragen ein Badge
  „KI-komponiert"/„AI-composed" unmittelbar am Element, dazu ein Komponisten-Feld. Behalten.
- **Am falschen Inhalt, falsch:** der Footer-Satz über KI-generierte Bilder. Siehe F-6 — löschen.

---

### F-11 · Lizenz-Compliance — der wichtigste Block dieses Audits

Die AGPL-Wahl selbst ist **korrekt, notwendig und ratifiziert**: alle 13 installierten
`@strudel/*`-Pakete (`codemirror, core, draw, midi, mini, osc, serial, soundfonts, tonal,
transpiler, web, webaudio, xen`) tragen `AGPL-3.0-or-later` in ihrer `package.json`. Eine
Anwendung, die davon Code einbindet, **muss** AGPL bleiben. Das ist keine Stilfrage. Geprüft wird
hier daher ausschließlich, ob die daraus folgenden **Pflichten erfüllt** sind.

---

#### F-11a · AGPL § 13 Netzwerknutzung — Quellangebot vorhanden, aber nicht „prominent"

**Abmahnrisiko: NIEDRIG** (die Durchsetzung liegt bei den Strudel-Urhebern, nicht bei
Wettbewerbern) · **Lizenzrisiko: MITTEL** · Rechtsgrundlage: AGPL-3.0 § 13

Wörtlich aus `LICENSE-AGPL`:

> „if you modify the Program, your modified version must **prominently offer all users interacting
> with it remotely** through a computer network ... an opportunity to receive the Corresponding
> Source of your version by providing access to the Corresponding Source from a network server at
> no charge"

**Ist-Zustand, im ausgelieferten Bundle geprüft:**

| Oberfläche | Quellangebot |
|---|---|
| `/legal` | **Ja** — „Source Code (AGPL-3.0)" mit Link auf das GitHub-Repo (`Legal.tsx:138-145`, im ausgelieferten Chunk `Legal-k48i1DaJ.js` bestätigt) |
| Landing-Footer `/` | Teilweise — Link mit dem Text „GitHub" und daneben „Live Music Coder — Open Source (AGPL-3.0)". Zusammengelesen ergibt das ein Angebot, aber der Link heißt nicht danach |
| **`/editor` (StatusBar)** | **Nein** — dort stehen nur „What's New \| Impressum \| Datenschutz" |

Das Problem ist die Gewichtung: `/editor` **ist** die Netzwerkinteraktion im Sinne von § 13 und
zugleich `start_url` des PWA-Manifests (`"start_url": "/editor"`). Ein Nutzer, der die App als PWA
installiert oder direkt auf `/editor` landet, sieht die Landing-Page **nie** und muss zwei Klicks
und eine Route weit navigieren, um überhaupt auf das Angebot zu stoßen. „Prominently offer all
users interacting with it remotely" ist damit nicht sauber erfüllt.

**Abhilfe:** In `StatusBar.tsx` einen dritten Link „Source (AGPL-3.0)" neben Impressum/Datenschutz
setzen, der auf das Repo zeigt. Eine Zeile, und § 13 ist unstreitig erfüllt.

**Hinweis zur „Corresponding Source":** § 13 verlangt den Quellcode **der ausgelieferten Version**.
Der Link zeigt auf `main`. Das Live-Deployment (`index-Dw5e0hz9.js`) entspricht dem Stand vom
17.07.2026, `main` steht inzwischen auf `d0fc640` (13.08.2026, u. a. Dependabot-Bumps und ein
TypeScript-Fix). Strenggenommen wird also der Quellcode einer *anderen* Version angeboten.
Praktisch behebt sich das durch ein Deployment des aktuellen Stands; sauber wäre zusätzlich, im
Quellangebot den Commit-SHA des Builds zu nennen (per `import.meta.env` zur Build-Zeit einsetzen).

---

#### F-11b · SPDX-Header — 186 von 192, sechs Lücken, und die Doku behauptet 100 %

**Abmahnrisiko: KEINES** · **Lizenzrisiko: NIEDRIG** · Rechtsgrundlage: eigene Zusage in
`LICENSING.md` und `CLAUDE.md`

`LICENSING.md` sagt: „**Every** source file contains an SPDX license identifier in its header
comment." `README.md:276` und `CLAUDE.md` wiederholen das.

Gezählt über `src/` und `electron/` (`.ts`, `.tsx`, `.js`, `.jsx`, `.css`):

- **192** Quelldateien insgesamt
- **186** mit SPDX-Header — davon **164 × MIT** und **22 × AGPL-3.0-or-later**
- **6 ohne** Header:
  - `src/styles/global.css`
  - `src/styles/tokens/index.css`
  - `src/styles/tokens/colors.css`
  - `src/styles/tokens/typography.css`
  - `src/styles/tokens/spacing.css`
  - `src/sw.template.js`

Die fünf CSS-Dateien werden in der MIT-Tabelle von `LICENSING.md` ausdrücklich als
MIT-lizenziertes Modul geführt („Styles | `src/styles/` | Design tokens and global CSS") — die
Datei selbst sagt aber nichts, und `LICENSING.md` erklärt die SPDX-Header für „authoritative".
Damit hat ein Dritter, der eine dieser Dateien extrahiert, **keine** durchsetzbare Lizenzaussage
in der Hand.

**Abhilfe:** Sechs Header ergänzen (CSS-Kommentarsyntax). Danach stimmt die Zusage.

---

#### F-11c · Die Aufteilung MIT/AGPL in LICENSING.md widerspricht den Headern

**Abmahnrisiko: KEINES** · **Lizenzrisiko: MITTEL** — das ist der ernsteste Punkt des
Lizenzblocks · Rechtsgrundlage: AGPL § 5 lit. a/c, eigene Zusage

`LICENSING.md` listet **9** AGPL-Dateien. Tatsächlich tragen **22** Dateien einen AGPL-Header.
Die 13 undokumentierten:

```
src/components/organisms/PitchwheelVisualizer.tsx
src/components/organisms/PunchcardVisualizer.tsx
src/components/organisms/SpiralVisualizer.tsx
src/data/sessions-library.ts
src/lib/audio/solo-mute.ts
src/lib/editor/inline-widgets.ts
src/lib/midi/strudel-keys.ts
src/lib/persistence/gist.ts
src/lib/strudel-extensions.ts
src/lib/visualizers/pianoroll.ts
src/lib/visualizers/pitchwheel.ts
src/lib/visualizers/punchcard.ts
src/lib/visualizers/spiral.ts
```

Das ist kein Formfehler, sondern ein **direkter Widerspruch**: Die MIT-Tabelle in `LICENSING.md`
erklärt fünf Modulpfade pauschal zu MIT, in denen tatsächlich AGPL-Dateien liegen.

| `LICENSING.md` sagt MIT für ... | Tatsächlich AGPL darin |
|---|---|
| `src/lib/visualizers/` („Visualizers") | `pianoroll.ts`, `pitchwheel.ts`, `punchcard.ts`, `spiral.ts` |
| `src/lib/persistence/` („Persistence") | `gist.ts` |
| `src/data/` („Data") | `sessions-library.ts` |
| `src/components/` („UI Components — All React components") | 7 Organismen, davon 3 nicht in der AGPL-Ausnahmeliste |
| `src/lib/audio/...` (Aufzählung) | `solo-mute.ts` (nirgends genannt), `strudel-tap.ts` |

Zusätzlich: **`src/workers/` ist ein leeres Verzeichnis**, wird aber als MIT-Modul „Workers"
gelistet.

**Die praktische Gefahr liegt genau hier.** `LICENSING.md` lädt ausdrücklich zur Extraktion ein
(„Files marked with `SPDX-License-Identifier: MIT` may be extracted and used under MIT terms")
und liefert dazu eine Modultabelle. Wer sich auf die **Tabelle** verlässt und
`src/lib/visualizers/pianoroll.ts` als MIT extrahiert, verletzt die AGPL. Dass die Datei selbst den
richtigen Header trägt, rettet den Rechteinhaber — aber der Dritte wurde von der Dokumentation
in die Irre geführt, und die Dokumentation stammt vom Rechteinhaber.

**Was dagegen sauber ist:** Alle **8** Dateien, die tatsächlich `@strudel/*` importieren
(`StrudelEditor.tsx`, `ExampleGallery.tsx`, `SidePanel.tsx`, `strudel-tap.ts`, `engines/strudel.ts`,
`midi/strudel-keys.ts`, `strudel-extensions.ts`, `useInlinePlayer.ts`), tragen einen AGPL-Header.
Es gibt **keine** Unter-Kennzeichnung — kein Strudel-Importeur ist fälschlich als MIT markiert.
Die 14 zusätzlichen AGPL-Markierungen sind Über-Kennzeichnung, und das ist die **sichere**
Richtung: Eigene Arbeit darf man strenger lizenzieren als nötig.

**Abhilfe:** `LICENSING.md` aus den tatsächlichen Headern **generieren** statt pflegen. Ein
20-Zeilen-Skript, das `src/` durchläuft und die Tabelle schreibt, plus ein CI-Check, der bei
Abweichung rot wird. Damit kann der Widerspruch nicht zurückkehren. Bis dahin: die 13 Dateien
nachtragen, die fünf Modulzeilen präzisieren, `src/workers/` streichen.

**Zusatzbefund:** GitHub klassifiziert das Repo als `license: "other"` statt AGPL-3.0. Ursache ist
dieselbe wie beim `angelical-harness`-Fall: Die Root-`LICENSE` enthält **nicht den Lizenztext**,
sondern nur den AGPL-Anwendungshinweis („This program is free software: you can redistribute it
..."). GitHub bewertet die Datei über Ähnlichkeit zur Vorlage und fällt unter den Schwellenwert.
Folge: kein Lizenz-Badge, keine maschinenlesbare Klassifikation. Der Volltext liegt in
`LICENSE-AGPL`. **Abhilfe:** `LICENSE` = Volltext der AGPL-3.0 (also `LICENSE-AGPL` nach `LICENSE`
kopieren), Hinweis und Dual-Struktur nach `LICENSING.md`/`NOTICE`. Danach
`gh api repos/arnoldwender/wm-prototyp-live-music-coder --jq .license.spdx_id` gegenprüfen — muss
`AGPL-3.0` liefern.

---

#### F-11d · Upstream-Attribution — Strudel gut, Dirt-Samples ungeklärt

**Abmahnrisiko: NIEDRIG** · **Lizenzrisiko: MITTEL (Dirt-Samples)** · Rechtsgrundlage: AGPL § 4/§ 5,
GPL-3.0 der Sample-Bibliothek

**Strudel:** korrekt attribuiert. `README.md`, `LICENSING.md`, die Docs-Seite („Strudel ist eine
JavaScript-Portierung der Live-Coding-Sprache TidalCycles") und die Engine-Beschreibung
(„Pattern-basiertes Live-Coding (strudel.cc)") nennen Herkunft und Rolle. Die AGPL-Vererbung ist
in `LICENSING.md` ausdrücklich als Grund für die Lizenzwahl benannt. Im Electron-Bundle liegen
alle 13 `@strudel/*/LICENSE`-Dateien mit. Das ist in Ordnung.

**Dirt-Samples: hier klafft eine Lücke.** Die eigene Datei `public/samples/LICENSE.md` sagt:

> „Default samples: [Dirt-Samples](https://github.com/tidalcycles/Dirt-Samples) (**GPL-3.0**)"

Damit streamt die Anwendung bei jedem Editor-Aufruf ein **GPL-3.0-lizenziertes Audiowerk** an ihre
Nutzer — und **an keiner Stelle der Benutzeroberfläche** steht, woher es kommt oder unter welcher
Lizenz. Die Samples-Seite (`/samples`) listet alle 218 Klänge mit Metadaten, ohne Urheber- oder
Lizenzangabe; die Docs erwähnen „218 Dirt-Samples" rein deskriptiv. Die einzige Lizenzangabe liegt
in einer Markdown-Datei in `public/`, die kein Nutzer je öffnet.

Zwei Punkte, die auseinandergehalten werden müssen:

1. **Verbreitung im Rechtssinne** findet hier womöglich gar nicht statt: Die Datei wird vom Browser
   des Nutzers **direkt bei GitHub** geholt, nicht von einem WM-Server ausgeliefert. Wer nur
   verlinkt, „conveyed" nach GPL-Terminologie nicht. Das entlastet **heute** — und **entfällt
   vollständig**, sobald F-3 Option 1 (Self-Hosting) umgesetzt wird. Dann liefert Wender Media das
   GPL-Werk selbst aus und die vollen GPL-Pflichten (Lizenztext beilegen, Urhebervermerke erhalten,
   Quellangebot) greifen unmittelbar.
2. **Die Lizenzangabe muss verifiziert werden.** `public/samples/LICENSE.md` behauptet GPL-3.0.
   Sample-Bibliotheken haben oft gemischte Herkunft mit einzelnen abweichend lizenzierten
   Verzeichnissen. Diese Angabe stammt aus dem eigenen Repo und wurde **nicht** gegen das
   Upstream-Repository geprüft. → `[NEEDS ARNOLD]`

**Abhilfe:** Auf `/samples` und in den Docs eine Attributionszeile ergänzen: „Audio-Samples:
Dirt-Samples (tidalcycles), Lizenz GPL-3.0" mit Link. Vor einem Self-Hosting-Umstieg zwingend die
Upstream-`LICENSE` und alle Unterverzeichnisse prüfen.

---

#### F-11e · Der Electron-Build liefert keine Lizenztexte mit

**Abmahnrisiko: NIEDRIG** · **Lizenzrisiko: HOCH** — der klarste Lizenzverstoß in diesem Repo ·
Rechtsgrundlage: AGPL-3.0 § 4 und § 5 lit. a/c

Wörtlich aus `LICENSE-AGPL` § 4:

> „You may convey verbatim copies of the Program's source code ... provided that you ... keep intact
> all notices stating that this License ... apply to the code; keep intact all notices of the
> absence of any warranty; and **give all recipients a copy of this License along with the
> Program**."

**Gemessen im ausgelieferten Paket.**
`release/mac-arm64/Live Music Coder.app/Contents/Resources/app.asar` wurde entpackt und vollständig
durchsucht: **11.753 Dateien**. Lizenztexte außerhalb von `node_modules/`: **genau einer** —
`/dist/samples/LICENSE.md`, die Sample-Notiz.

**Es fehlen im Paket:** `LICENSE`, `LICENSE-AGPL` (der Volltext), `LICENSE-MIT`, `LICENSING.md`,
`README.md`.

Ursache ist `package.json` → `build.files: ["dist/**", "out/**"]`. Sobald `files` gesetzt ist,
ersetzt es die Voreinstellung von electron-builder; alles außerhalb der zwei Muster fällt raus.
Die `@strudel/*/LICENSE`-Dateien sind nur deshalb enthalten, weil sie innerhalb der Pakete in
`node_modules/` liegen — Zufall, nicht Absicht.

Ergänzend: Die GitHub-Release-Seiten tragen ebenfalls keinen Lizenzhinweis. Die Notes zu v1.1.0
sind rein technisch (Security, A11y, Bug fixes, Type safety) — kein Wort zu AGPL, kein
Quellangebot, kein Impressum-Link, keine Datenschutzangabe.

**Abhilfe (klein und vollständig):**

```jsonc
"files": ["dist/**", "out/**", "LICENSE", "LICENSE-AGPL", "LICENSE-MIT", "LICENSING.md", "README.md"]
```

Zusätzlich: Einen Menüpunkt „Lizenz" unter `Help` in `electron/menu.ts` ergänzen (dort existiert
bereits ein Help-Menü mit „About Live Music Coder"), der Lizenz und Quellangebot anzeigt.
Positiv: Der Landing-Footer rendert in Electron mit (`Landing.tsx:184`, außerhalb der
`!isElectron`-Guards), und `HashRouter` macht `/legal` in der Desktop-App erreichbar — Impressum,
Datenschutz und „Source Code (AGPL-3.0)" sind dort also vorhanden. Der Mangel betrifft die
**mitgelieferten Lizenzdateien**, nicht die Erreichbarkeit.

Und: Der Footer-Satz aus **F-6** („Einige Bilder ... sind KI-generiert") wird mit ausgeliefert und
ist im Binary genauso falsch wie im Web.

---

### F-12 · Pflichten aus der öffentlichen Verbreitung der Desktop-Software

**Abmahnrisiko heute: NIEDRIG** · **Risiko ab 09.12.2026: MITTEL** · Rechtsgrundlage:
RL (EU) 2024/2853 (Produkthaftung), Art. 13 DSGVO

#### Produkthaftung — RL (EU) 2024/2853

Gegen EUR-Lex verifiziert:

- **Art. 4 Nr. 1:** „unter ‚Produkt' sind auch Elektrizität, digitale Konstruktionsunterlagen,
  Rohstoffe und **Software** zu verstehen." Software ist ohne Einschränkung Produkt.
- **Art. 22:** Umsetzung bis **9. Dezember 2026**; die Richtlinie gilt für Produkte, die **nach**
  diesem Datum in Verkehr gebracht oder in Betrieb genommen werden. Frühere Releases bleiben
  außen vor.
- **Art. 2 Abs. 2:** „Diese Richtlinie gilt nicht für freie und quelloffene Software, die
  **außerhalb einer Geschäftstätigkeit** entwickelt oder bereitgestellt wird."
- **Erwägungsgrund 14:** Die Bereitstellung freier Software in offenen Repositories ist kein
  Inverkehrbringen, „**es sei denn**, die Bereitstellung erfolgt im Rahmen einer
  Geschäftstätigkeit" — etwa gegen Entgelt oder gegen personenbezogene Daten (jenseits von
  Sicherheit, Kompatibilität, Interoperabilität).

**Die entscheidende Frage lässt sich hier nicht abschließend beantworten und gehört zum Anwalt.**
Für den Ausschluss spricht viel: Live Music Coder ist echte FOSS unter AGPL-3.0, es wird kein
Entgelt verlangt, es werden keine personenbezogenen Daten monetarisiert, es gibt keine Konten und
kein Tracking. Dagegen spricht, dass die Software von einer **Werbeagentur** unter deren Namen
veröffentlicht wird, das Branding trägt („by Wender Media" im Logo, Footer-Links zu
`wendermedia.com` und `arnoldwender.com`) und damit als Referenz- und Akquisemittel wirkt.
Ob das schon eine „Geschäftstätigkeit" im Sinne von Art. 2 Abs. 2 ist, ist eine Wertungsfrage ohne
Rechtsprechung. → `[NEEDS ARNOLD]` / Anwalt

**Vorsorge, unabhängig vom Ausgang und ohnehin sinnvoll:** Zwei in
`docs/ARCHITECTURE-2026-08-16.md` Anhang A als **CONFIRMED (P1)** verifizierte Sicherheitsbefunde
des Desktop-Builds sind offen — `electron-no-nav-guard` (kein `will-navigate`-Guard, dazu ein
reproduzierter Exploit mit derselben Electron-Version und derselben CSP, sowie
Default-Berechtigungen mit `micPermState: "granted"` und `midiSysexPermState: "granted"` mangels
registriertem Handler) und `home-write-primitive`. Bekannte, dokumentierte und unbehobene
Schwachstellen in einem nach dem 09.12.2026 ausgelieferten Build sind genau die Konstellation, in
der die neue Richtlinie den Fehlerbegriff („Sicherheit, die die breite Öffentlichkeit erwarten
darf", inkl. Cybersicherheitsanforderungen) greifen lässt. Die technische Behebung liegt beim
Security-Track, nicht bei diesem Audit — hier zählt nur, dass sie **vor** dem Stichtag erfolgen
sollte.

#### Keine app-spezifische Datenschutzerklärung

Nach der e-Recht24-Checkliste „Apps rechtssicher aufstellen" braucht eine verbreitete Anwendung
eine **eigene, in der App erreichbare und offline verfügbare** Datenschutzerklärung; die
Website-DSE genügt nicht. Der Desktop-Build zeigt über `/legal` (HashRouter) die **Website**-DSE.
Sie beschreibt Netlify-Hosting und Server-Logfiles, also Vorgänge, die es in der Desktop-App gar
nicht gibt, und schweigt zu dem, was sie tatsächlich tut:

- **`electron/updater.ts` fragt 5 Sekunden nach dem Start und danach alle 4 Stunden bei GitHub nach
  Updates** (`autoUpdater.checkForUpdates()`, `provider: github`). Jede Abfrage überträgt
  IP-Adresse, Version und Plattform an GitHub Inc. (USA). `autoDownload = true` und
  `autoInstallOnAppQuit = true` — Updates werden ohne Rückfrage heruntergeladen.
- Lokale Dateizugriffe, `.lmc`-Dateiverknüpfung, Tray, `electron-log`-Logdateien.
- Web MIDI und Audio-Geräteauflistung (siehe F-13).

**Nichts davon steht irgendwo.** Das ist ein Art.-13-Defizit für die verbreitete Anwendung.

**Abhilfe:** Eine app-spezifische DSE als eigener Abschnitt in `legal.ts`, der in Electron statt
(oder zusätzlich zu) der Website-DSE gerendert wird — Muster:
`Muster-eRecht24-Datenschutzerlaerung-Apps-deutsch.pdf`. Mindestinhalt: Update-Prüfung (Empfänger,
Intervall, Daten, Rechtsgrundlage, Widerspruchsmöglichkeit), lokale Dateien, Logdateien, MIDI.

#### Release-Seite

Die GitHub-Release-Seite ist der Vertriebsort der Software. Sie trägt derzeit **keinen**
Lizenzhinweis, **kein** Quellangebot, **keinen** Impressum-Link und **keine** Datenschutzangabe.
Für ein Angebot einer deutschen Werbeagentur an Verbraucher ist das dünn.

**Faktenkorrektur zur Aufgabenstellung:** Die Software wird **nicht** für mac/win/linux verbreitet.
`package.json` konfiguriert zwar alle drei Ziele (dmg/zip, nsis/portable, AppImage/deb),
veröffentlicht sind über fünf Releases hinweg aber **ausschließlich macOS-Artefakte**
(`.dmg` und `.zip`, arm64 + x64). `README.md:38-39` sagt dazu korrekt „Coming soon" — hier liegt
also **keine** Falschangabe vor.

**Abhilfe:** In die Release-Notes-Vorlage einen kurzen Standardblock aufnehmen: Lizenz
(AGPL-3.0-or-later) + Link auf die Quellen + Link auf `/legal` + Hinweis auf die automatische
Update-Prüfung.

---

### F-13 · Geräte-APIs sind nicht deklariert

**Abmahnrisiko: NIEDRIG** · Rechtsgrundlage: Art. 13 DSGVO

Nicht in der DSE, aber im Code aktiv:

- **Web MIDI.** `navigator.requestMIDIAccess({ sysex: false })` an fünf Stellen; in
  `StrudelEditor.tsx:182` innerhalb eines Mount-`useEffect`, also **automatisch beim Öffnen des
  Editors**. Ausgelesen werden Gerätename und -status (`inputs[0]?.name`, `midi.onstatechange`).
  Gerätenamen sind Hersteller- und Modellinformationen des Nutzers und damit ein
  Fingerprinting-Merkmal. Positiv: `sysex: false` überall — die datenintensive SysEx-Variante wird
  konsequent nicht angefordert.
- **`navigator.mediaDevices.enumerateDevices()`** in `SidePanel.tsx:968`, ebenfalls im
  Mount-`useEffect`, zur Auflistung der Audio-Ausgabegeräte für `setSinkId`. Ohne
  Mikrofonberechtigung liefert der Browser nur reduzierte Angaben, es bleibt aber ein
  Geräte-Enumerationsaufruf.
- **Web Serial: wird nicht verwendet.** `@strudel/serial` ist zwar installiert, aber
  `navigator.serial` kommt in `src/` **nirgends** vor und das Paket wird nicht per `evalScope`
  geladen. Eine Erwähnung in der DSE wäre eine Phantomangabe — **nicht** aufnehmen.

Die Daten verlassen in keinem Fall das Gerät. Es ist ein reines Informationsdefizit nach Art. 13,
kein Übermittlungsproblem.

**Abhilfe:** Kurzer DSE-Abschnitt „Geräteschnittstellen": Web MIDI (Zweck, keine Übermittlung,
Browser-Berechtigung, `sysex: false`), Audio-Geräteauswahl. Web Serial weglassen.

---

### F-14 · Sitemap deckt die Routen nicht ab

**Abmahnrisiko: KEINES** (SEO/Sorgfalt) · keine Rechtsgrundlage

**Teilweise Entwarnung zur Aufgabenstellung:** `public/sitemap.xml` listet 6 URLs und **`/legal`
ist darunter** (`<loc>https://live-music-coder.pro/legal</loc>`, `priority 0.3`). Die Annahme, die
Rechtsseite fehle in der Sitemap, ist **widerlegt** — Impressum und Datenschutz sind indexierbar.

Zutreffend ist die andere Hälfte: `src/App.tsx` deklariert 13 Routenmuster plus Catch-all,
die Sitemap deckt 6 davon ab. Nicht enthalten sind die statischen Routen **`/sessions`,
`/blog`, `/changelog`** (und `/landing`, ein Duplikat von `/`) sowie sämtliche dynamischen
Routen (`/sessions/:slug` — 49 Stück, `/blog/:slug` — 7, `/docs/:sectionId`). `robots.txt` erlaubt
alles und verweist korrekt auf die Sitemap.

**Nebenbefund:** Wegen des SPA-Catch-alls (`netlify.toml`: `/* → /index.html`, Status 200) liefert
**jeder** Pfad HTTP 200, auch `/impressum` und `/datenschutz` — gerendert wird dort die
`NotFound`-Komponente. Das sind Soft-404. Rechtlich unschädlich (Impressum und Datenschutz liegen
auf `/legal` und sind von jeder Seite verlinkt), für die Auffindbarkeit aber ungünstig: Wer
`live-music-coder.pro/impressum` tippt — der in Deutschland naheliegende Reflex — landet auf einer
404-Seite mit Status 200.

**Abhilfe:** Sitemap um die statischen Routen und die 49 + 7 Detailseiten erweitern (aus
`sessions-library.ts` / `blog-library.ts` zur Build-Zeit generieren). Zusätzlich in `netlify.toml`
zwei 301-Weiterleitungen `/impressum → /legal` und `/datenschutz → /legal#datenschutz` — das ist
**kein** Cross-Domain-Redirect und verstößt nicht gegen die WM-STRICT-RULE, weil Ziel und Quelle
dieselbe Domain sind und die Rechtsseite auf der eigenen Domain bleibt.

---

## 3 · Was ausdrücklich in Ordnung ist

Damit der Bericht ehrlich bleibt und niemand Arbeit an Nicht-Problemen verschwendet:

1. **Impressum und Datenschutzerklärung existieren, sind vollständig genug, liegen auf der eigenen
   Domain, liefern HTTP 200 und sind aus dem Footer jeder Seite und aus dem Editor verlinkt.** Die
   WM-STRICT-RULE zur Rechtsseiten-Lokalität ist eingehalten. Kein Cross-Domain-301.
2. **Kein ODR-Link.** Siehe F-2.
3. **Kein Tracking, keine Cookies, kein Analytics, kein Meta Pixel, keine Google Fonts.** Auf `/`
   gemessen: null Drittanbieter-Requests, null Storage-Schreibvorgänge. `font-src 'self' data:`.
4. **Der AVV-Satz zu Netlify ist korrekt.** Netlifys DPA ist per Verweis Bestandteil der AGB und
   für alle Kunden vorunterzeichnet; das Privacy Statement (Stand 10.04.2026) bestätigt DPF-,
   UK-Extension- und Swiss-DPF-Teilnahme sowie SCCs nach Durchführungsbeschluss 2021/914.
   **Nicht** als Mangel melden.
5. **Der DPF-Hinweis zu GitHub ist korrekt** (Privacy Statement, Stand 27.04.2026).
6. **Die zuständige Aufsichtsbehörde ist konkret benannt** — Landesbeauftragte für den Datenschutz
   Sachsen-Anhalt, mit Anschrift, Telefon, E-Mail und Web. Das war der Inline-Fix vom 09.05.2026
   und er hat gehalten.
7. **Keine UWG-Superlative.** Gezielte Suche nach „beste/Nr. 1/garantiert/100 %/führend/einzigartig"
   über Seiten, Locales und `index.html`: **null** Treffer.
8. **Kein Kontaktformular, kein Newsletter, kein Captcha, keine Social-Plugins, keine Embeds.**
   Entsprechend keine der üblichen Formular- und Plugin-Befunde.
9. **Sicherheits-Header sind gesetzt und live wirksam:** CSP mit `frame-ancestors 'none'`,
   `object-src 'none'`, `base-uri 'self'`; HSTS mit `preload`; `X-Content-Type-Options: nosniff`;
   `Referrer-Policy: strict-origin-when-cross-origin`; `Permissions-Policy` schließt Kamera,
   Mikrofon und Geolocation.
10. **Die PAT-Speicherung ist tatsächlich sauber gelöst** (AES-GCM, sitzungsgebundener Schlüssel,
    Migration des Alt-Schlüssels) — nur die UI-Warnung behauptet das Gegenteil (F-7b).
11. **Die AGPL-Wahl ist kein Drift.** Sie ist notwendig (13 AGPL-Abhängigkeiten), von Arnold
    ratifiziert und in `~/.claude/CLAUDE.md` Exception 2 namentlich festgehalten. Der Revert
    `7f77e28` belegt die Entscheidung. **Nie wieder als Verstoß melden.**
12. **Die KI-Kennzeichnung an den Sessions ist vorbildlich** — 49 von 49 Elementen, unmittelbar am
    Inhalt, mit Komponisten-Angabe, in allen drei Sprachen. Freiwillig, nicht geschuldet, behalten.

---

## 4 · Maßnahmen nach Priorität

### Sofort (falsche Aussagen entfernen — kosten Minuten)

| # | Maßnahme | Datei |
|---|---|---|
| 1 | Footer-Satz zur KI-Bildkennzeichnung entfernen (F-6) | `src/i18n/locales/{de,en,es}.json` `footer.aiDisclosure`; `src/pages/Landing.tsx:227-230` |
| 2 | „Gists sind standardmäßig öffentlich" korrigieren (F-7a) | `src/i18n/locales/{de,en,es}.json` `sharing.gistText` |
| 3 | „Token wird unverschlüsselt gespeichert" korrigieren (F-7b) | `src/i18n/locales/{de,en,es}.json` `gist.rememberWarning` |
| 4 | DSA-Fundstelle `2022/265` → `2022/2065`; USt-IdNr-Bindestrich entfernen (F-1) | `src/data/legal.ts` |

### Kurzfristig (Rechtspflichten schließen)

| # | Maßnahme | Bezug |
|---|---|---|
| 5 | DSE-Abschnitt „Audio-Samples von GitHub" ergänzen — oder besser: Samples self-hosten | F-3 |
| 6 | Speicher-Tabelle der DSE vervollständigen (Cache Storage, sessionStorage, `lmc-midi-learn`, `lmc-saved-gists`) | F-5 |
| 7 | DSE-Abschnitt „Geräteschnittstellen" (Web MIDI, Audio-Geräteauswahl) — Web Serial **nicht** aufnehmen | F-13 |
| 8 | `StatusBar.tsx:165,167` lokalisieren + dritten Link „Source (AGPL-3.0)" ergänzen | F-8, F-11a |
| 9 | `<html lang>` an `i18n.language` binden | F-8 |
| 10 | `useEffect` auf `location.hash` in `Legal.tsx` (Tab-Deeplink reparieren) | F-8 |
| 11 | `build.files` in `package.json` um die Lizenzdateien erweitern | F-11e |
| 12 | `LICENSE` durch den AGPL-Volltext ersetzen, GitHub-Klassifikation gegenprüfen | F-11c |

### Mittelfristig

| # | Maßnahme | Bezug |
|---|---|---|
| 13 | Rechtstexte dreisprachig — oder ehrlicher Sprachhinweis über dem deutschen Text | F-8 |
| 14 | `LICENSING.md` aus den SPDX-Headern generieren + CI-Check | F-11c |
| 15 | 6 fehlende SPDX-Header ergänzen | F-11b |
| 16 | App-spezifische Datenschutzerklärung für den Desktop-Build (Update-Prüfung!) | F-12 |
| 17 | Dirt-Samples-Attribution auf `/samples` und in den Docs | F-11d |
| 18 | Sitemap vervollständigen; `/impressum` und `/datenschutz` per Same-Domain-301 auf `/legal` | F-14 |
| 19 | Zahlenangaben an die Datenquelle binden (49 Sessions, 219 Beispiele) | F-7c |
| 20 | Mobile Erreichbarkeit unter 768 px | F-9 |
| 21 | `electron-no-nav-guard` und `home-write-primitive` **vor dem 09.12.2026** schließen | F-12 |

---

## 5 · [NEEDS ARNOLD] — Entscheidungen und Daten, die nicht aus dem Repo kommen

1. **[NEEDS ARNOLD] Sprachfassungen der Rechtstexte.** Sollen Impressum und DSE auf Englisch und
   Spanisch übersetzt werden (dann anwaltliche Freigabe je Sprache) oder bleibt es beim deutschen
   Text mit sichtbarem Sprachhinweis? Maschinelle Übersetzung von Rechtstexten ohne Prüfung ist
   keine Option.
2. **[NEEDS ARNOLD] Produkthaftung ab 09.12.2026.** Gilt die FOSS-Ausnahme nach Art. 2 Abs. 2
   RL (EU) 2024/2853, obwohl die Software unter Agenturbranding als Referenzobjekt veröffentlicht
   wird? Anwaltsfrage, keine Entwicklerfrage.
3. **[NEEDS ARNOLD] Dirt-Samples-Lizenz verifizieren.** Die Angabe „GPL-3.0" stammt aus der eigenen
   `public/samples/LICENSE.md` und wurde nicht gegen das Upstream-Repository geprüft. Vor jedem
   Self-Hosting zwingend klären — beim Verlinken trägt WM die Pflicht nicht, beim Selbst-Ausliefern
   schon.
4. **[NEEDS ARNOLD] Öffentliche Gists.** Soll der fehlende Schalter gebaut werden (dann stimmt der
   Doku-Text wieder) oder wird der Doku-Text an `public: false` angepasst?
5. **[NEEDS ARNOLD] Blog und § 18 Abs. 2 MStV.** Soll die Verantwortlichen-Zeile vorsorglich
   ergänzt werden? Kostet nichts, beseitigt eine Wertungsfrage.
6. **[NEEDS ARNOLD] Samples self-hosten?** Löst F-3 vollständig und ersatzlos, kostet 50–200 MB
   Repo- und Deploy-Volumen und zieht die GPL-Frage aus Punkt 3 nach sich.

---

## 6 · Musterschreiben für die organisatorischen Lücken

Pfad: `/Users/arnold/Development/Knowledge/e-Recht 24 Musterschreiben/`

| Lücke | Muster | Konkreter nächster Schritt |
|---|---|---|
| Desktop-App ohne eigene Datenschutzerklärung (F-12) | `Muster-eRecht24-Datenschutzerlaerung-Apps-deutsch.pdf` | Muster an den Electron-Build anpassen: Update-Prüfung alle 4 h an GitHub (USA), lokale `.lmc`-Dateien, `electron-log`-Logdateien, Web MIDI. Als eigenen Abschnitt in `legal.ts` einsetzen, in Electron rendern. |
| AVV mit Netlify (F-3, Bestätigung) | `Muster-eRecht24-Vereinbarung-zur-Auftragsvereinbarung-nach-DSGVO.pdf` | **Kein Handlungsbedarf** — Netlifys DPA ist per Verweis Bestandteil der AGB und vorunterzeichnet. Muster nur als Referenz, falls je ein separater AVV verlangt wird. |
| Nutzung fremder Werke / Lizenzkette Dirt-Samples (F-11d) | `Urheberrecht-im-Internet.pdf` | Upstream-Lizenz prüfen, Attributionszeile auf `/samples` ergänzen. |
| Interne KI-Nutzung (Sessions sind KI-komponiert) | `Muster-Mitarbeiter-Richtlinie-KI.pdf` | Nur relevant, falls Dritte am Repo mitarbeiten. Derzeit Einzelunternehmer — nachrangig. |

**Hinweis:** eRecht24-Vorlagen sind generisch und müssen an den Einzelfall angepasst werden.
Vor Verwendung durch einen Anwalt prüfen lassen.

---

## 7 · Prüfprotokoll

| Prüfung | Werkzeug | Ergebnis |
|---|---|---|
| Live-Erreichbarkeit `/`, `/legal`, `/sitemap.xml` | `curl -o /dev/null -w %{http_code}` | 200 / 200 / 200; `www` → 301 auf apex |
| dist == live | Vergleich der Asset-Hashes in `index.html` | `index-Dw5e0hz9.js` identisch |
| Drittanbieter-Requests `/` | Headless-Probe, `networkidle2` + 12 s, 0 Interaktionen | 20 Requests, **0 Drittanbieter**, 0 Storage-Keys |
| Drittanbieter-Requests `/editor` | dito | 39 Requests, **1 Drittanbieter**: `raw.githubusercontent.com/.../strudel.json`; 3 localStorage-Keys |
| ODR-Link | `grep` über `src/ public/ electron/ index.html` + Live-DOM-Prüfung | 0 Treffer, `hasODR: false` |
| KI-Bilder | Read-Tool auf `og-image.png` + `icon-512.png`; `<img>`-Zählung; SVG-Base64-Prüfung; PNG-Metadaten | 0 `<img>`, 4 Rasterdateien, alle aus SVG erzeugt, 0 Generator-Signaturen |
| KI-Kennzeichnung Sessions | Live-DOM auf `/sessions` | **49 Einträge, 49 Badges** |
| Rechtstext-Sprache | Live-Probe mit `Accept-Language: es-MX` + `navigator.language` Override | Reiter „Aviso legal", Inhalt deutsch; `lang="en"` |
| SPDX-Abdeckung | Zählung über `src/` + `electron/` | 186 / 192; 164 MIT, 22 AGPL |
| Strudel-Importeure vs. AGPL-Header | zwei `grep`-Listen abgeglichen | 8 Importeure, alle 8 AGPL-markiert, keine Unter-Kennzeichnung |
| Lizenztexte im Desktop-Build | `app.asar`-Header entpackt, 11.753 Einträge durchsucht | 1 Lizenzdatei (`/dist/samples/LICENSE.md`), Root-Lizenzen **fehlen** |
| `@strudel/*`-Lizenzen | `package.json` aller 13 Pakete | 13 × `AGPL-3.0-or-later` |
| GitHub-Releases | `gh release list` + `gh release view v1.1.0` | 5 Releases, **nur macOS**-Artefakte, Notes ohne Lizenz-/Rechtsangaben |
| Repo-Status | `gh repo view --json visibility,isFork,licenseInfo` | `PUBLIC`, kein Fork, `license: "other"` (Fehlklassifikation, siehe F-11c) |
| UWG-Superlative | `grep -i` über Seiten, Locales, `index.html` | 0 Treffer |
| AGPL §§ 4, 5, 13 | `LICENSE-AGPL` im Repo, wörtlich | zitiert in F-11a und F-11e |

**Primärquellen:** e-Recht24 `Pflichtangaben-im-Impressum.pdf` · EUR-Lex RL (EU) 2024/2853
(Art. 2 Abs. 2, Art. 4 Nr. 1, Art. 22, ErwG 14) · gesetze-im-internet.de BFSG (§ 1, § 2 Nr. 26,
§ 3 Abs. 3, § 14) · AI Act Art. 50 Abs. 2 und 4 · VO (EU) 2024/3228 (ODR-Abschaltung 20.07.2025) ·
Netlify Privacy Statement 10.04.2026 · GitHub Privacy Statement 27.04.2026 ·
`node_modules/@strudel/webaudio/supradough.mjs` (URL-Auflösung `github:`).

---

**Prüfzeitraum: 2026-08-16/17 · Stand: 2026-08-17 · Vor Verwendung durch Anwalt prüfen lassen /
Pending counsel review.** Erstellt als Arbeitsergebnis, nicht als Rechtsberatung. Keine
Codeänderung im Rahmen dieser Prüfung — dieses Audit war read-only.
