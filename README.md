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
| `fleysen.webp` | fleysen.com (bílá horizontální varianta), zmenšeno na 280×92 WebP |
| `theis.svg` | theis.cz/assets/theis-logo.svg |
| `pokis.webp` | z `AppIcon.png` — odmazané černé pozadí, ořez na glyf, 128×128 WebP (originál zůstal jako `pokis-original.png`) |
| `qeris.svg` | značka z qeris.cz/favicon.svg (dva zelené čtverce). Kolem malého čtverce je maskou vyříznutá mezera, jinak by po bílém CSS filtru oba čtverce splynuly v jeden tvar |
| `honzabartos.svg` | honzabartos.cz (inline SVG z hlavičky) |

| `glowly.svg` | dodáno klientem (bílá varianta); `viewBox` oříznutý na kresbu — původně měla kolem sebe ~40 % prázdného plátna. V HTML je `?v=2`, protože obrázky se cachují 30 dní |
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
| Qeris | `#f5f5f7`, text `#1d1d1f` | graf `#3fc722`, „Živě" `#249c0e`, šedá `#86868b` | systémový (SF Pro) |

¹ Blaho používá komerční „Fields Display", nahrazeno DM Serif Display z Google Fonts.
² Raptor Text je komerční, nahrazeno Inter Tight.

Všechno je čisté HTML/CSS (žádné screenshoty), takže je to ostré na každém displeji
a animuje se to: mockup se rozehraje, když karta dostane `.is-in`. Styly jsou v bloku
`MOCKUPY PROJEKTŮ` v `css/style.css`, každý projekt má vlastní prefix (`.mcov`, `.monb`,
`.mpod`, `.mwaca`, `.mfley`, `.mblaho`, `.mtheis`, `.mpokis`, `.mqeris`).

V Produktech jsou tři produkty vedle sebe a karta „váš produkt" je pod nimi přes celou
šířku jako pruh (`@media (min-width:1081px)` u `.product--cta`). Pod 1080 px jsou
dva sloupce a karta je zase normální, takže vychází mřížka 2 × 2.

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
| `icon-pokis.webp` | ikona z App Storu (POKIS vyšel 11. 9. 2026) |

Odkazy u všech tří aplikací vedou do App Storu.

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

## Výkon

Výchozí stav podle PageSpeed Insights (15. 9. 2026): **mobil 39, desktop 89**.
Po prvním kole úprav mobil **78**. Druhé kolo (hvězdy v CSS, content-visibility)
zvedlo lokální Lighthouse na mobilu z mediánu **85 na 99** (3 běhy na verzi,
zahřátá CDN) a LCP z 4,3 s na 1,7 s. Hlavní příčiny a co s nimi je:

| Problém | Řešení |
|---|---|
| Jeden blokující stylesheet se 7 fonty (mobil: −4 s) | Základní fonty (Inter Tight, Inter, JetBrains Mono) se načítají neblokujícně. Fonty pro mockupy klientů (DM Sans, Poppins, Familjen Grotesk, DM Serif Display) dotahuje `initLazyFonts()` v `main.js` až při scrollu k Produktům. |
| Hero čekal na JS a fonty (LCP 6,6 s) | Nadpis je rozložený na písmena rovnou v HTML a hero se animuje v CSS od prvního vykreslení (`.hero-in`, `heroLetter`). Animace začíná na `opacity:.01`, protože prvek s nulovou průhledností se do LCP nepočítá. |
| three.js na telefonu (39 s práce hlavního vlákna) | `scene.js` na dotyku a pod 820 px three.js vůbec nestahuje — hero má místo scény statické hvězdné pozadí. Na desktopu se scéna spouští až po načtení stránky a z minifikovaného buildu (166 kB místo 257 kB). |
| Obrázky (−273 KiB) | `pokis.png` měl 258 kB pro 34px logo → `pokis.webp` 6 kB; `fleysen.png` → `fleysen.webp`. Všechny `<img>` mají `width`/`height`. |
| Nekonečné animace mimo obrazovku | `initAnimPause()` jim přidá `.anim-off` (pozastaví je), když nejsou vidět. |
| Hvězdné pozadí posouvalo LCP na 4,3 s | Chrome ho bere jako největší prvek, ale zapínal ho až JS třídou `.no-webgl`. Teď je řešené media query (stejná podmínka jako v `scene.js`) a SVG je vložené přímo v CSS (`--hero-stars`) — vykreslí se v prvním snímku. |
| Rozvržení celé stránky před prvním snímkem | Sekce pod ohybem mají `content-visibility:auto`, prohlížeč je počítá až při přiblížení. Odhad výšky dává `contain-intrinsic-size`. Protože s odhadem by skok z menu minul cíl, `main.js` před skokem přidá `.cv-off` a úsporu vypne. |
| 260 prvků v jednom SVG | Čárky pozadí ČOV sloučené do 15 cest (podle barvy a průhlednosti), DOM o 244 prvků menší. |
| Logo Tetify 485×207 PNG na 104 px | `logotet.webp` 224×96. Původní PNG zůstává kvůli `og:image`. |
| PageSpeed pořád 77 (FCP 3,9 s), i když lokálně 99 | Lighthouse počítá FCP jako průměr dvou odhadů. Do pesimistického spadne všechno, co se *začalo stahovat* před prvním vykreslením. Na rychlém stroji fonty začaly až po něm, na serverech PageSpeed před ním: ~300 kB přes 2 cizí domény na pomalém 4G. Webové fonty teď načítá `initFonts()` v `main.js` až po `load` + dvou `requestAnimationFrame`, takže vždy až po prvním snímku. Stejně tak fonty mockupů. Obrázky pod ohybem mají `loading="lazy"`. |
| Přepnutí systémového fontu na Inter by posunulo text | `@font-face` `Inter Fallback` a `Inter Tight Fallback` na začátku `style.css`: Arial/Roboto se `size-adjust` a `ascent/descent-override` spočítanými z metrik Interu (fontTools, český text). CLS 0,002. |

