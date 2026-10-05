#!/bin/sh
# Wdrożenie strony na hosting home.pl przez FTP.
#
#   ./deploy.sh preview   -> /public_html/nastbudpl/_new  (podgląd, bez .htaccess)
#   ./deploy.sh live      -> /public_html/nastbudpl        (produkcja, z .htaccess)
#
# Dane logowania czytane są z ~/.netrc-nastbud (chmod 600), w formacie:
#   machine wordpress2336808.home.pl login <login> password <hasło>
#
# Uwaga: używamy --ftp-ssl-control (logowanie szyfrowane TLS, kanał danych
# jawny). Pełne FTPS (--ssl-reqd) na home.pl ucina większe pliki na granicy
# 16/32 KB (błąd 451), więc szyfrujemy tylko kanał kontrolny z hasłem.
# Wszystko leci jednym połączeniem, żeby nie wywołać throttlingu FTP.

set -eu

HOST="wordpress2336808.home.pl"
NETRC="$HOME/.netrc-nastbud"
# Konto FTP zamknięte w katalogu strony widzi go jako swój katalog główny —
# wtedy uruchom: FTP_BASE= ./deploy.sh live
LIVE_DIR="${FTP_BASE-/public_html/nastbudpl}"

case "${1:-}" in
  preview) DEST="$LIVE_DIR/_new"; EXTRA="" ;;
  live)    DEST="$LIVE_DIR";      EXTRA=".htaccess" ;;
  *) echo "użycie: $0 preview|live" >&2; exit 2 ;;
esac

[ -r "$NETRC" ] || { echo "Brak pliku z danymi FTP: $NETRC" >&2; exit 2; }

cd "$(dirname "$0")"

echo "Wgrywam do ftp://$HOST$DEST"

FILES="index.html robots.txt sitemap.xml $EXTRA $(find assets -type f ! -name '.DS_Store' | sort)"

# Jedno połączenie, wiele plików naraz.
set --
for f in $FILES; do
  set -- "$@" -T "$f" "ftp://$HOST$DEST/$f"
done
curl -sS --ftp-ssl-control --netrc-file "$NETRC" --ftp-create-dirs --max-time 300 "$@"

# Weryfikacja: porównaj rozmiary lokalne z serwerem (home.pl potrafi uciąć plik).
failed=0
for f in $FILES; do
  local=$(wc -c < "$f" | tr -d ' ')
  remote=$(curl -sS --ftp-ssl-control --netrc-file "$NETRC" --max-time 30 -I "ftp://$HOST$DEST/$f" 2>/dev/null \
    | awk -F': ' '/Content-Length/{gsub(/\r/,"");print $2}')
  if [ "$local" = "$remote" ]; then
    echo "  ok    $f"
  else
    echo "  BŁĄD  $f (lokalnie=$local, serwer=${remote:-brak})" >&2
    failed=$((failed + 1))
  fi
done

if [ "$failed" -gt 0 ]; then
  echo "Nie udało się wgrać $failed plików." >&2
  exit 1
fi

echo "Gotowe."
