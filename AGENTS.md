# AGENTS.md — leitura obrigatória antes de editar o HeavyMatch

## Identidade e objetivo
HeavyMatch é um marketplace mobile-first de caminhões, carretas e máquinas pesadas.
O fluxo principal é visualizar anúncios em cartões, curtir/salvar ou pular e contatar o vendedor por WhatsApp.
A área de **perfil de comprador** é um recurso de testes desenvolvido na branch feature/buyer-profile-marketplace.

## Regras inegociáveis
1. Leia este arquivo e o README.md antes de qualquer alteração.
2. Nunca desenvolva na main ou modifique produção sem autorização explícita do responsável.
3. Sempre use branch separada, Preview Vercel, testes e verificação de regressão.
4. Não promova deployments nem execute migrações no banco compartilhado sem aprovação específica.
5. Preserve as posições e ações: **X esquerdo = pular, coração direito = curtir; gesto esquerda pula, gesto direita curte**.
6. Preserve fotos, galeria por toque, filtros, favoritos, login, cadastro de veículos, perfis buyer/seller/admin, WhatsApp do vendedor e permissões.
7. Não exponha tokens, chaves Supabase service role, segredos ou dados de contas.
8. Não remova anúncios ou dados reais de teste sem confirmação.
9. Não introduza menus duplicados nem controles decorativos sem função real.
10. Não declare um fluxo como aprovado em navegador se apenas inspecionou código ou CI.

## Arquitetura desta branch
- index.html: página principal, CSS legado e scripts clássicos.
- supabase-integration.js: login/cadastro, gestão ADM e cliente Supabase compartilhado (window.hmSupabaseClient).
- equipment-marketplace.js: gestão e cadastro de equipamentos.
- buyer-profile-model.js: schema e sanitização dos 66 campos de perfil de comprador.
- buyer-profile.js: UI de bio, compras, financiamento, troca e preferências.
- styles/buyer-profile.css: estilos desktop/mobile da nova área.
- tests/buyer-profile.test.mjs: contratos, regressão e validações.
- api/: APIs legadas de veículos e usuários.

## Perfil de comprador e dados
O perfil usa a sessão existente do Supabase e salva metadados pessoais em
hm_buyer_profile_v1 na conta autenticada, através de auth.updateUser. Nada é exposto publicamente.
O aceite de contato comercial e sugestões é opcional e desmarcado por padrão.
Não utilizar user_metadata para permissão de buyer/seller/admin.
Não inventar comportamento de matching, notificação ou painel comercial: ainda não existem.
Não criar triggers, tabelas nem políticas RLS diretamente no projeto Supabase compartilhado sem autorização.

## Processo de QA
1. Verifique syntax node --check para os dois scripts novos.
2. Execute node --test tests/*.test.mjs e revise resultado no GitHub Actions.
3. Confirme a branch/commit do deploy Preview antes de enviar o link.
4. Teste perfil anônimo, perfil autenticado, preenchimento parcial, troca Sim/Não,
   persistência após fechar e reabrir, e saída da conta.
5. Valide também ambos os gestos e botões, fotos, filtros, contatos e login.
6. Aguarde aprovação do usuário antes de publicar produção.
