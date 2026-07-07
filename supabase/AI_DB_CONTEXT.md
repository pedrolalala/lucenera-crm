# AI DB Context — CRM Lucenera

Este sistema é um módulo do ecossistema Lucenera e usa um Supabase compartilhado.

Este arquivo resume o recorte de banco necessário para trabalhar no CRM sem depender de documentação externa.

Se uma demanda exigir estrutura de banco que não aparece neste contexto, documente a necessidade em `DB_CHANGE_REQUEST_TEMPLATE.md` antes de alterar código que dependa dela.

## Papel do sistema

Sistema para acompanhar pipeline, timeline, status, responsáveis e evolução de projetos/orçamentos.

## Objetos reais relevantes no Supabase

Principais tabelas/views identificadas no schema real:

- `projetos`
- `orcamentos`
- `historico_status_orcamento`
- `projeto_itens`
- `projeto_parcelas`
- `vw_projetos_pipeline`
- `vw_projetos_por_status`
- `vw_projetos_status_enum`
- `vw_projetos_dashboard`
- `vw_dashboard_crm_fechamento`
- `vw_projetos_resumo`
- `vw_projetos_sem_responsavel`

## Decisões de negócio

- Etapas do CRM devem ser configuráveis pela UI.
- Sub-status devem ser configuráveis pela UI.
- Checklists devem ser configuráveis pela UI.
- Bloqueios, paralelismo, sequência, responsáveis e SLA devem ser configuráveis.
- Algumas configurações podem ser editáveis caso a caso.
- Não hardcodar regras fixas por nome de etapa.

## Situação atual importante

O schema real contém views e status de projeto/orçamento, mas o modelo completo de configuração de etapas, sub-status, checklists, bloqueios e SLA pode ainda não estar implementado como tabelas dedicadas.

Se a feature exigir esse modelo configurável e as tabelas não existirem, registre pendência de DB. Não crie a estrutura pelo Skip/Lovable.

## Como agir ao codar

- Use views existentes para dashboard/pipeline.
- Evite `switch/case` fixo por etapa/status.
- Se precisar simular configuração, faça apenas na UI com dados existentes ou mocks claramente temporários.
- Se a demanda exigir alteração estrutural de banco, preencha `DB_CHANGE_REQUEST_TEMPLATE.md`.

## SPEC-007 — SSO entre sistemas

- Este app é origem ao abrir Orçamentos pelo botão `Gerar Orçamento` e destino quando o Hub abre CRM.
- Usar `src/lib/cross-system-auth.ts`.
- A migration `20260708_030_spec007_sso_cross_system` e as Edge Functions `generate-cross-system-code`/`exchange-cross-system-code` estão publicadas no Supabase remoto desde 2026-07-07; falta homologação com usuário real.
- Como origem, chamar `redirectWithCode('https://gestaofinanceiralucenera.goskip.app', '/budgets/new?projeto_id=...', 'orcamentos')`.
- Como destino, `AuthProvider` chama `consumeCodeFromUrl('crm')`.
- O login próprio do CRM ainda existe, mas não deve bloquear a hidratação de sessão recebida por `sso_code`.
