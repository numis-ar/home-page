#!/bin/bash
THIS_FILE=$(realpath "$0")
DIR=$(dirname "$THIS_FILE")
cd DIR
set -ex
rm -rf dist
pnpm build
rm sitio.zip
find dist -type f -exec chmod 644 {} \;
find dist -type d -exec chmod 755 {} \;
cd dist
zip -r ../sitio.zip .
cd ..

