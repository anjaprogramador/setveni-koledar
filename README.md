# Setveni koledar

Odziven mesečni vrtnarski vodnik v slovenščini: izbor meseca, filtri opravil,
iskanje po rastlinah, osnovni vodniki za 12 vrtnin in 6 zelišč, štirje nasveti in osebni vrt.
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

Balkonski predlog daje prednost zeliščem: baziliki, peteršilju, drobnjaku, meti,
timijanu in rožmarinu. Zelenjava ostane dodatna možnost. Podprte so tudi manjše
posode 3/5 l in uporabna globina 15 cm. Predlog še vedno preveri potrebe vsake
rastline; meta potrebuje svojo posodo, timijan in rožmarin sončno lego, občutljiva
bazilika pa dovolj toplote. Uveljavljena zelišča imajo opravila za sprotno nabiranje.

Model je v `planner-engine.js`, uporabniški vmesnik v `planner.js` in `planner.css`.
Površina se rezervira za skupino ene vrste; samodejnih zaporednih posevkov v isto
posodo ali natančnega večletnega kolobarja model ne računa. Opravila so sezonska
okna iz koledarja in niso napoved dejanskega datuma pobiranja.

Preizkusi modela brez dodatnih odvisnosti:

```sh
node --test tests/planner-engine.test.cjs
```

Po spremembi JavaScripta ali slogov posodobite različice datotek v HTML. Tako
brskalnik ob objavi ne uporabi starih skriptov skupaj z novim vmesnikom:

```sh
node scripts/generate-seo-pages.cjs
node scripts/update-asset-versions.cjs
node --test tests/*.test.cjs
```

Različica v URL-ju je izračunana iz vsebine datoteke. Test pred objavo preveri,
da HTML kaže na aktualne različice ter ohrani vrstni red zagona skriptov.

## Lokalni zagon

Projekt je statičen in za streženje ne potrebuje namestitve odvisnosti. Po spremembah vsebine najprej poženite zgornji generator z Node.js, nato strežnik:

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


## Javni vodniki, godovi in ljudske modrosti

`node scripts/generate-seo-pages.cjs` iz `content/*.json`, koledarskih podatkov
in `site.config.json` ustvari 36 statičnih podstrani, začetne vsebinske odseke,
`seo-manifest.json` in `sitemap.xml` (skupaj 37 URL-jev). Generirane datoteke so
shranjene v repozitoriju, zato GitHub Pages ne potrebuje lastne gradnje.
Po spremembi domena/ime projekta se popravi v `site.config.json` in ponovno
požene generator ter posodobitev različic. Datoteke v označenih `SEO:*` odsekih
začetne strani ureja generator.

Javne poti: `balkon/`, `rastline/`, `rastline/{id}/`, `meseci/`,
`meseci/{mesec}/`, `godovi/`, `ljudske-modrosti/`, `o-projektu/`.
Vodniki delujejo brez JavaScripta; na začetni strani se običajen klik na
rastlinsko povezavo še vedno odpre v hitrem pogovornem oknu, kjer je tudi povezava
na celoten vodnik. `?nacrt=zacimbe#nacrt` odpre izbiro začimb in ohrani obstoječe
pogoje; spremembe se shranijo šele ob potrditvi. `?mesec=1..12#koledar` odpre
izbrani mesec.

`godovi/` ponuja izbor 97 stalnih zapisov s slovenskimi imeni in povezavo na
izvorni datum iz romcal. Ni popoln uradni slovenski bogoslužni koledar.
`tradition.js` doda filtre mesecev in iskanje brez šumnikov; brez JS so vidni vsi
zapisi. Podlaga in MIT licenca sta v `content/namedays.json` in
`content/romcal-LICENSE.txt`. Pregovori in njihove samostojne praktične razlage
so v `content/proverbs.json`. Pri Matiji je pojasnjena razlika med februarskim
ljudskim datumom in sedanjim majskim godom.

Izvedene SEO spremembe, dejansko pregledani viri, omejitve Google Trends ter
postopek za Search Console so v [SEO-REPORT.md](SEO-REPORT.md). Socialna slika
je lastna tipografska kompozicija projekta v `assets/social-card.png`.
