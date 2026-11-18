# CatiraMatch — Gestão do Apoio ao Motorista (Preview)

## Escopo
Branch: feat/apoio-gestao-preview-20261118.
Não modificar nem promover a main, não publicar em produção e não executar migrações ou escritas no Supabase compartilhado.

## Implementado
- Aba Apoio ao motorista no modal existente do ADM Master, sem botão global extra no rodapé.
- Abrir gestão de parceiros: /apoio-gestao-preview.html.
- Acesso ao painel com sessão Supabase real e verificação somente leitura de profiles.role=admin no servidor: GET /api/admin/apoio-access.
- Cadastro, edição, publicação, pausa e remoção de parceiros; busca por nome/cidade e filtros de categoria/situação.
- Categorias: despachante, lojas de peças, guincho, reboque, eletricista, mecânica e outros.
- Dados: nome, categoria, cidade, UF, região atendida, endereço, WhatsApp, horário, descrição e foto/logo.
- Fotos anexadas são redimensionadas no navegador para demonstração local.
- Vitrine /apoio-motorista-preview.html: só parceiros publicados com WhatsApp válido, com filtros e links de conversa/ligação.

## Isolamento da Preview
Os dados do formulário ficam exclusivamente na chave local catiramatch_apoio_preview_v1 do localStorage do navegador. Não são compartilhados entre dispositivos ou sessões privadas. O login real é usado apenas para autenticar o administrador na plataforma, sem escrita de dados no Supabase por este módulo.

Na primeira visita, 3 rascunhos marcados como exemplos facilitam o teste. Não têm telefones reais, não são públicos. Parceiros publicados podem aparecer na vitrine somente no mesmo navegador e hostname da Preview. Não testar com dados reais sensíveis.

Não há alterações de tabela, RLS, Storage, usuários, anúncios, fotos de veículos ou produção.

## Roteiro de validação
1. Abrir a Preview, fazer login como admin e entrar no ADM Master.
2. Selecionar Apoio ao motorista e abrir a gestão.
3. Criar ou editar parceiro com categoria, cidade/UF, serviços, WhatsApp e imagem.
4. Publicar, recarregar a página, testar filtros, edição e pausa.
5. Abrir Ver área do motorista no mesmo navegador e conferir categoria/cidade/WhatsApp.
6. Pausar e confirmar que desaparece da vitrine.
7. Verificar bloqueio de comprador, vendedor e visitante no painel.
8. Rodar node --test tests/*.test.mjs e conferir o deployment Preview.

## Próxima etapa para operação real (não executada)
- Criar tabela support_partners com RLS e auditoria, e índices por categoria, UF e status.
- Implementar API de CRUD com JWT validado no servidor e checagem de papel admin, sem confiar na role do cliente.
- Usar Storage separado para fotos/logos com políticas de uploads.
- Substituir localStorage por API paginada e validar a migração primeiro em ambiente de teste separado.
- Executar migração no banco compartilhado somente mediante aprovação expressa.

## Preservação
Marketplace, swipe, perfil comprador, gestão de anúncios, preços, contatos de vendedores e autenticação existente continuam com fluxo inalterado. A única edição do script legado é a nova aba no ADM Master e sua visibilidade.
