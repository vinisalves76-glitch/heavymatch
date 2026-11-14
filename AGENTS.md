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
- api/: APIs de veículos, usuários e api/auth/profile.js, que cria perfil buyer ausente após validar JWT.
- supabase-integration.js também contém os modos de login, cadastro, recuperação de senha por e-mail e atualização de senha.

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

## Recuperação de senha e acesso
- O fluxo correto é login normal, Esqueci minha senha (envia e-mail) e link validado pelo Supabase para cadastrar nova senha.
- Preservar os modos 'login', 'signup', 'recover', 'reset' e apenas um botão de recuperação, com confirmação obrigatória da nova senha.
- Nunca gravar ou solicitar senha no backend próprio, logs, GitHub ou banco de perfis.
- Não elevar role via metadata editável do usuário; a API cria somente buyer quando o perfil não existe e preserva papéis anteriores.
- O domínio de Preview precisa constar na lista de URLs de redirecionamento permitidas no Supabase Auth antes de validar o e-mail de recuperação.
- Não executar mudanças de RLS nem alterar usuários/credenciais em produção sem autorização explícita do responsável.

## Módulo de anúncios vendedor/ADM (branch feat/seller-admin-listings-20261114)
- Leia o README (seção gestão de anúncios) antes de editar.
- `equipment-marketplace.js`: fluxo de anúncios, fotos, contatos, edição e status. NÃO criar outro formulário duplicado.
- `api/vehicles.js`: autoridade no servidor para GET/POST de anúncios, propriedade e WhatsApp.
- `api/vehicles/photo-token.js`: gera token de upload exclusivo por sessão e valida role seller/admin usando JWT autenticado.
- `api/admin/users.js`: cadastro de vendedor com WhatsApp obrigatório.
- `docs/seller-admin-storage-security.sql`: políticas de segurança aplicadas e verificadas no Supabase em 14/11/2026; o SQL está registrado para auditoria e não deve ser reexecutado automaticamente.
- O comprador NUNCA deve ter acesso de criação, edição, remoção ou upload. Vendedor gerencia somente os próprios; ADM gerencia todos.
- Nunca confiar em role do navegador nem em user_metadata para autorização; conferir profiles.role no servidor, com políticas RLS corretas.
- Antes de promover novas alterações, valide os fluxos autenticados reais e confirme que o endurecimento do banco continua ativo.
- Preserve fotos e anúncios existentes; uploads devem manter as imagens atuais a menos que o responsável solicite exclusão.
- Rodar `node --test tests/*.test.mjs` e inspeções de segurança de foto/contato no GitHub Actions, validar deployment Preview.
