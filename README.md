# Tetify — firemní web

Statický web (HTML + CSS + JS + three.js). Žádný build, žádné závislosti k instalaci.

## Struktura

```
index.html          # celá stránka
css/style.css       # design systém + všechny sekce
js/main.js          # reveal animace, menu, kurzor, FAQ, formulář
js/scene.js         # three.js pozadí (částice + drátěné jádro)
assets/logotet.png  # logo Tetify (na tmavém podkladu se invertuje CSS filtrem)
assets/logos/       # loga klientů a produktů
assets/apps/        # snímky z App Storu a ikony aplikací (sekce Mobilní aplikace)
favicon.ico         # + assets/favicon-32.png, favicon-192.png, apple-touch-icon.png
```

Favicon je vyříznuté první „t" z loga na zelené dlaždici (celý wordmark se do čtverce
nevejde, prohlížeč by ho smrštil). `apple-touch-icon.png` má ostré rohy schválně —
iOS si je zakulatí sám.

Zdrojový kód: https://github.com/TheodorJL/Tetifyweb

## Spuštění

```bash
python3 -m http.server 4321
```

Pak otevřít http://localhost:4321 — kvůli ES modulům (`js/scene.js`) web nefunguje
přes `file://`, musí běžet přes HTTP server.

## Nasazení

Web běží na Firebase Hostingu, projekt `tetify-d7f01`:

- **https://tetify-d7f01.web.app**
- https://tetify-d7f01.firebaseapp.com

Nová verze se nasadí jedním příkazem (nic se nekompiluje):

```bash
firebase deploy --only hosting
```

Konfigurace je ve `firebase.json` — nasazuje se kořen projektu s tím, že
`README.md`, `.claude/`, `logotet.png` a `assets/logos/pokis-original.png`
jsou ze zdrojů vyloučené. HTML, CSS i JS mají `no-cache` — prohlížeč se při
každém načtení zeptá, jestli se soubor změnil (nezměněný vrátí levné 304).
Obrázky se cachují 30 dní.

Dřív měly CSS/JS hodinovou cache a po deployi to znamenalo nové HTML se starými
styly. Proto je u nich v `index.html` `?v=…`. Běžné úpravy ho nepotřebují,
ale **když změníš HTML tak, že bez nového JS/CSS nefunguje** (třeba odstranění
preloaderu — starý `main.js` s novým HTML nechal úvodní obrazovku prázdnou),
zvedni `?v=` u všech tří souborů. Kopie uložené dřív bez `no-cache` se jinak můžou
ještě chvíli použít.

Nadpisy s animací písmen (`data-split`) jsou do rozložení na písmena skryté
(třída `.js` na `<html>`), aby neblikly. Kdyby se `main.js` nenačetl, CSS je
po 2 s ukáže samo.

### Vlastní doména

V konzoli → Hosting → Add custom domain. Firebase vypíše DNS záznamy
(A / TXT) k nastavení u registrátora a certifikát vystaví sám.

## Co ještě doplnit / upravit

| Kde | Co |
|---|---|
| `index.html` — sekce Kontakt + footer | ověřit e-mail `info@tetify.cz` |
| `index.html` — sekce Stats | čísla `40+` a `100 %` jsou zástupná |
| `index.html` — sekce Reference | v citacích jsou překlepy z originálu, viz níže |
| `assets/logos/` | souhlas klientů s užitím log — viz níže |
| `index.html` — `<head>` | `og:image` doporučuji nahradit absolutní URL na náhledový obrázek 1200×630 |
| `js/main.js` — `initForm()` | formulář teď jen otevře e-mailového klienta (`mailto:`) — pro odesílání na server napojte Formspree / vlastní API v označeném `TODO` |

## Loga klientů

Loga v `assets/logos/` jsou stažená z veřejných webů klientů a na tmavém podkladu se
vykreslují bíle přes CSS filtr `brightness(0) invert(1)`.

| Soubor | Zdroj |
|---|---|
| `cot.svg` | olympijskytym.cz (varianta pro tmavý režim) |
| `waca.svg` | waca.tetify.cz/logo.svg |
| `fleysen.png` | fleysen.com (bílá horizontální varianta) |
| `theis.svg` | theis.cz/assets/theis-logo.svg |
| `pokis.png` | z `AppIcon.png` — odmazané černé pozadí, ořez na glyf, 512×512 RGBA (originál zůstal jako `pokis-original.png`) |
| `honzabartos.svg` | honzabartos.cz (inline SVG z hlavičky) |

| `glowly.svg` | dodáno klientem (bílá varianta) |
| `blaho.svg` | blaho.work (inline SVG z hlavičky) |
| `cot-color.svg` | barevná varianta značky ČOV pro světlé mockupy |

**Před spuštěním si ověřte souhlas s užitím.** U referencí je to běžná zdvořilost,
u Českého olympijského výboru navíc povinnost — olympijská symbolika je v ČR chráněná
zákonem č. 60/2000 Sb. a její užití vyžaduje souhlas ČOV.

## Citace v referencích

Citace jsou uvedené doslovně tak, jak je klienti poskytli. Jsou v nich tři místa,
která nejspíš vznikla překlepem — opravte je až po odsouhlasení autorem citace:

