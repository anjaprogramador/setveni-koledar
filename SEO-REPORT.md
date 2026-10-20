# SEO prenova · 20. oktober 2026

Stran ostaja na https://anjaprogramador.github.io/setveni-koledar/ in ne navaja
osebnega avtorja. Prenova izboljša javno vsebino, povezave in tehnično osnovo;
podatkov o dejanski obiskanosti ali uvrstitvah še nimamo.

## Kaj je izvedeno

- 37 javnih URL-jev: začetna stran, 18 rastlinskih vodnikov, 12 mesečnih
  pregledov, imenika rastlin in mesecev, balkon, godovi, ljudske modrosti in
  stran o projektu. Bistvena vsebina teh vodnikov je že v HTML in deluje brez JS.
- Vsaka stran ima svoj naslov, opis, en H1, lasten canonical, jezik `sl`,
  Open Graph in sliko za deljenje. JSON-LD opisuje dejansko stran in pot do nje;
  ni izmišljenega avtorja, ocen ali priporočil strokovnjakov.
- Prave povezave med meseci, rastlinami in načrtovalnikom. Kartice začimb so na
  začetni strani vidne tudi obiskovalcu s starim shranjenim načrtom.
- `sitemap.xml` vsebuje vseh 37 kanoničnih URL-jev. Parametri načrtovalnika,
  filtrov in osebni podatki niso vključeni.
- Dve lokalni spremenljivi pisavi nadomestita osem nalaganj statičnih rezov.
  Stare datoteke ostajajo zaradi predpomnjenih različic strani.
- Datoteke CSS/JS imajo vsebinske različice. Tako objava ne pomeša novega
  vmesnika in starega načrtovalnika iz brskalnikovega predpomnilnika.

Google lahko obdeluje JavaScript, vendar se ne zanašamo na klikanje pogovornih
oken ali na obiskovalčev `localStorage`, da bi odkril glavne vsebine.

## Teme in iskalni namen

To so uredniške hipoteze, ne izmerjene ključne besede ali obsegi iskanja.

| Iskalni namen | Primeri izrazov | Vstopna stran |
| --- | --- | --- |
| Splošen sezonski pregled | setveni koledar, kdaj sejati | začetna, `meseci/` |
| Delo v določenem mesecu | kaj sejati oktobra, setveni koledar marec | `meseci/{mesec}/` |
| Majhen prostor | začimbe na balkonu, zelišča v loncih | `balkon/` |
| Nega rastline | bazilika v loncu, kdaj sejati peteršilj | `rastline/{rastlina}/` |
| God imena | godovi slovenskih imen, kdaj goduje Ana | `godovi/` |
| Kulturno izročilo | slovenski vremenski pregovori | `ljudske-modrosti/` |

Za godove ne ustvarjamo stotin skoraj enakih strani za vsako različico imena.
En iskalnik in jasno navedena datumska podlaga sta uporabnejša od takih podvojitev.
Naslovi in opisi se lahko v rezultatih Googla prikažejo drugače.

## Viri, ki so bili dejansko pregledani

