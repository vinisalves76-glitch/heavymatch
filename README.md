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

## Próximas etapas da modularização

- Separar o CSS por domínio visual além da divisão inicial entre tokens, base e responsividade.
- Isolar os serviços de dados do catálogo e a camada de estado.
- Migrar os scripts legados de autenticação e administração para módulos menores, preservando as APIs existentes.
- Criar testes automatizados para filtros, favoritos, galeria e gestos de curtir/passar.
