---
name: deploy-brulezzi
description: Use this skill whenever editing files in the Brulezzi Transportes website project (C:\Users\Acer\Projetos\motoboy-campinas-24h, live at motoboycampinas24h.com) and whenever the user asks to "atualizar o site da Brulezzi", "subir uma mudança pro site", "fazer deploy", or reports "o site não atualizou" / "mudei mas não aparece". Covers the correct edit → validate → commit → push workflow and the exact troubleshooting steps for when the automatic deploy doesn't reflect on the live site.
---

# Deploy do site Brulezzi Transportes

## Por que isso importa

O deploy é automático (push no GitHub → webhook → VPS atualiza sozinha), mas esse pipeline já quebrou de formas sutis antes (arquivo sem permissão de execução, token errado, cache de navegador). Este documento existe pra você não precisar redescobrir a causa toda vez — siga o fluxo normal primeiro, e só entre no troubleshooting se o site realmente não atualizar depois de alguns minutos.

## Arquitetura (resumo)

```
git push (branch main)
  → GitHub Actions dispara webhook
  → VPS 187.127.1.204:9000/hooks/deploy-motoboy-campinas recebe
  → roda /var/www/motoboy-campinas-24h/deploy.sh na VPS
  → deploy.sh faz git fetch + git reset --hard origin/main
  → nginx serve os arquivos atualizados na porta interna 8094
  → Traefik roteia o domínio público pra essa porta, com SSL automático
```

Repositório: `github.com/brulezzi/brulezzitransportes` (branch `main`).
Pasta de trabalho local: `C:\Users\Acer\Projetos\motoboy-campinas-24h` — **nunca trabalhe numa cópia dentro do OneDrive** (Desktop/Documentos/Imagens sincronizados corrompem o `.git`; já aconteceu duas vezes neste projeto).

## Fluxo normal

1. Editar os arquivos necessários dentro de `C:\Users\Acer\Projetos\motoboy-campinas-24h`
2. **Validar antes de commitar** — rode isto pra pegar erro de JSON-LD (schema.org) ou estrutura HTML quebrada antes de subir pro ar:
   ```bash
   cd "C:/Users/Acer/Projetos/motoboy-campinas-24h" && node -e "
   const fs = require('fs');
   const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
   // ajuste a lista de arquivos conforme o que você mexeu, ex: ['index.html', 'motoboy-24h/index.html']
   ['index.html'].forEach(f => {
     const html = fs.readFileSync(f, 'utf8');
     const matches = [...html.matchAll(/<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/g)];
     matches.forEach((m) => JSON.parse(m[1]));
     console.log(f, 'JSON-LD ok');
   });
   "
   ```
3. Commit e push:
   ```bash
   cd "C:/Users/Acer/Projetos/motoboy-campinas-24h"
   git add -A
   git commit -m "descrição clara da mudança"
   git push
   ```
4. O site atualiza sozinho em segundos. Normalmente não precisa mexer na VPS nem rodar nada manual.

## Se o site não parecer ter atualizado

Antes de desconfiar do pipeline, elimine a causa mais comum: **cache do navegador**. Testa em aba anônima (Ctrl+Shift+N) ou força recarregar (Ctrl+Shift+R) antes de investigar mais fundo.

Se ainda assim não bateu, peça pro usuário rodar isso na VPS (terminal web da Hostinger):

```bash
cd /var/www/motoboy-campinas-24h
git log -1 --oneline
cat /var/log/motoboy-campinas-deploy.log
```

- Se o `git log` já mostra o commit mais recente → o deploy funcionou, é só cache local do navegador.
- Se o commit está desatualizado → o webhook não disparou ou falhou. Teste manualmente (o token está documentado em `PROJETO-SITE-BRULEZZI.md`, seção 4.1, na pasta de documentação `C:\Users\Acer\OneDrive\Desktop\brulezzi transportes\`):
  ```bash
  curl -f -s -X POST http://187.127.1.204:9000/hooks/deploy-motoboy-campinas \
    -H "X-Deploy-Token: <token — ver documentação>" \
    --max-time 30 -w "\nHTTP_STATUS:%{http_code}\n"
  ```
  Se retornar `200` mas o `git log` na VPS continuar sem avançar, o problema mais provável (já aconteceu antes) é o `deploy.sh` ter perdido a permissão de execução. Verifique com `ls -la /var/www/motoboy-campinas-24h/deploy.sh` (precisa mostrar `-rwxr-xr-x`, com o `x`). Se não tiver, rode `chmod +x` na VPS **e também** rastreie a permissão certa dentro do próprio Git localmente pra não quebrar de novo:
  ```bash
  cd "C:/Users/Acer/Projetos/motoboy-campinas-24h"
  git update-index --chmod=+x deploy.sh
  git commit -m "Corrige permissao de execucao do deploy.sh"
  git push
  ```

## Não confunda com os outros projetos na mesma VPS

A mesma VPS (187.127.1.204) hospeda outros sites (debby-hub, crm-debby) com seus próprios hooks no `/etc/webhook/hooks.json`. **Nunca edite ou remova os hooks `deploy-debby-hub` ou `deploy-crm`** ao mexer no hook da Brulezzi — sempre confira o arquivo inteiro antes de reescrevê-lo, e mantenha os três hooks juntos no mesmo JSON.