- Fleysen: „máme odpovídajícího partnery" → pravděpodobně „odpovídajícího partnera"
- ČOV: „do našich inhouse týmu" → pravděpodobně „do našeho inhouse týmu"
- ČOV: „zvědnout komunikaci" → pravděpodobně „zvednout komunikaci"

Hvězdičkové hodnocení je jen u citace od Jany (honzabartos.cz) — jako jediná ho měla.
Pokud ho máte i od ostatních, přidejte do jejich `<figure>` stejný blok
`<div class="quote__stars" …>★★★★★</div>`.

## Mockupy projektů

Každý projekt v sekcích Produkty a Práce má náhled v **reálném designu daného projektu**,
ne v barvách Tetify. Barvy, fonty a prvky UI jsou převzaté přímo z jejich webů
(zjištěno z computed styles v prohlížeči):

| Projekt | Pozadí | Akcent | Font |
|---|---|---|---|
| ČOV Podpora / Onboarding / Podatelna | `#fff`, `#eef1f5` | `#0081c8`, navy `#1a1a2e` | DM Sans |
| Blaho & work | `#fcf8ff` | `#fda4af` | Poppins + serif¹ |
| WACA | `#a2b7de` | `#f84b80` | Inter |
| Fleysen | `#fff` | `#171717`, `#8cac89`, `#f1ba00` | Raptor Text² |
| Theis | `#f9f6f3` | `#0a7550` | Familjen Grotesk + JetBrains Mono |
| Pokis | `#0a0a0b` | `#f2c94c`, `#34d399` | Inter |

¹ Blaho používá komerční „Fields Display", nahrazeno DM Serif Display z Google Fonts.
² Raptor Text je komerční, nahrazeno Inter Tight.

Všechno je čisté HTML/CSS (žádné screenshoty), takže je to ostré na každém displeji
a animuje se to: mockup se rozehraje, když karta dostane `.is-in`. Styly jsou v bloku
`MOCKUPY PROJEKTŮ` v `css/style.css`, každý projekt má vlastní prefix (`.mcov`, `.monb`,
`.mpod`, `.mwaca`, `.mfley`, `.mblaho`, `.mtheis`, `.mpokis`).

Data v mockupech jsou ilustrační — žádné skutečné tikety, dokumenty ani uživatelé.

## Sekce Mobilní aplikace

Snímky jsou originální screenshoty z App Storu (Blaho & work, POKIS, THEIS), převedené
do WebP (9 souborů, celkem ~234 kB). Mají jen 369×800 px, proto se zobrazují nejvýš
~176 px široké — větší by byly na retině rozmazané. Pokud dodáš snímky ve vyšším
rozlišení, stačí přepsat soubory v `assets/apps/` a zvednout `--shot-w` v CSS.

| Soubor | Obsah |
|---|---|
| `blaho-1..3.webp` | Ovládání členství a dveří · Kalendář · Komunita |
| `pokis-1..3.webp` | Všechny nabídky · Kde koupit osobně (mapa) · Sledované obchody |
| `theis-1..3.webp` | Celý provoz na jedné obrazovce · Všechna videa · Nahrání videa |
| `icon-blaho/theis.webp` | ikony z App Storu (přes iTunes Search API) |
| `icon-pokis.webp` | z `pokis-original.png` — POKIS v českém App Storu dohledat nešel |

Odkazy: Blaho & work a THEIS vedou do App Storu, POKIS na pokis.cz.

## Mikro-scény v sekci „Co děláme“

Karty služeb nemají ikonu, ale malou animovanou scénu (`.card--scene` + `.scene`),
která ukazuje, co ta služba dělá. Sedm scén, každá vlastní: `.s1` až `.s7` v `css/style.css`.

Každá scéna se rozehraje dvakrát:

1. **Sama, jednou** — jakmile karta najede do obrazu, JS jí na 2,2 s přidá třídu `is-demo`
   (v `initReveal()` v `js/main.js`). Bez toho by na mobilu, kde není hover, zůstala scéna
   navždy v klidovém stavu.
2. **Při najetí myší** — `:hover` používá úplně stejné selektory.

Přidání osmé služby: zkopírovat kteroukoli kartu, dát jí `class="card card--scene spotlight reveal"`,
dovnitř `<div class="scene">` a napsat k ní `.s8` v CSS. Vždy platí, že scéna musí něco ukazovat
i v klidovém stavu — jinak je tam prázdná díra (na to jsem narazil u `.s7`, proto má šedou
„ghost“ linku pod animovanou).

Porovnání směrů, ze kterých se vybíralo, zůstalo v `navrhy-widgetu.html`
(http://localhost:4321/navrhy-widgetu.html) — z nasazení je vyloučené.

## Barvy

Definované jako CSS proměnné na začátku `css/style.css`:

```
--green:    #00e07a   /* hlavní firemní zelená */
--green-lt: #7cffbe
--green-dk: #009c55
--teal:     #00d8c2
```

Změna zelené na jednom místě propíše celý web včetně 3D pozadí
(v `js/scene.js` odpovídají uniformy `cA` / `cB` / `cC`).

## Poznámky

- three.js se načítá z CDN (jsdelivr) přes `importmap`. Pokud chcete web plně offline,
  stáhněte `three.module.js` do `js/vendor/` a přepište cestu v `index.html`.
- Respektuje `prefers-reduced-motion` — animace se vypnou uživatelům, kteří o to požádají.
- Bez WebGL (starý prohlížeč) stránka funguje dál, jen bez 3D pozadí.
