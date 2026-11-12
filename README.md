# HeavyMatch

Marketplace digital com experiência mobile de descoberta de caminhões, carretas e máquinas pesadas.

## Estrutura do frontend

```text
index.html
styles/
  main.css                 # ponto de entrada dos estilos
  tokens.css               # cores e variáveis visuais
  base.css                 # componentes e estilos gerais
  responsive.css           # regras responsivas
modules/
  state.js                 # estado compartilhado da vitrine
  shared/
    helpers.js             # escape de texto, WhatsApp e notificações
  api.js                 # cliente HTTP compartilhado e autenticação das chamadas
  marketplace/
    filters.js             # filtros e ordenação
    gallery.js              # galeria de fotos
    favorites.js            # lista de interesse
    cards.js                # cartão, gestos e detalhes do anúncio
    interactions.js         # eventos e navegação da vitrine
supabase-integration.js    # autenticação e administração
equipment-marketplace.js   # cadastro e gestão de anúncios
guided-tour.js             # tour guiado
api/
  config.js
  vehicles.js
  admin/users.js
```

Os arquivos do frontend são carregados como scripts clássicos em ordem explícita no `index.html`. O estado compartilhado fica em `modules/state.js`; por isso, não adicionar `type="module"` isoladamente aos scripts sem migrar também as dependências e o acesso compartilhado.

## Integrações e segurança

- Configure `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` nos ambientes adequados do Vercel.
- A chave `SUPABASE_SERVICE_ROLE_KEY` é secreta e nunca deve ser enviada ao navegador.
- Verifique no Supabase a existência das tabelas, do bucket e das políticas de acesso usados pela aplicação.
- Confirme os dados dos anúncios e o contato comercial/WhatsApp antes de uso comercial.
- A presença dos arquivos e das configurações não substitui testes funcionais com as credenciais reais.

## Fluxo de trabalho

1. Desenvolver em uma branch de trabalho, sem alterar diretamente `main`.
2. Gerar uma Preview e validar os fluxos principais.
3. Corrigir os problemas encontrados e solicitar aprovação.
4. Só mesclar em `main` e publicar em produção após autorização explícita.
5. A branch `main` deve refletir a versão aprovada para produção.

## Testes automatizados

Execute `npm test` para verificar a centralização dos listeners da interface e as regras essenciais de curtir, passar e gestos.


## Desempenho do catálogo

- A API pública carrega até 20 anúncios por página (máximo permitido: 30), usando `offset` e indicador `hasMore`.
- O feed solicita a próxima página quando o usuário chega ao fim dos cartões, sem trocar a experiência de deslizar.
- Marca, modelo, categoria, texto, preço e ordenação são enviados à API para filtrar antes de paginar. Anúncios sem preço numérico continuam incluídos quando há filtro de valor.
- As URLs temporárias das fotos são geradas em lote por página, em vez de uma chamada individual por foto.
- Respostas públicas recebem cache curto; a área de gestão continua sem cache compartilhado.
- Execute `npm test` para verificar os contratos de paginação, filtros, cache e eventos do marketplace.

## Próximas etapas da modularização

- Separar o CSS por domínio visual além da divisão inicial entre tokens, base e responsividade.
- Isolar os serviços de dados do catálogo e a camada de estado.
- Migrar os scripts legados de autenticação e administração para módulos menores, preservando as APIs existentes.
- Criar testes automatizados para filtros, favoritos, galeria e gestos de curtir/passar.


## Etapa 3 — camada compartilhada de serviços

- As chamadas autenticadas para as APIs de administração e anúncios usam `modules/shared/api.js`.
- O cliente centraliza cabeçalhos JSON, token Bearer, leitura da resposta e mensagens de erro.
- Os módulos de interface continuam responsáveis por obter a sessão Supabase e decidir o endpoint/ação.
- O arquivo é carregado como script clássico antes dos módulos que o utilizam; não converter scripts isoladamente para ES Modules.
- Execute `npm test` para validar o contrato HTTP compartilhado e os consumidores.

## Etapa 4 — Gestão comercial (primeiro incremento)

- A API pública e a listagem de gestão incluem nome e telefone do vendedor associado ao anúncio, obtidos de `profiles`.
- O catálogo preserva `seller_phone` ao transformar registros para cartões. O WhatsApp de um anúncio deve usar o telefone de seu vendedor.
- O ADM Master pode informar WhatsApp ao criar um vendedor; o número é salvo em `profiles.phone` e exibido na listagem de contas.
- Anúncios sem WhatsApp cadastrado exibem orientação em vez de redirecionar para um telefone genérico de outro vendedor.
- Testes de contrato e de geração de links estão em `tests/commercial-contact.test.js`.
- Ainda pendente nesta etapa: edição do telefone de vendedores existentes, registro de leads/histórico e painel comercial. Não presumir essas funções como entregues.
- Validar na Preview antes de publicar; nenhuma mudança de schema ou RLS foi aplicada.

## Correção do cadastro de clientes — branch de teste

- O formulário mantém **Entrar** (e-mail e senha) separado de **Fazer cadastro** (nome, telefone, endereço, e-mail e confirmação de senha).
- O cadastro grava esses dados no metadata de autenticação do Supabase. Nome e telefone são copiados para `profiles` quando a sessão autenticada é criada; o endereço permanece no metadata enquanto não houver campo próprio no schema.
- A nova API `POST /api/auth/profile` confirma o JWT do usuário antes de criar seu perfil com `role=buyer`; ignora `role` e `account_type` informados nos metadados. Perfis existentes de seller/admin nunca são substituídos.
- Para cadastros com confirmação de e-mail, o perfil é provisionado no primeiro login autenticado. Contas antigas sem linha em `profiles` também são recuperadas nesse fluxo.
- Testes de contrato: `tests/account-profile.test.js`. Nenhuma conta real foi criada nem banco modificado durante a implementação.
- **Segurança pendente do banco compartilhado:** a política atual permite que o próprio usuário altere `profiles.role` ou insira um perfil privilegiado. O roteiro SQL de revisão está em `docs/SUPABASE_PROFILE_SECURITY_REVIEW.sql`. Só executar com autorização específica, após revisão dos consumidores; o novo endpoint sozinho não neutraliza permissões diretas existentes.
- Validar Preview, confirmação por e-mail, login do comprador, sessão recuperada, logout e acesso de vendedor/admin. Somente publicar em produção após aprovação específica.
