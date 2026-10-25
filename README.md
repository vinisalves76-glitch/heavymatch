# HeavyMatch

Experiência mobile de descoberta de caminhões, carretas e máquinas pesadas, inspirada na navegação por cartões e gestos de apps de descoberta.

## Conteúdo do repositório
- `index.html`: aplicação estática completa com HTML, CSS e JavaScript.
- Não requer npm, bundler ou etapa de build para servir a página no Vercel.

## Como executar localmente
Abra o arquivo `index.html` em um navegador moderno ou sirva a pasta usando um servidor estático local.

## Funcionalidades atuais
- Cartões de anúncios com fotos e informações básicas.
- Deslizar para a direita ou tocar no coração para curtir e salvar.
- Deslizar para a esquerda ou tocar no X para passar.
- Menu inferior por ícones: deslizar, explorar, favoritos, chat e perfil.
- Filtros demonstrativos por categoria, marca, ordem e texto.
- Modal com detalhes e atalho de contato pelo WhatsApp.

## Limitações que ainda precisam ser resolvidas antes da operação comercial
- Os seis anúncios e as imagens são demonstrativos; cadastrar anúncios reais e usar fotos autorizadas.
- Configurar `WHATSAPP_NUMBER` no JavaScript com o contato real de atendimento.
- Favoritos existem apenas na memória da sessão do navegador. Não há banco de dados, login, painel de administração ou sincronização de anúncios.
- O ícone de chat atualmente abre o WhatsApp configurado; não existe chat interno entre cliente e atendente.

## Publicação no Vercel
O projeto do Vercel está conectado a este repositório GitHub e usa `main` como branch de produção. Novos commits em `main` podem iniciar deploy automático de produção; commits nas branches de trabalho geram previews.

## Fluxo recomendado
1. Fazer novas mudanças em uma branch de desenvolvimento.
2. Conferir a preview e testar em celular e desktop.
3. Mesclar em `main` somente após aprovação explícita.