- [GoogleChrome/web.dev: How Search works](https://github.com/GoogleChrome/web.dev/blob/main/src/site/content/en/discoverable/how-search-works/index.md)
  — odkrivanje strani, indeksiranje in koristnost običajnih spletnih povezav.
- [Lighthouse: crawlable anchors](https://github.com/GoogleChrome/lighthouse/blob/main/core/audits/seo/crawlable-anchors.js),
  [canonical](https://github.com/GoogleChrome/lighthouse/blob/main/core/audits/seo/canonical.js),
  [meta description](https://github.com/GoogleChrome/lighthouse/blob/main/core/audits/seo/meta-description.js),
  [is crawlable](https://github.com/GoogleChrome/lighthouse/blob/main/core/audits/seo/is-crawlable.js)
  — tehnična preverjanja, ne dokaz uvrstitve ali kakovosti vsebine.
- [romcal, pripeta različica](https://github.com/romcal/romcal/tree/812d82caf817946dea07fce94fadd77973834308)
  — podlaga za 97 zapisov stalnih godov; vsak zapis v `content/namedays.json`
  ima povezavo na izvorno vrstico. Licenca je v `content/romcal-LICENSE.txt`.

Romcal ni uradni slovenski koledar in nima slovenske lokalizacije. Slovenski
nazivi in izbrane različice imen so naša obdelava. Letnih prestavitev in celotnih
škofijskih posebnosti ne računamo. Pregovori so izbor razširjenega ustnega
izročila, ne kritična izdaja ene zgodovinske zbirke. Neposrednega pregleda
Wikivira, Hozane in Ognjišča zaradi spodaj opisane omejitve ni bilo.

## Google Trends in neposredni viri

V tej seji ni priključka za Google Trends in ni bilo mogoče pridobiti njegovih
javnih podatkov: omrežni posrednik zavrne povezavo (CONNECT 403). Enako velja za
neposredne povezave do Search Central, Hozane, Ognjišča in Wikivira.
Potrebne domene so shranjene v osnutku nastavitev okolja; osnutek sam ne spremeni
dostopa. Uporabnik mora spremembe v nastavitvah shraniti in objaviti okolje.
Nismo obšli omejitve ali ustvarili navideznih številk o priljubljenosti.

Ko bo Trends dostopen, primerjamo Slovenijo, več let in isto kategorijo/vrsto
iskanja. Posebej primerjamo sezonskost ter izraze »setveni koledar«, »zelišča na
balkonu« in »začimbe na balkonu«. Trendsov indeks 0–100 ni mesečni obseg iskanja.
Izrazov brez dovolj podatkov ne razglasimo za nezanimive.

## Merjenje po objavi

1. V [Google Search Console](https://search.google.com/search-console/) dodajte
   **URL-prefix property** za `https://anjaprogramador.github.io/setveni-koledar/`.
   DNS lastništva domene `github.io` ni prava pot za ta projekt.
2. Izberite preverjanje z datoteko HTML ali meta oznako, ki jo Google dodeli tej
   lastnosti. Preveritvene vrednosti ne izmišljamo; na strani je še ni.
3. Po potrditvi dodajte zemljevid:
   `https://anjaprogramador.github.io/setveni-koledar/sitemap.xml`.
4. Z URL Inspection preverite začetno stran, en mesec, eno začimbo in godove.
   Zahteva za indeksiranje sama ne zagotovi vključitve.
5. Spremljajte indeksirane URL-je, prikaze, klike in dejanske poizvedbe. Na podlagi
   podatkov dopolnjujte vodnike in opise. Za meritve iz resničnih obiskov počakajte
   na dovolj podatkov; laboratorijski test tega ne nadomesti.

GitHub Pages projekt ne upravlja `https://anjaprogramador.github.io/robots.txt`.
Datoteka pod `/setveni-koledar/robots.txt` ne bi nadzorovala iskalnikov, zato je
nismo dodali. Sitemap je mogoče oddati neposredno v Search Console.

## Preverjanje in kakovost

Avtomatski preizkusi preverjajo datumsko obliko, notranje povezave, odseke,
različice sredstev, metapodatke, strukturirane podatke ter prisotnost statičnih
vodnikov. Brskalniški pregled preverja filtre, godove, začimbe, shranjene načrte,
prikaz brez JS in več širin zaslona.

Začetni mobilni Lighthouse na lokalnem Pythonovem strežniku je dal
performance 78, accessibility 100, best practices 100, SEO 100. Že prvotni
SEO rezultat 100 ni zaznal odsotnosti samostojnih vodnikov.

Končni pregled iste vrste po prenovi:

| Mobilni Lighthouse | Začetna stran | Začimbe na balkonu |
| --- | --- | --- |
| Performance | 82 | 95 |
| Accessibility | 100 | 100 |
| Best practices | 100 | 100 |
| SEO | 100 | 100 |
| LCP | 4,7 s | 2,9 s |
| CLS | 0 | 0 |

LCP začetne strani ostaja nad ciljem 2,5 s in je naslednja možnost za izboljšavo.
To so laboratorijske meritve brez produkcijskega stiskanja in niso terenski
Core Web Vitals ali obljuba uvrstitev. Neocenjeno opozorilo o imenu skrajšanih
mesečnih gumbov ostaja; na balkonski strani ni opozoril za dostopnost.

Vsebina potrebuje nadaljnje uredniško dopolnjevanje, lastne izkušnje in po
možnosti vrtnarski pregled. Novi besedili ne predstavljata strokovne recenzije.
Koledar je okviren za osrednjo Slovenijo in ne vsebuje dnevnega luninega izračuna.


## Dopolnitev dnevnih godov in menija · 20. oktober 2026

Ognjišče je bilo pri ponovnem preverjanju neposredno dostopno. Iz javnih
[dnevnih seznamov](https://revija.ognjisce.si/svetnik-seznam-10-20/) smo uporabili
imena in datumska dejstva, brez prepisovanja življenjepisov. Prvotnih 97 zapisov
romcal je ohranjenih; dodanih je 270 zapisov za manjkajoče datume, od tega 269
iz Ognjišča in 21. maj iz pripetega romcal. Skupaj 367 zapisov pokriva vseh
366 datumov, tudi 29. februar. Vsak zapis navaja svoj vir. To ne pomeni, da
je na vsak dan naveden prav vsak svetnik ali da računamo letne liturgične prestavitve.

Dve nepravilnosti v uvrstitvah izvornih člankov sta bili preverjeni posebej.
12. oktober je v drugi kategoriji vira. Podvojena objava za 29. maj ni bila
samovoljno uporabljena za manjkajoči 21. maj; ta datum je dopolnjen iz romcal.
Zapis prenosa in zgoščene vrednosti virov so v `content/namedays-sources.json`.
Generator in preizkus zdaj zahtevata pokritost vsakega od 366 datumov.

Enotna zgornja navigacija vseh strani vsebuje tudi Godove in Pregovore.
Mobilni meni ima popravljeno širino pri320 px, povezave pa imajo vsaj44 px
visoke površine za dotik. Obstoječi načrti in priljubljene rastline se ne spreminjajo.
