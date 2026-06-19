# FIT NIIKITER — Model Portfolio (Sedcard)

Eigenständige Single-File Model-Sedcard für Agentur-Bewerbungen und Brand-Deals.
Komplett getrennt von der Recipe-Brand. Vanilla HTML/CSS/JS, keine Build-Tools,
keine Frameworks, keine externen Abhängigkeiten.

> Die Datei heißt hier `model.html`, damit sie **nicht** die Recipe-Site
> (`index.html`) überschreibt. Sobald sie in ihrem **eigenen Repo** liegt,
> benenne sie in `index.html` um (siehe unten).

---

## 1. Alles ändern an EINER Stelle

Öffne `model.html` und scrolle zum großen `CONFIG`-Block (klar markiert mit
`HIER ALLES ÄNDERN`). Dort pflegst du:

| Was | Wo im CONFIG |
|-----|--------------|
| Name, Handle, Booking-Mail | `name`, `handle`, `email` |
| **Bild-URLs (Cloudflare R2)** | `images: { headshot_clean: "...", ... }` |
| Welches Bild als Link-Vorschau | `ogImageKey` |
| Galerie-Reihenfolge + Labels | `gallery: [...]` |
| Sedcard-Maße (Augen, Brust, Taille, Schuh ...) | `stats: [...]` |
| Creator-Sektion an/aus | `showCreator: true/false` |
| Followerzahlen + Channel-Links | `channels: [...]` |
| Social-Links unten | `socials: [...]` |

**Bilder:** Solange ein Feld leer (`""`) ist, zeigt die Seite automatisch einen
sauberen, beschrifteten Platzhalter (Inline-SVG, kein externer Request). Trägst
du eine R2-URL ein, wird sofort das echte Foto geladen. Alle Bilder sind
`loading="lazy"` (Hero + erste 2 Tiles `eager` für schnellen ersten Eindruck).

Empfohlene Bildgröße: ~800×1000 px (4:5), als WebP/JPEG, komprimiert.

---

## 2. Lokal testen

Einfach `model.html` im Browser per Doppelklick öffnen — fertig.
Optional mit lokalem Server:

```bash
python3 -m http.server 8000
# dann http://localhost:8000/model.html
```

---

## 3. In ein eigenes GitHub-Repo legen

1. Neues, leeres Repo anlegen, z. B. `model-portfolio`.
2. `model.html` **als `index.html`** ins Repo-Root kopieren
   (GitHub Pages serviert `index.html` automatisch unter `/`):

   ```bash
   git init
   cp model.html index.html
   git add index.html
   git commit -m "Add model portfolio"
   git branch -M main
   git remote add origin git@github.com:DEINUSER/model-portfolio.git
   git push -u origin main
   ```

3. **GitHub Pages aktivieren:** Repo → *Settings* → *Pages* →
   *Build and deployment* → Source: **Deploy from a branch** →
   Branch: **main** / Ordner: **/ (root)** → *Save*.
   Nach ~1 Min ist die Seite unter `https://DEINUSER.github.io/model-portfolio/` live.

---

## 4. Subdomain `model.fitniikiter.com` via Cloudflare anbinden

**a) Custom Domain in GitHub eintragen**
Repo → *Settings* → *Pages* → *Custom domain* → `model.fitniikiter.com` →
*Save*. GitHub legt dann eine `CNAME`-Datei im Repo an (Inhalt:
`model.fitniikiter.com`).

**b) DNS-Eintrag in Cloudflare**
Cloudflare Dashboard → Domain `fitniikiter.com` → *DNS* → *Add record*:

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | `model` | `DEINUSER.github.io` | **DNS only (graue Wolke)** |

> Wichtig: Beim ersten Einrichten **Proxy auf „DNS only"** (graue Wolke) stellen,
> damit GitHub das SSL-Zertifikat ausstellen kann. Nach erfolgreichem
> HTTPS-Check in GitHub Pages kannst du den Proxy (orange Wolke) wieder
> aktivieren, falls gewünscht.

**c) HTTPS erzwingen**
Zurück in GitHub Pages: Häkchen bei **Enforce HTTPS** setzen (erscheint, sobald
das Zertifikat steht — kann bis zu 24 h dauern, meist wenige Minuten).

Fertig: `https://model.fitniikiter.com` zeigt die Sedcard.

---

## 5. Was die Seite kann

- **Hero** mit vollflächigem Headshot, Name, Handle + Scroll-Hinweis.
- **Stats-Grid** (klassische Sedcard-Daten, responsiv 2→3→4 Spalten).
- **Galerie** mit 6 Shot-Kategorien + schlanke **Lightbox**
  (Klick öffnet, ◄/► oder Pfeiltasten, ESC schließt, Swipe am Handy).
- **Creator-Sektion** mit Reichweite (per `showCreator` ausblendbar).
- **Kontakt** mit Booking-Mail + Social-Links.
- **Link-Vorschau** (`<title>`, `og:title`, `og:image`) für Caster, die zuerst
  die Vorschau sehen.
- Mobile-first, System-Fonts (kein Font-CDN), kein Tracking, kein externer Code.

---

## 6. Open Graph Vorschau testen

Nach dem Deploy mit echtem `og:image` (absolute URL!) prüfen:
- Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
- LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/

> `og:image` muss eine **absolute** URL sein (z. B. die R2-URL), keine relative.
