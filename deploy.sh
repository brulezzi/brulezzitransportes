#!/bin/bash
set -euo pipefail
cd /var/www/motoboy-campinas-24h
git fetch origin
git cat-file -e origin/main:index.html
git reset --hard origin/main
test -s index.html
test -s script.js
test -s style.css
git rev-parse HEAD > deployment-version.txt
echo "Deploy concluido em $(date -Is): $(git rev-parse HEAD)" >> /var/log/motoboy-campinas-deploy.log
