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

## Variáveis de ambiente

Defina no `.env` (ou no painel do provedor). O arquivo `.env` fica de fora do git.

| Variável | Uso |
| --- | --- |
| `PORT` | Porta HTTP. Padrão `3000`. |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Conexão PostgreSQL. A senha não tem padrão no código. |
| `DB_SSL` | `true` em banco gerenciado. |
| `DB_SCHEMA` | Schema. Padrão `flow`. |
| `JWT_SECRET` | Segredo que assina o token do admin. Obrigatório para login. Gere com `openssl rand -hex 32`. |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Usuário criado por `npm run migrate`. A senha é obrigatória; sem ela a migração para. |
| `CORS_ORIGIN` | Origem permitida no navegador. |
| `GOOGLE_MAPS_API_KEY` | Opcional. |

Não grave host, usuário, senha, connection string nem chave de API no repositório.
