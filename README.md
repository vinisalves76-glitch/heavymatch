# Catira.com

**Marca atual (27/11/2026): Catira.com.** Antigo CatiraMatch/HeavyMatch. Mantemos o repositório técnico `heavymatch`, o projeto Vercel `machinematch` e os caminhos dos assets para evitar regressões. O cabeçalho e login exibem o ícone de setas da marca original com wordmark Catira.com; não usar PNGs antigos com o nome CatiraMatch nas telas atuais.

## Histórico de alterações da marca

O conteúdo abaixo documenta decisões históricas; onde aparecer CatiraMatch, entenda como marca anterior.

Marketplace digital com experiência mobile de descoberta de caminhões, carretas e máquinas pesadas.

## Estrutura atual
- Interface principal em `index.html`.
- Comportamentos de anúncios/equipamentos em `equipment-marketplace.js`.
- Integração com Supabase em `supabase-integration.js`.
- APIs da aplicação em `api/config.js`, `api/vehicles.js` e `api/admin/users.js`.
- Tour guiado em `guided-tour.js`.
- Dependência `@supabase/supabase-js` declarada em `package.json`.

A presença desses arquivos representa a estrutura implementada no repositório; fluxos como login, permissões, upload de fotos e gestão de anúncios precisam ser validados na preview com as configurações reais do Supabase antes de serem considerados testados.

## Fluxo de trabalho acordado
1. Desenvolver novas funcionalidades na branch `feature/mobile-first-marketplace` ou em outra branch de trabalho.
2. Publicar uma Preview do Vercel e testar antes de produção.
3. Corrigir os problemas encontrados e apresentar a versão para aprovação.
4. Quando houver autorização explícita para colocar em produção, sincronizar/mesclar a versão aprovada em `main` primeiro.
5. Publicar em produção a versão correspondente à `main` e verificar o resultado do deploy.

A `main` deve refletir a última versão aprovada para produção. Não publicar em produção sem autorização explícita.

## Configuração e segurança
- Configure `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` nos ambientes adequados do Vercel.
- A chave `SUPABASE_SERVICE_ROLE_KEY` é secreta e nunca deve ser enviada ao navegador.
- Verifique no Supabase a existência das tabelas e do bucket usados pela aplicação, além das políticas de acesso.
- O catálogo ainda pode conter anúncios/imagens demonstrativos; confirme os dados antes de uso comercial.
- Configure qualquer contato comercial/WhatsApp real antes de divulgar o site.


## Preview — Perfil de comprador / busca de equipamentos

Implementação aditiva para testar **somente na branch feature/buyer-profile-marketplace**.
A versão publicada em main não é alterada até aprovação explícita.

### Como usar
1. Acesse a Preview, faça login ou cadastre uma conta.
2. No celular, toque em **Perfil** na navegação inferior. No desktop, use **Minha busca**.
3. Complete as cinco guias: Sobre você, O que procura, Orçamento e compra, Veículo para troca, Preferências.
4. Selecione **Salvar perfil**, feche e abra novamente para verificar os dados persistidos.
5. Teste sem login: o perfil deve mostrar o botão Entrar ou fazer cadastro.

### Campos
O questionário contém 66 campos opcionais e uma barra de progresso:
- Comprador/empresa, cidade, UF, atividade, frota e bio;
- Categorias, marcas, modelos, ano, eixos, km, horímetro, potência, região, quantidade;
- Orçamento, à vista, financiamento, consórcio, entrada, prazos, nota fiscal e transporte;
- Troca: categoria, marca, modelo, ano, preço, km, horas, financiamento, saldo devedor, condição e descrição;
- Preferências de contato, aceite de contato comercial e recomendações futuras.

### Persistência e privacidade
- Nesta etapa **não há nova tabela ou migração no banco de produção**.
- Dados salvos no objeto de metadados da própria conta Supabase Auth (chave hm_buyer_profile_v1), via auth.updateUser.
- O editor reutiliza o cliente Supabase autenticado, sem chaves administrativas no navegador.
- A bio não é pública nem aparece nos anúncios ou no painel ADM.
- Metadados do comprador **não** são usados para autorizar vendedores ou administradores.
- Os dois aceites comerciais ficam desmarcados por padrão e não ativam mensagens ou notificações.
- Não solicitar CPF, senhas bancárias, contas ou documentos financeiros.