| PageSpeed desktop 69 (TBT 1,9 s, 15 dlouhých úloh) | three.js se spouštěl sám po načtení a pak renderoval v každém snímku; na pomalém PC bez GPU to jsou dlouhé úlohy. `scene.js` teď three.js stáhne až první interakcí (myš, scroll, klávesa) a renderer má `failIfMajorPerformanceCaveat` — při softwarovém WebGL se scéna nespustí vůbec. Do té doby jsou v hero statické hvězdy i na desktopu, se startem scény se prolnou pryč (`.webgl-ready`). Kurzor v `main.js` už nepřekresluje v každém snímku, smyčka běží jen při pohybu myši. |

Třetí kolo (fonty po prvním vykreslení): mobil **99 / 100 / 100**, FCP 1,0 s, a to i v běhu,
kde první vykreslení přišlo až po 1,7 s. Desktop 100.

Čtvrté kolo (desktop, three.js až po interakci): Lighthouse desktop se 4× zpomaleným CPU
a softwarovým WebGL — před úpravou 4,4 s práce hlavního vlákna, po ní **0,4 s, TBT 0 ms, skóre 98**.

Co zůstává: „nepoužívaný JavaScript" (three.js na desktopu — bez bundleru se nedá
ořezat) a minifikace vlastního CSS/JS (jednotky kB, projekt záměrně nemá build).

## Prezentace firmy (PDF)

Patnáct snímků 16 : 9 ve vzhledu webu, postavených stejně jako prezentace Qerisu:
HTML stránka se snímky 1920 × 1080 px, kterou Chrome bez okna vytiskne do PDF.

```
scripts/prezentace-pdf.sh            # → prezentace/Tetify-prezentace.pdf
```

| Soubor | K čemu je |
|---|---|
| `prezentace.html` | Snímky. Texty vycházejí z webu, jen jsou kratší. |
| `prezentace/deck.css` | Vzhled snímků. Barvy a fonty bere z proměnných v `css/style.css`. |
| `prezentace/assets/` | Bílé varianty log (web je bělí CSS filtrem, v PDF by se rozmazaly). |
| `scripts/prezentace-pdf.sh` | Spustí si na chvíli místní server a vytiskne PDF. |

Náhledy projektů (ČOV, WACA, Fleysen, Blaho, Theis, Pokis, Qeris) se **kopírují přímo
z `index.html`** – skript na konci `prezentace.html` si web načte a prvky `.mcov`, `.mwaca`…
vloží na místa označená `data-mock`. Prezentace tak vždy ukazuje totéž co web a náhledy
zůstávají v PDF vektorové (zvětšují se přes `zoom`). Kvůli tomu načítání musí prezentace běžet
přes http, ne z `file://` – skript na PDF si server spouští sám, pro náhled v prohlížeči
stačí `python3 -m http.server` a `/prezentace.html`.

Na web se nic z toho nenasazuje (`firebase.json` ignoruje `prezentace.html`, `prezentace/`
i `scripts/`). Kdyby mělo PDF viset na `tetify.cz/prezentace.pdf` jako u Qerisu, stačí ho
zkopírovat do kořene a nasadit.

Na co si dát pozor při úpravách (Chrome 154, tisk do PDF):

- **Přechody se rastrují.** Každý `linear-gradient` na pozadí prvku skončí v PDF jako
  obrázek (~90 kB na kartu), s průhledností i bez. Karty proto mají jednu plnou barvu
  a záře na pozadí jsou dva malé boxy s přechodem do barvy pozadí. Rozdíl: 10,6 MB → 4,9 MB.
- **`filter: blur` taky**, a při `zoom` umí vytéct mimo rám. Rozmazané kruhy z náhledů
  jsou v `deck.css` nahrazené přechody.
- **Snímek musí být nedělitelný** (`contain: layout paint size`). Bez toho Chrome rozdělí
  prvek, který přes hranu stránky přesahuje jen před posunutím transformací – typicky
  karta vystředěná přes `top:50%` + `translateY(-50%)`.
- **Čísla.** V prezentaci jsou jen ověřitelné údaje (3 produkty, Praha a Karlovy Vary).
  Statistiky „40+ projektů“ a „100 %“ z webu v ní schválně nejsou, dokud je nikdo nepotvrdí.

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
