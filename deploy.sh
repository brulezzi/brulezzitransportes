#!/bin/bash
cd /var/www/motoboy-campinas-24h
git fetch origin
git reset --hard origin/main
echo "Deploy concluido em $(date)" >> /var/log/motoboy-campinas-deploy.log
