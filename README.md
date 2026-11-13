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
