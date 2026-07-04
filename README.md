# Sistema de Sorteio

Aplicacao simples para cadastro publico de participantes e sorteio interno.

## Funcionalidades

- Landing page publica para cadastro de nome, email e WhatsApp.
- Mascara de WhatsApp com DDD.
- Bloqueio de cadastro duplicado por email ou telefone.
- Tela interna de sorteio em `/admin`.
- Opcao para incluir ou excluir pessoas que ja foram sorteadas.
- Historico de sorteios em `/admin/historico`.
- Listagem de leads em `/admin/leads`, paginada de 20 em 20.
- Banco MySQL.

## Tecnologias

- Next.js
- React
- Tailwind CSS
- MySQL
- mysql2
- pnpm

## Como rodar

Copie o arquivo de exemplo de variaveis de ambiente:

```bash
cp .env.example .env.local
```

Preencha as credenciais MySQL no `.env.local`:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=sorteador
```

Instale as dependencias:

```bash
pnpm install
```

Rode o servidor de desenvolvimento:

```bash
pnpm dev
```

Acesse:

```text
http://localhost:3000
```

## Rotas

- `/`: pagina publica de cadastro.
- `/admin`: tela para realizar sorteios.
- `/admin/leads`: listagem de participantes cadastrados.
- `/admin/historico`: historico de sorteios realizados.

## Banco de dados

O projeto usa MySQL. O banco informado em `MYSQL_DATABASE` precisa existir antes de iniciar a aplicacao.

As tabelas `participants` e `draws` sao criadas automaticamente quando a aplicacao acessa o banco pela primeira vez.

Em deploy na Vercel, cadastre as mesmas variaveis de ambiente nas configuracoes do projeto.

## Comandos uteis

Rodar lint:

```bash
pnpm lint
```

Gerar build de producao:

```bash
pnpm build
```

Iniciar build de producao:

```bash
pnpm start
```

## Observacao

Nao commite arquivos `.env`. Use o `.env.example` apenas como modelo.