### Evolução futura
Para painel comercial, busca por compradores e matching automático, criar tabela específica
com RLS e políticas de acesso, após validação de uma migração isolada.
Fotos do veículo de troca exigirão storage e políticas específicas; ainda não implementadas.

### Validação
- node --test tests/*.test.mjs
- node --check buyer-profile-model.js
- node --check buyer-profile.js
- Testar no celular: login, salvar, sair, entrar de novo, trocar de abas, habilitar e desabilitar troca.
- Confirmar regressão de swipe, filtros, fotos, cadastro e WhatsApp.

## Correção de login e recuperação — Preview

- O login existente continua usando e-mail e senha pelo Supabase Auth.
- A aba Entrar agora oferece **Esqueci minha senha**. Ela envia e-mail pelo Supabase com redirect para a origem atual e marcador hmRecovery=1.
- O retorno do link é reconhecido pelo evento PASSWORD_RECOVERY; o usuário define e confirma uma nova senha, e o aplicativo o redireciona ao login após fazer logout.
- Se um cadastro é solicitado com e-mail já registrado, a mensagem é neutra e orienta a usar Entrar ou Esqueci minha senha. O aplicativo não tenta recriar nem excluir usuários existentes.
- A API api/auth/profile.js garante a criação de um perfil buyer ausente, somente depois de validar o JWT. Perfis seller/admin existentes são preservados.
- **Configuração externa obrigatória:** a URL de Preview deve estar autorizada em Supabase Auth > URL Configuration > Redirect URLs. Caso contrário, o e-mail pode direcionar para outro endereço ou não completar a recuperação. Conferir também configuração de SMTP, limites de envio e entrega.
- A Preview compartilha o mesmo projeto Supabase Auth do site atual. Um login real poderá criar um registro buyer faltante na tabela profiles. Não criar contas fictícias para validar produção sem autorização.
- Testes: node --test tests/*.test.mjs, node --check supabase-integration.js, node --check api/auth/profile.js.
- Ainda pendente de validação humana: recebimento do e-mail, link, alteração da senha e login no celular. Não publicar até aprovação específica.


## Correção de login e recuperação de senha — Preview

Branch de testes: `fix/preview-login-password-recovery` (não publicar em produção antes da aprovação).

- `Entrar`: autenticação normal por e-mail e senha.
- `Fazer cadastro`: coleta nome, telefone, endereço, e-mail, senha e confirmação. Se uma conta já existir, a mensagem orienta a entrar ou recuperar o acesso, sem afirmar que um novo usuário foi criado.
- `Esqueci minha senha`: solicita apenas o e-mail e chama `supabase.auth.resetPasswordForEmail` com retorno para `?hmRecovery=1`.
- Link de recuperação válido: abre formulário de **nova senha + confirmação** e chama `supabase.auth.updateUser({ password })`, depois encerra a sessão e solicita novo login.
- O login autenticado chama `/api/auth/profile` para provisionar perfis `buyer` ausentes sem substituir papéis já existentes de `seller` e `admin`.
- Não envia senhas para APIs próprias, não grava senha em `profiles` e não altera contas por SQL.

### Configuração essencial do Supabase Auth
O domínio de Preview precisa estar permitido em **Authentication → URL Configuration → Redirect URLs** no Supabase para que o e-mail de recuperação retorne a essa versão. A verificação da lista de redirects não está disponível nesta mudança de código. Caso o link retorne à produção ou a outro domínio, revisar a allowlist antes de considerar o fluxo validado.

### Validação
1. Use uma conta que já possui senha e e-mail confirmado, mas não suponha que a senha digitada esteja correta.
2. Na Preview toque em `Entrar → Esqueci minha senha`, informe seu e-mail e solicite o link **uma vez**.
3. Abra o e-mail e confira se o link volta para a Preview e apresenta os campos nova senha/confirmar.
4. Atualize a senha, entre novamente e acesse `Perfil`.
5. Reabra o app no celular e confirme que a sessão e os dados do perfil permanecem.
6. Confira X esquerdo/pular, coração direito/curtir, filtros, favoritos e anúncios.

A aplicação do SQL de endurecimento das permissões `profiles.role` é uma questão separada, ainda pendente de aprovação e validação no banco compartilhado.


## Preview — gestão de anúncios para vendedor e ADM Master

Branch de testes: `feat/seller-admin-listings-20261114`. **Não publicar na produção sem validação e autorização.**

### Fluxos implementados
- **Comprador:** pode visualizar o catálogo e acessar os cartões, mas não tem botão de cadastro. As APIs de anúncios e token de upload respondem 403 para perfis buyer.
- **Vendedor:** botão amarelo "Cadastrar / gerenciar anúncios" abaixo da apresentação do catálogo. Pode criar, editar, publicar, pausar, marcar vendido e remover apenas anúncios vinculados ao seu UUID. Pode cadastrar seu WhatsApp de contato.
- **ADM Master:** pode usar o botão abaixo da apresentação ou a aba "Gestão de anúncios" no painel ADM. Visualiza todos os anúncios, cria em nome de uma conta comercial selecionada e pode editar/remover anúncios existentes. O formulário de criação de vendedor exige WhatsApp com DDD.
- **Fotos:** galeria ou câmera do celular, até 10 fotos por anúncio, JPG/PNG/WebP, até 10 MB por foto. Pré-visualização da capa, remoção de fotos e inclusão de novas imagens na edição. Publicação exige ao menos uma foto; rascunho pode ficar sem fotos.
- **Persistência:** os anúncios são gravados em `vehicles`, suas imagens associadas em `vehicle_photos` e os arquivos no bucket privado `vehicle-photos`.
- **Upload:** o navegador solicita um token à API `POST /api/vehicles/photo-token`, que valida JWT e `profiles.role` usando service role. Um caminho UUID exclusivo é gerado no servidor e o navegador faz `uploadToSignedUrl`.
- **Contato comercial:** o catálogo recebe `seller_phone` do perfil vinculado ao anúncio; o botão WhatsApp não redireciona para um número genérico caso o vendedor não tenha contato.

### Restrições e segurança
- A API de anúncios verifica perfil e propriedade no servidor; vendedor nunca pode editar/excluir anúncios de outras contas.
- Não existe nova tabela nesta versão. Os oito anúncios e as fotos já existentes devem ser preservados.
- **Segurança do banco corrigida em 14/11/2026:** a política `profile_insert_own` foi removida, e os privilégios de `profiles` passaram a restringir `UPDATE` às colunas `full_name` e `phone` (não `role`). As políticas de fotos agora exigem um usuário `seller` ou `admin` com diretório próprio no Storage. A alteração está registrada em `docs/seller-admin-storage-security.sql`; não reaplicar sem auditoria.
- Não atribuir automaticamente perfis privilegiados com base em `user_metadata`. Não compartilhar a chave service role no cliente.
- Não modificar a `main` até a Preview aprovada.

### Roteiro de QA
1. Com usuário comprador, confirme que não existe botão de cadastro e que tentativas à API de anúncios/fotos são negadas.
2. Com vendedor, preencha WhatsApp, cadastre rascunho, adicione fotos de câmera e galeria, publique e verifique o anúncio no catálogo.
3. Edite sem selecionar fotos novas (as fotos atuais devem permanecer), depois adicione/remova fotos individualmente e confira o resultado.
4. Teste os limites: 10 fotos, formato incompatível, arquivo maior que 10 MB, publicação sem fotos.
5. Com ADM, acesse gestão de anúncios, selecione um vendedor responsável, publique e confira se o WhatsApp aponta ao dono.
6. Comprador não deve editar, publicar ou excluir; vendedor não vê nem altera anúncios alheios; ADM pode administrar todos.
7. Confira swipe X esquerda/pular, coração direita/curtir, filtros, favoritos, perfil do comprador e recuperação de senha.
8. Execute `node --test tests/*.test.mjs` e `node --check` dos scripts.


### Acesso direto do vendedor (correção de navegação)

- **Causa da falha anterior:** o botão "Cadastrar / gerenciar anúncios" foi adicionado ao container `.intro`, oculto globalmente pelo tema Tinder. Por isso o vendedor não via a opção.
- **Mobile:** a opção **＋ Anunciar** agora aparece no menu inferior somente quando a sessão tem `profiles.role = seller` ou `admin`. Ao tocar, abre o formulário para cadastrar equipamento e a lista de anúncios do vendedor.
- **Desktop:** o botão "＋ Meus anúncios" fica na barra superior visível, em vez de dentro da seção `.intro`.
- **Comprador e visitante:** nenhum desses atalhos fica visível; a API mantém a autorização independente da UI.
- Depois de entrar ou sair, o aplicativo recalcula a permissão e mostra/oculta os atalhos; só contas comerciais cadastradas pelo ADM recebem acesso.
- **Não criar vendedores automaticamente:** o ADM Master continua responsável por criar e autorizar contas de vendedores.
- Teste novo: `tests/seller-navigation.test.mjs`, incluindo simulação de perfis buyer, seller, admin e visitante.

### Publicação segura — 14/11/2026
- Foram verificadas as permissões do Supabase após a atualização, confirmando que usuários autenticados **não** podem modificar `profiles.role` nem inserir perfis arbitrariamente.
- O servidor continua autorizando a criação e edição de anúncios apenas para seller/admin e validando a titularidade em operações de vendedor.
- Nenhuma conta, anúncio ou foto foi apagada; verificadas 8 entradas em `vehicles`, 28 em `vehicle_photos` e 4 em `profiles`.
- Atenção: testes E2E autenticados reais e upload pela câmera devem ser validados no celular após a publicação.


## Preview — preço de venda visível no cadastro e nos anúncios

Branch: `feat/listing-price-visible-20261114`. **Não publicar em produção sem aprovação.**

- O formulário comercial agora começa em **Mostrar preço**, com campo de valor em reais habilitado.
- Aceita valores `250.000,00`, `250000`, `R$ 250.000,00` e centavos. Faz validação e envia um número para o campo `vehicles.price`.
- A opção **Sob consulta** continua disponível, desabilitando a exigência de valor numérico e salvando `price_on_request=true`.
- Um resumo no formulário mostra exatamente como o preço será exibido.
- A vitrine exibe o preço sobre a foto do equipamento, inclusive no layout mobile.
- Ao abrir **Detalhes**, o preço aparece em destaque na descrição visual do anúncio, sem duplicar texto dentro de `vehicles.description`.
- O filtro de faixa de preço interpreta o padrão brasileiro `R$ 250.000,00`.
- Na edição, o valor informado anteriormente é recuperado, mantendo os anúncios existentes e a opção Sob consulta.
- Nenhuma migração, alteração de RLS, exclusão ou modificação dos dados em produção.
- Rodar `node --test tests/*.test.mjs`, incluindo `tests/listing-price.test.mjs`.


### Classificação correta — caminhões, cavalos mecânicos e carretas

- **Caminhão:** categoria própria. Quando aplicável, permite selecionar configuração de eixos como 4x2, 6x2, 6x4, 8x2, 8x4, 10x4 ou Outra.
- **Cavalo mecânico:** categoria independente de Caminhão; seleção opcional de configuração de eixos/tração (4x2, 6x2, 6x4, 8x2, 8x4, 10x4, Outra).
- **Carreta / implemento:** categoria de implemento rebocado; seleção opcional de tipo (Basculante, Graneleira, Prancha, Baú, Sider, Tanque, Frigorífica, Porta-contêiner, Cegonha, Florestal, Canavieira, Dolly, Outro).
- No catálogo e na pesquisa, as opções têm filtros separados para Caminhão, Cavalo mecânico e Carreta / implemento.
- Persistência sem alteração de schema: os campos são codificados em `vehicles.category` (ex.: `Cavalo mecânico 6x4`, `Carreta / implemento — Prancha`). `listing-categories.js` contém o conversor e o filtro normalizador. A categoria composta é exibida na ficha e no cartão do anúncio.
- Anúncios antigos gravados com `category='Carreta'` continuam sendo encontrados no filtro de carretas; ao editar, são interpretados como `Carreta / implemento`. Preferências antigas de compradores com `Carreta` também são convertidas ao abrir e salvar o perfil.
- Não há alteração de tabelas nem de registros de produção nesta branch; somente Preview até aprovação.
- Executar `node --test tests/listing-categories.test.mjs` e todos os testes do workflow.


## CatiraMatch — nova identidade visual e preço na bio (Preview)
Marca adotada: **CatiraMatch**, antiga marca HeavyMatch. Identidade baseada nas imagens originais enviadas pelo proprietário, incluindo wordmark e ícone de setas opostas.

- **Paleta:** vermelho `#E32227`, carvão `#181818`, branco `#FFFFFF`, cinza-claro `#F3F3F3`.
- **Slogan:** Seu próximo negócio começa aqui. Complemento: Conectar. Negociar. Avançar.
- **Logo original:** `assets/catiramatch-logo.png`; favicon recortado das setas `assets/catiramatch-icon.png`. Ambas extraídas e otimizadas da arte enviada.
- **Estilos:** `styles/catiramatch-theme.css` sobrepõe a antiga paleta amarela e mantém o layout Tinder-like, o título `Pra você` no celular, os mesmos filtros e navegação, e os botões X esquerda/pular e coração direita/curtir.
- **Bio do equipamento:** a tela Detalhes apresenta `Bio do equipamento` com uma faixa de preço derivada de `vehicles.price` (ou `Sob consulta`) seguida da descrição `vehicles.description`. O campo de texto da área do vendedor foi renomeado para Bio do equipamento. Alterar o preço atualiza a bio automaticamente sem duplicar o valor no banco.
- **Nome visível:** título da página, informações de compartilhamento, formulário de login, painel de vendedor, perfil de comprador, tour e WhatsApp atualizados para CatiraMatch.
- **Infraestrutura:** repositório GitHub e domínio `machinematch.vercel.app` continuam com nomes técnicos antigos para evitar interromper o serviço. **Não alterar domínio em produção sem aprovação.**
- **Escopo:** branch `feat/listing-price-visible-20261114` em Preview. Sem alterações de banco, contas, anúncios ou produção. A publicação requer validação do usuário.
- **Regressões:** `node --test tests/*.test.mjs`, inspeção manual do logo e dos preços no mobile e desktop.


### Ajuste visual da logo no topo
- Corrigido o problema de renderização: o retângulo branco com cantos arredondados do cabeçalho não faz parte da identidade e foi removido.
- A logo do cabeçalho agora é `assets/catiramatch-logo-header.png` (PNG com transparência, tipografia branca e setas branca/vermelha) e fica diretamente sobre a barra carvão. A versão original preta é preservada para telas claras.
- Estilos desktop/mobile de `.brand .brand-logo` retiram `background:#fff`, padding, sombras e bordas. O arquivo PNG foi recortado para eliminar margens transparentes excessivas.
- Sem mudanças no banco ou nas funcionalidades; testes em `tests/catiramatch-brand.test.mjs`.


### Correção do gesto de swipe do CatiraMatch (Preview 14/11/2026)

- **Deslizar para a direita = CURTIR/SALVAR**; animação sai para a direita, exibe selo SALVO e adiciona o item aos salvos.
- **Deslizar para a esquerda = PASSAR**; animação sai para a esquerda, exibe selo PULOU e não adiciona aos salvos.
- Botão X permanece à esquerda (passar); botão ♥ permanece à direita (curtir). As teclas ← e → mantêm o mesmo significado.
- O gesto agora é reconhecido pelo `pointerup` registrado no documento, não apenas dentro da foto. Isso permite concluir o arrasto mesmo que o dedo termine fora do cartão.
- Durante o gesto, o cartão acompanha a direção e mostra o selo correto. Deslocamentos menores que 65px, movimentos predominantemente verticais e `pointercancel` não geram like/pass.
- Evita capturar o pointer para não interferir na galeria de fotos e na rolagem vertical do celular.
- Testes de eventos simulados em `tests/swipe-direction-real-events.test.mjs` validam gesto para ambos os lados, arrasto fora da foto, toque curto, scroll vertical, cancelamento e botões.
- Mudança em branch de teste com Preview; não altera banco, fotos, anúncios nem produção até aprovação.


### Cabeçalho do celular sem sobreposição de logo
- Corrigido após captura de tela de celular: os botões Entrar, filtros, favoritos e Ajuda encobriam a logo CatiraMatch.
- Em telas até 799px, `.topbar` usa duas linhas independentes: logo PNG transparente e indicação `Pra você` na primeira, botões compactos acessíveis na segunda.
- Botões com 36px de altura; ajuda mostra ícone `?` com descrição acessível preservada; controles mantêm seus listeners e menus originais. Para telas até 360px, espaçamentos são reduzidos.
- Login, sessão, ADM, anúncios, tour, fotos, swipe e desktop não foram modificados nesta correção.
- Testes: `tests/mobile-header-no-overlap.test.mjs` e suite completa. Trabalho somente em Preview até aprovação.


### Preview UX — Descoberta imersiva estilo Tinder (14/11/2026)

Referência: fluxo de cartões por swipe do Tinder, com fotos ocupando a tela e controles discretos; identidade **CatiraMatch** própria.

**Mobile até 799px:** cabeçalho em uma linha (56px) com PNG CatiraMatch e "Pra você"; a foto usa a altura dinâmica do viewport, descontando apenas cabeçalho e rodapé. Fotografias de caminhões em paisagem são exibidas por inteiro (`object-fit:contain`) com o mesmo arquivo desfocado ao fundo. Nome, ano, localização e preço ficam sobre a imagem, sem cartões secundários ocupando altura. X passa à esquerda; coração curte à direita. Ações discretas de detalhes e WhatsApp ficam na mesma barra translúcida. Tocar a imagem alterna as fotos quando houver galeria.

**Navegação principal:** apenas **Descobrir / Buscar / Salvos / Conta** visíveis na parte inferior. Botões adicionais não foram excluídos nem desautorizados: o perfil em Conta contém Entrar/Criar conta, Perfil de compra, Cadastrar e gerenciar anúncios (visível somente para seller/admin), ADM Master (apenas admin), Ajuda e Sair. O WhatsApp do vendedor também está diretamente sobre a foto. A área ADM e o cadastro continuam usando os mesmos handlers originais com autorização do servidor.

**Arquivos:** `styles/mobile-discovery.css`, `mobile-discovery.js`; `index.html` expõe foto desfocada/primeiro plano e ações rápidas; `guided-tour.js` orienta a nova navegação. O desktop não muda. Favoritos abrem em painel, sem rolar a vitrine para fora da foto. `tests/immersive-discovery.test.mjs` e demais regressões verificam hierarquia, atalhos e regras de acesso.

**Processo:** mesma branch `fix/catiramatch-swipe-direction-20261114` e URL estável de Preview do PR #15. NÃO publicar em produção nem alterar Supabase antes de aprovação explícita. Teste visual real em iPhone/Android ainda necessário.


### Ajuste de duplicidade visual dos menus (Preview)
Após avaliação de captura no celular, `styles/mobile-discovery.css` remove o fundo escuro arredondado, a borda, sombra e desfoque do agrupador de ações na fotografia. X, detalhes, WhatsApp e coração continuam como **botões circulares flutuantes independentes** na foto, sem aparentar uma segunda barra de menu. A navegação inferior mantém somente **Descobrir, Buscar, Salvos, Conta**. Os controles do Safari/visualizador não pertencem ao site.

Nenhuma mudança de API, login, Supabase, banco, anúncios ou produção. Testes de layout em `tests/immersive-discovery.test.mjs`.


### Ajuste definitivo: apenas um menu de navegação no celular
O agrupamento horizontal X/Info/WhatsApp/Coração foi eliminado da experiência mobile. CSS `styles/mobile-discovery.css` usa `display:contents` no contêiner para que não exista outra faixa de ícones; X e coração aparecem **separados em cantos da foto**, mantendo suas funções de passar e curtir. O acesso a informações técnicas e WhatsApp fica no próprio anúncio através de **Ver bio e contato**, que abre a ficha completa com o botão de conversa do vendedor. Isso preserva a galeria ao toque e a lógica de swipe.

Somente **Descobrir, Buscar, Salvos e Conta** formam o menu inferior; a barra do navegador iOS não é uma barra do aplicativo. A mudança está na mesma branch de Preview do PR #15 e não modifica backend, permissões, banco nem produção. Os testes `immersive-discovery.test.mjs` e regressões cobrem a separação.

## Cadastro de prestadores de serviços

O cadastro público pergunta se a pessoa oferece serviços para caminhoneiros e permite selecionar mais de um setor. A solicitação permanece pendente até análise do ADM Master na aba **Prestadores**.

A escolha feita no navegador não concede permissões. Após a aprovação do ADM, o servidor libera somente o acesso correspondente; no caso de **Agenciamento de cargas**, o perfil recebe acesso ao painel de publicação e gestão de cargas.


## Preview — experiência simplificada (2026-11-25)

Branch: `feature/ux-simples-20261125` (não publicada em produção).

- Navegação principal reduzida para Início, Explorar, Publicar, Atividade e Conta.
- Alternância clara entre Compra e venda e Serviços e cargas.
- Publicação contextual para equipamentos, cargas e prestadores.
- Cadastro dividido em duas etapas, preservando intenção, caminhão, implemento e serviços oferecidos.
- Área de atividade reúne salvos, interesses em cargas, serviços e preferências.
- Serviços futuros recolhidos para priorizar recursos já disponíveis.
- Tour reduzido às ações essenciais e estado vazio com alternativas úteis.
- Compatibilidade mantida com swipe, filtros, login, favoritos, WhatsApp, anúncios e permissões existentes.


### Contraste da marca Catira.com
No cabeçalho escuro, usar `assets/catiracom-icon-dark.png`: seta superior branca e inferior vermelha, mantendo a geometria original. Em fundos claros e login, preservar `assets/catiramatch-icon.png`.
