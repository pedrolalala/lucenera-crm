# Supabase — CRM Lucenera

Este projeto é um módulo do ecossistema Lucenera.

O ecossistema usa um Supabase compartilhado entre vários sistemas: Cadastro, Orçamentos, Administração Bancária, CRM, Logística, RH, Catálogo/Produtos, Hub/TI e futuramente Estoque/Compras.

Esta pasta existe para dar contexto local sobre o banco quando este projeto estiver aberto sozinho. Ela não tenta reproduzir o banco inteiro; guarda apenas o recorte necessário para trabalhar no CRM sem perder a relação com o ecossistema maior.

## Documentos locais

Leia nesta ordem:

1. `ECOSSISTEMA_LUCENERA.md` — visão geral do ecossistema e decisões comuns.
2. `AI_DB_CONTEXT.md` — recorte de banco e regras deste sistema.
3. `DB_CHANGE_REQUEST_TEMPLATE.md` — modelo para documentar necessidade de mudança estrutural de banco.

## Responsabilidade deste sistema

O CRM acompanha pipeline, timeline, status, responsáveis, etapas e evolução de projetos/orçamentos.

As etapas, sub-status, checklists, regras de bloqueio, paralelismo, sequência e SLA devem ser configuráveis pela interface.

## Como trabalhar com banco neste projeto

Use as tabelas, views e funções já existentes descritas em `AI_DB_CONTEXT.md`.

Se a demanda exigir uma tabela, coluna, função, view, trigger, policy, bucket ou migration que não existe, registre a necessidade usando `DB_CHANGE_REQUEST_TEMPLATE.md`.

Não invente nomes de colunas/tabelas no código para “fazer funcionar”. Primeiro registre a pendência de banco com o motivo de negócio.

