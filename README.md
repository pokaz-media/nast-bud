# NAST-BUD — strona firmowa

Statyczna, jednostronicowa witryna producenta betonu towarowego z województwa
łódzkiego. Bez frameworka i bez kroku budowania: to, co leży w repozytorium,
jest tym, co widzi przeglądarka.

**Na żywo:** https://nast-bud.pl/ (hosting home.pl)
**Podgląd roboczy:** https://pokaz-media.github.io/nast-bud/

## Struktura

```
index.html              cała strona — jedyny plik HTML
assets/
  css/styles.css        wszystkie style
  js/script.js          reveal przy scrollu, aktywna pozycja w nawigacji,
                        odtwarzacz YouTube ładowany po kliknięciu
  js/consent.js         baner cookies (Google Consent Mode v2), tagi Google,
                        konwersje z kliknięć w telefon i e-mail
  img/                  logo, favicon, og-image, zdjęcia sekcji, miniatury certyfikatów
  docs/                 9 certyfikatów ZKP w PDF (linkowane z sekcji „Jakość")
.htaccess               wymuszenie https, www → bez www, przekierowania 301 ze
                        starych adresów WordPressa, nagłówki cache (tylko home.pl)
robots.txt, sitemap.xml
deploy.sh               wysyłka plików na home.pl przez FTPS
.nojekyll               wyłącza przetwarzanie przez Jekyll na GitHub Pages
```

### Konwencja nazw w `assets/img/`

Prefiks mówi, w której sekcji zdjęcie jest użyte:

| Prefiks | Sekcja |
|---|---|
| `hero-` | nagłówek strony |
| `film-` | plakat filmu prezentacyjnego |
| `oferta-` | karty 01 Beton / 02 Prefabrykaty / 03 Flota |
| `lok-` | pasmo zdjęć wytwórni |
| `rz-` | mozaika „Realizacje" |
| `cert-` | miniatury certyfikatów, `cert-{produkt}-{wytwórnia}` |
| `sponsor-` | sekcja sponsoringu |

## Praca lokalna

Otwarcie `index.html` z dysku nie zadziała poprawnie (osadzone mapy i iframe
wymagają http). Uruchom lokalny serwer:

```sh
python3 -m http.server 8000
# → http://localhost:8000
```

## Wdrożenie

Produkcja to hosting home.pl: domena `nast-bud.pl` wskazuje na katalog
`/public_html/nastbudpl` serwera `wordpress2336808.home.pl`.

```sh
./deploy.sh preview   # → /public_html/nastbudpl/_new, podgląd pod https://nast-bud.pl/_new/
./deploy.sh live      # → /public_html/nastbudpl, czyli publikacja
```

Skrypt czyta dane logowania z `~/.netrc-nastbud` (poza repozytorium, `chmod 600`):

```
machine wordpress2336808.home.pl login <login> password <hasło>
```

Po każdej publikacji warto sprawdzić przekierowania, bo psuje je literówka w `.htaccess`:

```sh
curl -sI http://nast-bud.pl/ | head -2       # 301 → https://nast-bud.pl/
curl -sI https://nast-bud.pl/kontakt/ | head -2   # 301 → https://nast-bud.pl/#kontakt
```

Równolegle GitHub Pages serwuje gałąź `main` jako podgląd roboczy; `canonical`
w `index.html` wskazuje na `nast-bud.pl`, więc kopia nie konkuruje w wyszukiwarce.

> **Uwaga:** każdy plik `.html` w repozytorium staje się publicznym adresem.
> Nie zostawiaj tu roboczych wersji strony — będą dostępne dla wszystkich
> i mogą zawierać nieaktualne dane kontaktowe.

## Edycja treści

Wszystkie teksty, adresy i telefony są bezpośrednio w `index.html`.
Numer telefonu występuje w **trzech** miejscach (hero, sekcja Kontakt, stopka)
plus w danych strukturalnych na dole pliku — zmieniaj wszędzie naraz.
Wszystkie wytwórnie mają jeden adres e-mail: `biuro@nast-bud.pl`.

Po zmianie CSS lub JS podbij parametr `?v=` przy ich `<link>` i `<script>`
w `index.html`. Hosting cache'uje te pliki przez tydzień.

### Cookies i konwersje

Identyfikatory tagów Google wpisuje się w obiekcie `NB_TAGS` na górze
`assets/js/consent.js`. Puste pole oznacza, że dany tag się nie ładuje.

- `gtm`: kontener Tag Managera. Wtedy skrypt tylko wrzuca zdarzenia
  do `dataLayer`, a tagi i reguły konfiguruje się w GTM.
- `ga4`, `ads`: bez GTM, bezpośrednio przez gtag.js.
- `adsPhoneLabel`, `adsEmailLabel`: etykiety konwersji Google Ads.

Każde kliknięcie w link `tel:` lub `mailto:` wysyła zdarzenie `phone_click`
albo `email_click` z polami `contact_value` (numer, adres) i `contact_placement`
(sekcja strony). Zgoda startuje jako odmowa, a wybór z banera aktualizuje
Consent Mode. Wybór leży w `localStorage` pod kluczem `nb-consent`,
a stopka ma link „Ustawienia cookies”, który otwiera baner ponownie.

### Dodanie certyfikatu

1. Wrzuć PDF do `assets/docs/` pod nazwą `cert-{produkt}-{wytwórnia}.pdf`
   (bez polskich znaków i spacji).
2. Wygeneruj miniaturę:
   ```sh
   pdftoppm -r 150 -png -singlefile assets/docs/cert-x-y.pdf /tmp/c
   python3 -c "from PIL import Image; im=Image.open('/tmp/c.png').convert('RGB'); \
     im.thumbnail((1100,1100)); im.save('assets/img/cert-x-y.webp','WEBP',quality=80,method=6)"
   ```
3. Dopisz kafelek w sekcji `.certs-grid` w `index.html`.

### Przy zmianie domeny

Adres `https://nast-bud.pl/` występuje 16 razy w `index.html`: w `<head>`
(`canonical`, `og:url`, `og:image`) oraz w bloku JSON-LD na końcu pliku.
Podmień wszystkie wystąpienia — i pamiętaj o `sitemap.xml`, `robots.txt`
oraz o adresach docelowych przekierowań w `.htaccess`.
