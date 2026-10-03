#!/bin/sh
# Wdrożenie strony na hosting home.pl przez FTPS.
#
#   ./deploy.sh preview   -> /public_html/nastbudpl/_new  (podgląd, bez .htaccess)
#   ./deploy.sh live      -> /public_html/nastbudpl        (produkcja, z .htaccess)
#
# Dane logowania czytane są z ~/.netrc-nastbud (chmod 600), w formacie:
#   machine wordpress2336808.home.pl login <login> password <hasło>

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
failed=0

for f in index.html robots.txt sitemap.xml $EXTRA $(find assets -type f ! -name '.DS_Store' | sort); do
  if curl -sS --ssl-reqd --netrc-file "$NETRC" --ftp-create-dirs -T "$f" "ftp://$HOST$DEST/$f"; then
    echo "  ok    $f"
  else
    echo "  BŁĄD  $f" >&2
    failed=$((failed + 1))
  fi
done

if [ "$failed" -gt 0 ]; then
  echo "Nie udało się wgrać $failed plików." >&2
  exit 1
fi

echo "Gotowe."
