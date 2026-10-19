# Oblikovna raziskava: Love The Garden

Pregledano 19. oktobra 2026. Referenca za prenovo Setvenega koledarja je britanska različica strani. Ugotovitve temeljijo na dejanskem HTML, CSS ter preverjanju prikaza v brskalniku. Predlogi za našo stran so navedeni ločeno.

## Pregledani viri

- [Osnovna domena](https://www.lovethegarden.com/): izbirnik države in jezika.
- [Britanska domača stran](https://www.lovethegarden.com/uk-en/): glavna oblikovna referenca.
- [Oktober na vrtu](https://www.lovethegarden.com/uk-en/garden-calendar/october): mesečni koledar in opravila.
- [Zbirka rastlinskih vodnikov](https://www.lovethegarden.com/uk-en/tools/growing-guides): iskanje, kategorije in kartice.
- [Vodnik za česen](https://www.lovethegarden.com/uk-en/growing-guide/how-grow-garlic): primer podrobnosti rastline.
- [Jesensko vrtnarjenje](https://www.lovethegarden.com/uk-en/article/our-guide-autumn-gardening): primer članka, avtorstva in povezanih vsebin.
- [Glavni CSS](https://www.lovethegarden.com/sites/default/files/css/css_ZnCPbli5EziSmjgymrLJKVE7v2jET1_Vm18Ofm1UleI.css): oblikovni tokeni in odzivna pravila.
- [Adobe Typekit](https://use.typekit.net/wjj0atp.css): vir referenčne tipografije Gotham.

## Potrjena vsebinska arhitektura

Glavna navigacija ima sklope Products, Explore all our brands, Tools, Advice & Inspiration in Where to buy. Servisna vrstica vsebuje iskanje, prodajna mesta in kontakt. Na telefonu se navigacija odpre z namenskim gumbom.

Domača stran poteka od velike fotografske predstavitve z močnim naslovom in glavnim gumbom do znamk, sezonskega bloka »What to do in your garden in October«, mesečno relevantnih izdelkov, izpostavljenih člankov in obsežne noge. Vsebina povezuje svetovanje s komercialno ponudbo.

Mesečni koledar ima fotografijo in naslov, vseh 12 mesecev, kratek sezonski uvod ter kategorije Grow your own, Outdoor Plants in Lawn Care. Loči sajenje, vzdrževanje in pobiranje. Kartice rastlin vodijo do podrobnih vodnikov; prisotne so tudi povezave do sosednjih mesecev, člankov in izdelkov.

Pregledani UK koledar je mesečni vrtnarski vodnik, ne lunin koledar. Njegovih britanskih terminov ne prenašamo v slovenska priporočila.

Ponavljajoči se vzorci:

- Kartica rastline: fotografija, ime, pogosto latinsko ime, povezava »Read more«.
- Kartica članka: fotografija, naslov, kratek povzetek in jasna povezava; pomembnejši članek ima besedilo čez večjo fotografijo.
- Kartica izdelka: fotografija, ime in »Buy now« oziroma »Find a store«.
- Rastlinski vodnik: sorte, čas in postopek sajenja, nega, pobiranje, shranjevanje, bolezni in preglednica lastnosti.
- Članek: kategorija, čas branja, drobtinice, navedena avtorica in njena strokovna vloga.

## Oblikovni tokeni in izmerjene vrednosti

**Pomembna razlika med splošnim CSS in dejanskim UK prikazom:** skupni CSS vsebuje limetino privzeto vrednost `#99cc00`. V preverjenem britanskem prikazu imata glavni poziv k dejanju in noga strani rumeno `#f9d102`, besedilo pa temno zeleno `#093b32`. Za prenos uporabljamo dejanski UK prikaz. Rumena ni sklep iz samega privzetega tokena `--button-primary-background-color`.

| Namen                          | Vrednost in dokaz                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Glavni UK gumb in noga         | `#f9d102`, preverjeno v brskalniku; v CSS obstaja tudi `--egc-color-miracle-gro-yellow:#f9d102`         |
| Naslovi in temno besedilo      | `#093b32`, token `--heading-color`                                                                      |
| Temno zelena                   | `#1a462a`, token `--egc-color-primary`                                                                  |
| Druga zelena                   | `#0f6131`, token `--egc-color-secondary`                                                                |
| Besedilo v odstavkih           | `#222`, token `--egc-text-color`                                                                        |
| Svetlo ozadje kartic           | `#f5f5f5`, token `--egc-color-tertiary`                                                                 |
| Svetla obroba                  | `#e7e7e7`, token `--egc-color-lightgrey-border`                                                         |
| Limetina skupna privzeta barva | `#99cc00`, token `--egc-color-fertiligene-green:#9c0`; ni barva glavnega UK gumba v preverjenem prikazu |
| Zaoblitve                      | `8 / 12 / 16 / 18 / 24px`; običajni radius `16px`                                                       |

Referenca uporablja `font-family:gotham,Segoe UI,Helvetica,sans-serif`. Osnovna teža je 400, naslovi 800. Naša statična stran uporablja **samogostovani odprti Montserrat iz `@fontsource/montserrat` različice 5.2.8**, zato ne potrebuje računa Adobe Typekit.

`.btn` uporablja velikost `16px`, višino vrstice `20px`, težo 700, obrobo `2px`, radius `16px` in padding `12px 15px`. `.btn-lg` ima padding `15px 24px`. Sekundarni gumbi so temno zeleni z belim besedilom. Puščica ob besedilu je del ponavljajočega se vzorca.

`.homepage-header__title` je bel, zelo poudarjen in zapisan z velikimi črkami: približno `32/36px` na ozkem zaslonu, `48/48px` od 768px in `64/64px` od 992px. Vsebina uvoda ima največ 660px širine. Fotografija uporablja `object-fit:cover`, radius 16px ter temni preliv za berljivost besedila. Zunanji spodnji vogali uvoda imajo radius 24px.

`.product-teaser` ima padding 16px, svetlo ozadje in radius 16px. Fotografije člankov imajo zaobljene robove in izrez; hover sliko poveča na `scale(1.05)` v 0,35 sekunde. Izpostavljeni članek uporablja temni preliv in bel naslov čez fotografijo. Manjše vodoravne kartice delijo prostor približno 42 % za sliko in 58 % za vsebino.

## Mobilni in namizni prikaz

| Širina zaslona | Največja širina običajnega kontejnerja                   |
| -------------- | -------------------------------------------------------- |
| Pod 576px      | 100 % razpoložljive širine                               |
| Od 576px       | 540px                                                    |
| Od 768px       | 720px                                                    |
| Od 992px       | 960px                                                    |
| Od 1200px      | 1140px; posebno pravilo med 1200 in 1260px določa 1040px |
| Od 1440px      | 1220px                                                   |

Kontejnerji imajo samodejna stranska robova. Poznejše pravilo določa stranski padding 32px, od 1200px pa ga odstrani. Pri 992px se poveča tipografija in lestvica razmikov; veliki razmiki znašajo 48, 64 in 96px. Uvodni blok ima lastne širine in odmike. Na telefonu njegov glavni gumb zavzame vso širino; vsebina in navigacija se prilagodita ozkemu zaslonu.

## Prenos na Setveni koledar

1. Ohranimo lastno ime **Setveni koledar** in slovenske vsebine. Uporabimo rumeno, temno zeleno, močno geometrijsko tipografijo, fotografski uvod, zaobljene kartice in razmerja prostora iz preverjene UK reference. Logotipov in proizvodnih kartic ne predstavljamo kot naših.
2. Navigacijo prilagodimo opravilom: Setveni koledar, Rastline, Nasveti in Moj vrt. Iskanje naj bo hitro dosegljivo tudi na telefonu.
3. Vsebino razporedimo: izrazit uvod → kaj počnemo ta mesec → mesečni izbor in filtri → rastline → sezonski nasveti → Moj vrt.
4. Ohranimo izbiro vseh mesecev, kombiniranje iskanja in filtrov, dodajanje rastlin, števec ter shranjevanje vrta v tem brskalniku.
5. Rastlinske kartice naj jasno ločujejo setev, sajenje in pobiranje. Fotografija in podatki naj pomagajo prepoznati rastlino in izbrati opravilo.
6. Podrobnosti rastlin in regionalno prilagajanje so smiselni nadaljnji nadgradnji. Temeljita vsebinska razširitev potrebuje preverjene lokalne podatke; ne izhaja samodejno iz oblikovne prenove.
7. Pred objavo preverimo telefon in namizje, navigacijo s tipkovnico, vse mesece in filtre, prazen rezultat, shranjevanje vrta ter nalaganje sredstev na poti GitHub Pages `/setveni-koledar/`.
