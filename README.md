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
- Banco local SQLite.

## Tecnologias

- Next.js
- React
- Tailwind CSS
- SQLite nativo do Node (`node:sqlite`)
- pnpm

## Como rodar

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

O banco SQLite fica em:

```text
data/sorteador.sqlite
```

As tabelas sao criadas automaticamente quando a aplicacao acessa o banco pela primeira vez.

Arquivos SQLite locais ficam ignorados no Git pelo `.gitignore`.

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

Este projeto usa `node:sqlite`, que no Node 24 ainda emite aviso de recurso experimental. O aviso nao impede o funcionamento da aplicacao.
