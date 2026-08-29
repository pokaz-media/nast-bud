# NAST-BUD — strona firmowa

Statyczna, jednostronicowa witryna producenta betonu towarowego z województwa
łódzkiego. Bez frameworka i bez kroku budowania: to, co leży w repozytorium,
jest tym, co widzi przeglądarka.

**Na żywo:** https://pokaz-media.github.io/nast-bud/

## Struktura

```
index.html              cała strona — jedyny plik HTML
assets/
  css/styles.css        wszystkie style
  js/script.js          reveal przy scrollu, aktywna pozycja w nawigacji,
                        odtwarzacz YouTube ładowany po kliknięciu
  img/                  logo, favicon, og-image, zdjęcia sekcji, miniatury certyfikatów
  docs/                 9 certyfikatów ZKP w PDF (linkowane z sekcji „Jakość")
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

GitHub Pages serwuje gałąź `main` z katalogu głównego. Push na `main`
publikuje zmiany — przebudowa trwa zwykle minutę lub dwie.

> **Uwaga:** każdy plik `.html` w repozytorium staje się publicznym adresem.
> Nie zostawiaj tu roboczych wersji strony — będą dostępne dla wszystkich
> i mogą zawierać nieaktualne dane kontaktowe.

## Edycja treści

Wszystkie teksty, adresy i telefony są bezpośrednio w `index.html`.
Numer telefonu występuje w **trzech** miejscach (hero, sekcja Kontakt, stopka)
plus w danych strukturalnych na dole pliku — zmieniaj wszędzie naraz.

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

Adres `https://pokaz-media.github.io/nast-bud/` występuje w `<head>`
(`canonical`, `og:url`, `og:image`) oraz w bloku JSON-LD na końcu `index.html`.
Podmień wszystkie wystąpienia.
