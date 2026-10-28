# HeavyMatch

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
