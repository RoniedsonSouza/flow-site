# Projeto Flow

Site do Projeto Flow (método METABOLIC): páginas públicas, cardápio com carrinho e pedido pelo WhatsApp ou Instagram, e painel para cadastrar produtos. A API é Node.js/Express com PostgreSQL no schema `flow`.

## Funcionalidades

- Páginas Início, Sobre e Contato
- Cardápio com categorias, preços e imagens
- Carrinho no navegador e envio do pedido por WhatsApp ou Instagram
- Painel admin com login e cadastro de produtos
- API REST (leitura pública, escrita com JWT) e migração do catálogo

## Stack

Node.js, Express, PostgreSQL (`pg`), JWT (`jsonwebtoken`), bcryptjs e HTML/CSS/JS (Tailwind e Lucide via CDN).

## Como rodar

É preciso ter Node.js, npm e PostgreSQL. Copie `.env.example` para `.env` e preencha os valores só na sua máquina. Não commite o `.env`.

```bash
cp .env.example .env
npm install
npm run migrate
npm start
```

Abra http://localhost:3000 (admin em `/admin.html`). `npm run dev` recarrega o servidor com nodemon.
