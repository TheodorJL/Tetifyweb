# Tetify — firemní web

Statický web (HTML + CSS + JS + three.js). Žádný build, žádné závislosti k instalaci.

## Struktura

```
index.html          # celá stránka
css/style.css       # design systém + všechny sekce
js/main.js          # preloader, reveal animace, menu, kurzor, FAQ, formulář
js/scene.js         # three.js pozadí (částice + drátěné jádro)
assets/logotet.png  # logo Tetify (na tmavém podkladu se invertuje CSS filtrem)
assets/logos/       # loga klientů a produktů
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
jsou ze zdrojů vyloučené. HTML se neukládá do cache, CSS/JS na hodinu
s revalidací, obrázky na 30 dní.

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
