#!/usr/bin/env bash
# Deploys the site to the cPanel host over FTP, one folder per release.
#
#   deploy/ftp-deploy.sh <release> <dist-dir>   upload dist-dir as a new release and switch to it
#   deploy/ftp-deploy.sh <release>              switch to a release already on the server (rollback)
#
# Steps: upload to releases/<release>.partial, rename it to releases/<release>
# (so a half-finished upload never looks like a release), then upload the root
# .htaccess as .htaccess.new and rename it over .htaccess. That rename is the
# switch (see deploy/htaccess). Finally, delete all but the newest $KEEP releases.
#
# Environment: FTP_HOST, FTP_USER, FTP_PASSWORD (required); FTP_DIR (default
# public_html); FTP_TLS (default yes: explicit FTPS); KEEP (default 5);
# BACKUP_DIR (if set, $FTP_DIR minus releases/ is downloaded there first);
# FTP_DEBUG (if set, print the FTP dialogue; lftp masks the password).
set -euo pipefail

release="${1:?usage: $0 <release> [dist-dir]}"
dist="${2:-}"
: "${FTP_HOST:?}" "${FTP_USER:?}" "${FTP_PASSWORD:?}"
FTP_DIR="${FTP_DIR:-public_html}"
FTP_TLS="${FTP_TLS:-yes}"
KEEP="${KEEP:-5}"

if [[ ! "$release" =~ ^[A-Za-z0-9._-]+$ ]]; then
  echo "invalid release name: $release" >&2
  exit 1
fi

here="$(cd "$(dirname "$0")" && pwd)"
export LFTP_PASSWORD="$FTP_PASSWORD"

# Runs lftp commands inside $FTP_DIR; any failing command aborts.
ftp() {
  lftp -c "
    set cmd:fail-exit yes
    set net:max-retries 3
    set net:timeout 30
    set ftp:list-options -a
    ${FTP_DEBUG:+debug 3}
    set ftp:ssl-allow $FTP_TLS
    set ftp:ssl-force $FTP_TLS
    set ftp:ssl-protect-data $FTP_TLS
    open --env-password -u \"$FTP_USER\" \"$FTP_HOST\"
    cd \"$FTP_DIR\"
    $1"
}

list_releases() {
  ftp "cls -1 releases/" 2>/dev/null | sed 's#/$##; s#.*/##' | grep -v '^$' || true
}

if [[ -n "$dist" ]]; then
  [[ -f "$dist/index.html" ]] || { echo "$dist/index.html not found" >&2; exit 1; }
fi

# Everything outside releases/ is not in git (the live .htaccess, files from
# before this CI, anything uploaded by hand): keep a copy before touching it.
if [[ -n "${BACKUP_DIR:-}" ]]; then
  echo "==> Backing up $FTP_DIR (without releases/) to $BACKUP_DIR"
  ftp "mirror --no-perms --exclude ^releases/ . \"$BACKUP_DIR\""
fi

if [[ -n "$dist" ]]; then
  echo "==> Uploading $dist to releases/$release"
  # The root .htaccess lives outside the release; dist must not carry its own.
  ftp "
    mkdir -p -f releases
    rm -r -f releases/$release.partial
    mirror -R --no-perms --parallel=4 \"$dist\" releases/$release.partial
    mv releases/$release.partial releases/$release"
else
  list_releases | grep -qx "$release" || {
    echo "release $release is not on the server. Available:" >&2
    list_releases >&2
    exit 1
  }
fi

echo "==> Switching to $release"
htaccess="$(mktemp)"
trap 'rm -f "$htaccess"' EXIT
sed "s/__RELEASE__/$release/g" "$here/htaccess" > "$htaccess"
ftp "put \"$htaccess\" -o .htaccess.new"
# Some FTP servers refuse to rename over an existing file; then delete first
# (the site is unconfigured for that instant).
ftp "mv .htaccess.new .htaccess" 2>/dev/null ||
  ftp "rm -f .htaccess; mv .htaccess.new .htaccess"

echo "==> Pruning old releases (keeping $KEEP)"
old="$(list_releases | grep -vx "$release" | sort | head -n -"$((KEEP - 1))" || true)"
for r in $old; do
  echo "    rm releases/$r"
  ftp "rm -r releases/$r"
done

echo "==> Live: $release"
