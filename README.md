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


## Correção do login e recuperação de senha — Preview

- Cadastro/login continuam separados; contas preexistentes não são recriadas pelo sistema.
- O formulário de login inclui **Esqueci minha senha**. O próprio Supabase envia um link de redefinição para o e-mail informado.
- O callback de recuperação abre a tela **Definir nova senha**, verifica se existe sessão de recuperação e chama Supabase Auth updateUser para registrar a nova senha. Depois encerra a sessão e retorna ao login.
- O destino padrão do link é a mesma origem da Preview com o parâmetro auth=recover. **O endereço da Preview precisa estar permitido em Supabase Auth → URL Configuration → Redirect URLs** para funcionar. Não alterar as URLs de produção sem revisão.
- Para qualquer e-mail, a mensagem de recuperação não informa se existe uma conta; erros de limite de requisições são tratados.
- Se um usuário se cadastrar com um e-mail já existente, a mensagem passa a orientar Entrar/Esqueci minha senha, sem confirmar um novo cadastro indevidamente.
- Nenhuma senha existente foi visualizada, alterada administrativamente ou enviada para agentes. Nenhum envio de recuperação foi disparado pelo desenvolvimento.
- Teste automatizado: tests/auth-recovery.test.mjs. Validar na Preview com o próprio titular, clicando no e-mail recebido. Somente promover à produção após validação explícita.
