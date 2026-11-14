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


## Classificação de equipamentos rodoviários — Preview 14/11/2026
- **Caminhão** e **Cavalo mecânico** são categorias distintas; o formulário oferece configurações 4x2, 6x2, 6x4, 8x2, 8x4, 10x4 e Outra.
- **Carreta / implemento** não é caminhão ou cavalo mecânico. Oferecer tipos de implemento: Prancha, Basculante, Graneleira, Baú, Sider, Tanque, Frigorífica, Porta-contêiner, Florestal e outros.
- `listing-categories.js` contém as funções de composição, leitura e filtro. Reutilizar este módulo, sem criar taxonomias divergentes.
- A categoria e sua configuração são armazenadas em `vehicles.category` (ex.: `Cavalo mecânico 6x4`), sem alteração do schema.
- Preservar anúncios anteriores `Carreta` como pertencentes à categoria `Carreta / implemento`; preservar também os perfis de compradores antigos.
- Testar `tests/listing-categories.test.mjs` junto aos testes de anúncios e preço.
- Não publicar nem alterar Supabase até aprovação da Preview.


## Identidade CatiraMatch e preço na bio — Preview 14/11/2026
- O app está sendo renomeado **CatiraMatch** (antigo HeavyMatch), mantendo a mesma infraestrutura do projeto `machinematch` até mudança explícita de domínio/projeto.
- Referência visual fornecida pelo responsável: marca original de **duas setas opostas** em vermelho e carvão e wordmark CatiraMatch. Os arquivos otimizados originados dos anexos estão em `assets/catiramatch-logo.png` e `assets/catiramatch-icon.png`.
- Paleta oficial: vermelho `#E32227`, carvão `#181818`, branco `#FFFFFF` e cinza-claro `#F3F3F3`. Aplicação centralizada em `styles/catiramatch-theme.css` e nos estilos de componentes legados.
- Slogan: **Seu próximo negócio começa aqui.** Preservar **Pra você** como orientação de navegação no mobile; não duplicar menus.
- O preço é armazenado **apenas** no campo numérico `vehicles.price` com flag `price_on_request`. A seção pública **Bio do equipamento** deve exibir o preço formatado (ou Sob consulta) junto à descrição técnica, sem copiar preço para `vehicles.description`.
- CatiraMatch não muda roles, sessão, tabelas, URL de produção, policies RLS nem a lógica de swipe sem autorização específica.
- Atualizar nome, paleta e logo sempre em todas as telas (login, perfil, tour, anúncio e área ADM) e validar em Preview antes da publicação.


## Correção do cabeçalho CatiraMatch — 14/11/2026
- Nunca colocar a logo dentro de cartão retangular branco, com padding, borda arredondada ou sombra.
- No cabeçalho carvão usar `assets/catiramatch-logo-header.png`: PNG **transparente**, lettering branco, seta superior branca e inferior vermelha, produzido a partir da marca oficial fornecida.
- `assets/catiramatch-logo.png` permanece disponível para superfícies claras (por exemplo, login). Não aplicar filtros que tornem o lettering invisível.
- O estilo `.brand .brand-logo` em `styles/catiramatch-theme.css` deve manter `background:transparent`, `padding:0`, `border:0` e `box-shadow:none` tanto no desktop quanto no mobile.
- Validar o recorte/legibilidade do PNG e executar os testes antes da publicação; não alterar produção sem aprovação.


## Swipe CatiraMatch — correção de pointer (Preview 14/11/2026)
- A regra é mandatória: **arrastar dedo para a direita curte/salva**; **arrastar para a esquerda passa sem salvar**. Botão X à esquerda = passar; coração à direita = curtir.
- Use os testes de eventos reais simulados em `tests/swipe-direction-real-events.test.mjs` e mantenha mapeamento, movimento visual, selos e botões sempre coerentes.
- O gesto deve funcionar mesmo que o dedo saia da área da foto antes do `pointerup`; por isso o listener de término fica no documento. Não use `setPointerCapture` na foto se isso afetar a galeria.
- Gestos verticais, cliques curtos e pointer cancelados não devem gerar curtidas ou passar anúncios.
- Não publicar em produção sem autorização explícita e verificação da Preview.


## Correção da sobreposição no cabeçalho mobile — 14/11/2026
- A logo CatiraMatch deve permanecer visível e sem quadrado branco no celular.
- O cabeçalho mobile em `styles/catiramatch-theme.css` usa duas linhas: marca + `Pra você` na primeira; ações Entrar/Conta, filtros, favoritos, Sair e Ajuda na segunda.
- Não recolocar botões dentro da mesma linha da logo. O controle Ajuda fica compacto com ícone `?` no celular, mas seu click handler e nome acessível permanecem.
- Preservar a nav inferior, perfis e swipe. Rodar `tests/mobile-header-no-overlap.test.mjs` e todos os testes; publicar apenas após validação.


## Descoberta imersiva CatiraMatch — Preview 14/11/2026
- Prioridade mobile: **a foto do equipamento é o elemento principal**, usando altura disponível de viewport, preservando fotos horizontais por inteiro e mantendo o gesto de swipe direito=curtir, esquerdo=passar.
- Não recolocar cabeçalho de duas linhas, menus duplicados, CTA pesado nem uma barra adicional abaixo da foto.
- Barra inferior visível com apenas 4 destinos: Descobrir, Buscar, Salvos, Conta. Contato WhatsApp e detalhes no cartão; Entrar/Conta, vendedor, ADM, Ajuda e Sair no painel `mobile-discovery.js` com suas permissões.
- Aplicação modular: estilos exclusivos do celular em `styles/mobile-discovery.css` (carregado por último); controlador de Conta em `mobile-discovery.js`. Não alterar layout desktop nem código de backend para um ajuste puramente visual.
- `#sellerNav` e `#hmAdminNav` mantêm seus listeners e guardas; o menu Conta aciona esses controles após verificar autorização. Não criar opção pública de cadastrar anúncio.
- Preservar foto alternável ao toque; atualizar primeiro plano E fundo desfocado em `changeEquipmentPhoto`. Nenhuma foto deve ser excluída para melhorar a vitrine.
- Testar `tests/immersive-discovery.test.mjs`, `tests/mobile-header-no-overlap.test.mjs`, swipe, perfil, login, anúncios e tour.
- Apenas Preview e PR #15; produção só depois de aprovação.
