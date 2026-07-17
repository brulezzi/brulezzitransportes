# CLAUDE.md — Site Brulezzi Transportes

> Arquivo de contexto permanente, carregado automaticamente ao abrir uma conversa nesta pasta.
> Documentação completa (com dados sensíveis) fica em `C:\Users\Acer\OneDrive\Desktop\brulezzi transportes\` — leia `PROJETO-SITE-BRULEZZI.md` lá se precisar de detalhe técnico ou de credenciais.

---

## O que é este projeto

Site institucional/comercial da **Brulezzi Transportes** (motoboy, utilitário e caminhão — Campinas e todo o estado de São Paulo), no ar em **motoboycampinas24h.com**. Código estático (HTML/CSS/JS puro, sem framework), deploy automático via GitHub → webhook → VPS.

Este projeto é **independente** do "SaaS VC 2.0" / CRM Debby — não misturar, não mover código pra lá.

---

## Regra estratégica fixa: conteúdo é SEMPRE B2B

Antes de escrever qualquer palavra-chave, título ou página nova:

- Foco: empresa de qualquer porte (pessoa jurídica) — nunca pessoa física curiosa de corrida avulsa isolada
- Nunca usar termo que atraia gente procurando **emprego** de motoboy (sempre qualificar: "empresa", "contratar", "24h")
- Nunca se posicionar perto de **mototáxi**, **app tipo iFood/Rappi**, **entrega de comida** ou **entrega de flores**

Detalhe completo em `BRAND-SYSTEM.md` (pasta de documentação no OneDrive).

## Skills disponíveis nesta pasta

- **`deploy-brulezzi`** — fluxo de editar → validar → commit → push, e troubleshooting se o deploy não refletir
- **`nova-pagina-servico-brulezzi`** — como criar página nova de serviço seguindo o padrão do site

## Estrutura do site

| Página | URL |
|---|---|
| Home | `/` |
| Motoboy 24h | `/motoboy-24h/` |
| Veículo Utilitário | `/veiculo-utilitario/` |
| Cargas Médicas/Laboratoriais | `/transporte-cargas-medicas/` |
| Logística E-commerce | `/logistica-ecommerce/` |
| Malote e Cartório | `/malote-cartorio/` |
| Motoboy para Empresas (B2B) | `/motoboy-para-empresas/` |
| Blog (3 posts) | `/blog/` |

## Infraestrutura (resumo — detalhe completo na documentação externa)

- GitHub: `github.com/brulezzi/brulezzitransportes` (branch `main`, **repositório público** — nunca commitar token/senha aqui)
- VPS: `187.127.1.204`, deploy via webhook na porta 9000
- Analytics: GA4 `G-CENYXB4MYP`, Search Console verificado e vinculado
- Google Meu Negócio: perfil novo aprovado (perfil antigo de 2022 ficou suspenso, abandonado — não usar)

## Dados do negócio

| Campo | Valor |
|---|---|
| CNPJ | 40.767.846/0001-76 |
| WhatsApp | (19) 99244-5953 |
| E-mail público | brulezzitransportes00@gmail.com |
| Endereço | Avenida Andrade Neves, 365 - Centro, Campinas - SP |
| Cobertura | Campinas, Americana, Rio Claro, Jundiaí, São Paulo + região metropolitana e interior |

## Pendências importantes (ver Cockpit completo pra detalhe)

- Perfil duplicado "Motoboy Campinas" (168 avaliações, mesmo endereço, telefone de terceiro) — não resolvido
- Google Ads ainda não configurado
- Conferir logo "Altecs" na seção de clientes (pode estar cortado)

---

> Última atualização: 2026-07-17
