---
name: nova-pagina-servico-brulezzi
description: Use this skill when creating a new service, segment, or B2B landing page for the Brulezzi Transportes website (motoboycampinas24h.com) — for example a new page about a specific vehicle type, industry vertical, or delivery use case. Also use it before writing any new SEO copy or choosing keywords for this site, since it contains the mandatory B2B-only content rule. Trigger for requests like "cria uma página nova pra [serviço]", "precisamos de conteúdo sobre [X]", "adiciona [algo] no site", or "quais palavras-chave usar pra essa página nova".
---

# Criar nova página de serviço — Brulezzi Transportes

## Regra obrigatória antes de qualquer palavra-chave ou título

Todo conteúdo novo deste site é **estritamente B2B**. Antes de escrever qualquer título, H1 ou escolher qualquer palavra-chave, verifique contra isso (decisão do Kauê em 2026-07-17, detalhada em `BRAND-SYSTEM.md` na pasta `C:\Users\Acer\OneDrive\Desktop\brulezzi transportes\`):

- ✅ Foco: empresa de qualquer porte (pessoa jurídica), nunca importa o tamanho
- ❌ Nunca usar termo que atrai gente procurando **emprego** (ex: "motoboy campinas" sozinho, sem qualificador, traz vaga — sempre qualificar com "empresa", "contratar", "24h", "serviço")
- ❌ Nunca se posicionar perto de **mototáxi** (transporte de passageiro), **app de motoboy tipo iFood/Rappi**, **entrega de comida** ou **entrega de flores** — isso atrai o público errado e dilui o posicionamento B2B
- ❌ Evitar atrair **pessoa física curiosa** buscando uma corrida avulsa isolada, sem repetição

Se uma ideia de página ou palavra-chave cair em qualquer um desses casos, não crie a página — proponha uma alternativa qualificada ou descarte.

## Estrutura da página (siga o padrão das 6 páginas existentes)

Páginas de referência já no ar: `/motoboy-24h/`, `/veiculo-utilitario/`, `/transporte-cargas-medicas/`, `/logistica-ecommerce/`, `/malote-cartorio/`, `/motoboy-para-empresas/`. Leia uma delas (ex: `motoboy-24h/index.html`) como modelo real antes de criar a nova — é mais confiável que reconstruir de memória.

### 1. Criar a pasta e o `index.html`
```
C:\Users\Acer\Projetos\motoboy-campinas-24h\<nome-da-pagina>\index.html
```
Nome da pasta: minúsculo, com hífen, descritivo (ex: `entrega-industrial`, não `pagina-nova`).

### 2. `<head>` — obrigatório incluir:
- `<title>` com palavra-chave qualificada + Campinas + São Paulo (ex: "Entrega Industrial em Campinas e São Paulo | Brulezzi Transportes")
- `<meta name="description">` — específica, sem clichê tipo "solução completa"/"excelência"
- `<link rel="canonical" href="https://motoboycampinas24h.com/<pasta>/">`
- Open Graph (`og:title`, `og:description`, `og:image`, `og:type`, `og:url`)
- Schema.org: bloco `@graph` com `Service` (serviceType, provider, areaServed, description) **e** `FAQPage` (3-4 perguntas reais que um cliente empresarial faria)
- Snippet do GA4 (copie exatamente de uma página existente — `G-CENYXB4MYP`)

### 3. Corpo — mesma estrutura de sempre
- Header com nav padrão + botão WhatsApp
- `<article>` com eyebrow, H1 (contendo Campinas **e** São Paulo — nunca só uma cidade isolada, pra não afastar cliente de outras regiões), parágrafo de abertura, 2-3 `<h2>` com o conteúdo real (pra quem é, como funciona, diferenciais), seção de FAQ visível (`<p><strong>pergunta</strong><br>resposta</p>`) espelhando o schema FAQPage
- Footer padrão
- Botões de WhatsApp: **sempre com mensagem pré-preenchida específica da página** (não reaproveite o texto genérico) — isso é o que permite saber de qual página veio cada lead. Formato: `https://wa.me/5519992445953?text=Ol%C3%A1%2C%20vim%20pela%20p%C3%A1gina%20de%20<contexto>%20e%20...`
- Barra fixa mobile + botão flutuante de WhatsApp (copie do padrão existente)

### 4. Depois de criar, três passos obrigatórios:
1. **Adicionar no `sitemap.xml`** (raiz do projeto) com `<priority>0.9</priority>`
2. **Linkar a partir da home** — se a página corresponde a um card existente na seção "Serviços" (`index.html`), atualize o `href` desse card pra apontar pra nova página em vez de ir direto pro WhatsApp
3. **Validar antes de subir** — rode a validação de JSON-LD (ver skill `deploy-brulezzi`) pra garantir que o schema não está quebrado

### 5. Commit e deploy
Use o fluxo padrão da skill `deploy-brulezzi` (mensagem de commit descritiva, push, deploy é automático).

## Pesquisa de palavra-chave antes de escrever

Não invente termo — confirme com dado real antes de escrever o H1 final:
1. Digite o termo candidato no Google e veja o autocomplete e "As pessoas também perguntam"
2. Se aparecer vaga de emprego, currículo ou OLX de vaga nos primeiros resultados, **esse termo puro não serve** — precisa de qualificador (ver regra B2B acima)
3. Depois que a página estiver no ar há alguns dias, o Google Search Console (`search.google.com/search-console`, propriedade `motoboycampinas24h.com`, menu Desempenho) mostra quais buscas reais estão trazendo gente — use isso pra decidir a próxima página, não só suposição
