# Setveni koledar

Odziven mesečni vrtnarski vodnik v slovenščini: izbor meseca, filtri opravil,
iskanje po rastlinah, osnovni vodniki za 12 vrtnin, štirje nasveti in osebni vrt.
Izbor se shranjuje lokalno v brskalniku, pod ključem `setveni-vrt`.

## Osebni načrtovalnik

Razdelek »Moj načrt« v štirih korakih vpraša po vrtu, balkonu ali obeh,
uporabni površini gredic oziroma številu, prostornini in globini enakih posod,
neposrednem soncu in želenih rastlinah. Za vrt je na voljo tudi izbiren osnovni
opomnik za lansko skupino rastlin.

Načrt dodeli posamezni rastlinski skupini košček grede ali eno posodo; ne
prekorači vnesenih kapacitet. Izbira »oboje« najprej razporedi zahtevnejše rastline
na vrt in listnate v posode, kjer pogoji to dopuščajo. Za neprimerne ali
nedodeljene rastline pojasni omejitve. Pretežno senčna lega ne dobi navidezno
primernega načrta za zelenjadnice.

Rezultat vsebuje shemo (ni v merilu), količine za začetek, razmike, nego in mesečna
opravila z označevanjem. Koledar je mogoče omejiti na dejansko dodeljene rastline.
Načrt lahko uredite, natisnete ali odstranite. Dodajanje načrta ohrani stare
priljubljene rastline. Odstranitev načrta ne izbriše priljubljenih.

Profil je shranjen pod `setveni-plan`, oznake opravil pod `setveni-plan-opravila`.
Vse ostane v trenutnem brskalniku. Načrtovalnik deluje tudi brez trajnega
shranjevanja in takrat pokaže obvestilo. Ni prijave, API-ja ali prenosa teh
podatkov na strežnik.

Model je v `planner-engine.js`, uporabniški vmesnik v `planner.js` in `planner.css`.
Površina se rezervira za skupino ene vrste; samodejnih zaporednih posevkov v isto
posodo ali natančnega večletnega kolobarja model ne računa. Opravila so sezonska
okna iz koledarja in niso napoved dejanskega datuma pobiranja.

Preizkusi modela brez dodatnih odvisnosti:

```sh
node --test tests/planner-engine.test.cjs
```

## Lokalni zagon

Projekt je statičen in ne potrebuje namestitve odvisnosti ali gradnje:

```sh
cd /workspace/setveni-koledar
python3 -m http.server 3000 --bind 0.0.0.0
```

Preverjanje strežnika in JavaScripta:

```sh
curl -fsS http://127.0.0.1:3000/ > /dev/null
node --check app.js
```

V brskalniku preverite mesece, združevanje filtrov in iskanja, prazen rezultat,
dodajanje/odstranjevanje iz vrta in ohranitev izbora po osvežitvi. Podrobnosti
rastlin in nasvete je mogoče zapreti z Escape. Mobilni meni je dostopen s
tipkovnico. Strežnik je treba po ponovnem zagonu okolja ponovno zagnati.

## GitHub Pages

Objava uporablja vejo `main` in korensko mapo `/`. Datoteka `.nojekyll` omogoča
neposredno streženje statičnih datotek. Vsa sredstva uporabljajo relativne poti,
zato stran deluje tudi pod `/setveni-koledar/`. Ni zaledne storitve ali skrivnosti.
Pisava Montserrat je gostovana lokalno; njena licenca je v `assets/fonts/OFL.txt`.

## Viri in omejitve

Oblikovna raziskava in pregledane povezave so v [DESIGN-RESEARCH.md](DESIGN-RESEARCH.md).
Izvori fotografij so zabeleženi v [assets/photo-sources.json](assets/photo-sources.json).
Fotografija `assets/autumn-garden.webp` izvira iz oktobrskega koledarja Love The Garden:
https://www.lovethegarden.com/uk-en/garden-calendar/october.
Javno dostopen vir fotografije sam po sebi ne pomeni odprte licence za ponovno uporabo.

Termini so okviren, splošen vodič za osrednjo Slovenijo in niso odvisni od leta.
Natančne termine, globino in razmike prilagodite sorti, vremenu ter navodilom na
semenski vrečki. Stran ne vsebuje dnevnih luninih priporočil ali vremenskih podatkov.
