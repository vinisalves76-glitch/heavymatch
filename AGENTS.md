# AGENTS.md — Contexto obrigatório do HeavyMatch

> **LEITURA OBRIGATÓRIA:** qualquer pessoa, agente de IA ou chat que vá analisar, editar, testar, revisar ou publicar código deste repositório DEVE ler este arquivo integralmente antes de começar. Depois da leitura, confira também o código atual e os arquivos indicados abaixo. Se houver conflito entre este documento e o comportamento/código atual, não presuma: investigue, registre a divergência e confirme antes de alterar algo sensível.

## 1. Identidade e objetivo do projeto

**HeavyMatch** é um marketplace/serviço de intermediação digital focado inicialmente em caminhões, carretas e máquinas pesadas, com atuação inicial em Minas Gerais. A proposta é aproximar compradores e vendedores: o comprador encontra o equipamento e conversa diretamente com o vendedor.

O produto deve transmitir robustez, confiança e facilidade de uso. A experiência prioritária é **mobile-first**, simples e visual, inspirada na dinâmica de cartões do Tinder — sem transformar o produto em um catálogo tradicional.

## 2. Regras críticas de trabalho

1. **É PROIBIDO trabalhar diretamente no código de produção.** Nunca editar, commitar ou desenvolver diretamente na branch `main`, nem alterar o deployment de produção durante a implementação.
2. A branch **`main` é a referência de produção**. Ela deve permanecer protegida durante o desenvolvimento normal; não usar outra branch como substituta dessa referência.
3. **Todo trabalho deve começar e acontecer em uma branch separada de teste/desenvolvimento**, criada a partir da versão atualizada de `main` (ou da branch-base explicitamente indicada). Use uma branch específica para cada funcionalidade ou correção, salvo orientação diferente do responsável. No contexto desta reestruturação, a branch de trabalho existente é **`feature/modular-architecture`**. Antes de escrever, confirme a branch atual e a branch-base.
4. **É obrigatório gerar uma Preview vinculada à branch de teste para toda alteração que precise ser avaliada no sistema.** A Preview deve ser separada do ambiente de produção. Não considerar apenas o commit, build ou inspeção estática como substituto do teste visual/funcional na Preview.
5. **O fluxo obrigatório é: branch de teste → implementação → verificações técnicas → deploy de Preview → teste e validação do responsável → autorização explícita para produção → publicação em produção.** Se a Preview não puder ser criada ou testada, interrompa o fluxo antes de produção e informe o impedimento.
6. **Nunca fazer deploy de produção, merge em `main`, promoção de deployment ou alteração de variáveis/recursos de produção sem autorização explícita do responsável.** A aprovação da Preview não autoriza automaticamente a publicação; peça confirmação específica para colocar em produção.
7. Fazer commit, abrir PR ou gerar Preview não significa autorização para produção.
5. Antes de modificar qualquer área, inspecione a implementação atual, seus chamadores, dependências, integrações e histórico/diff relevante. Não reescreva arquivos inteiros sem necessidade.
6. Preserve funcionalidades existentes. Evite regressões em login, anúncios, filtros, favoritos, galeria, WhatsApp, painel administrativo, permissões e integrações Supabase.
7. Não invente dados, integrações, credenciais, resultados de testes ou status de deploy. Nunca exponha chaves, tokens, senhas ou dados privados em commits, logs ou respostas.
8. Faça mudanças pequenas e coerentes. Explique o que mudou, quais arquivos foram afetados, o que foi testado e o que ainda não foi testado.
9. Se uma solicitação for ambígua e puder afetar dados, usuários ou produção, pare e peça confirmação antes da ação irreversível.
10. Ao concluir, informe branch, commit e links verificáveis. Não diga que algo está validado em navegador se apenas houve inspeção estática ou compilação sintática.

## 3. Comportamentos essenciais do produto

### Cartões e navegação do marketplace

- **Arrastar para a direita = curtir / salvar interesse.**
- **Arrastar para a esquerda = pular / descartar o cartão.**
- O botão de coração deve executar a mesma ação de curtir (direita).
- O botão X deve executar a mesma ação de pular (esquerda).
- Essas direções são requisitos críticos: já houve regressões anteriores com ações invertidas. Sempre teste os dois gestos e os dois botões após alterações relacionadas.
- Tocar na foto deve avançar para a próxima imagem da galeria, uma imagem por vez. Tocar na foto não deve curtir nem pular.
- Não introduzir setas sobre a foto para navegar pela galeria sem solicitação explícita.

### Menus e contato

- Evitar menus/atalhos duplicados no topo e na parte inferior.
- A navegação principal deve permanecer simples e adequada ao celular.
- O contato com o vendedor deve direcionar ao WhatsApp do vendedor associado ao anúncio/perfil, usando o número cadastrado. Não substituir esse fluxo por um chatbot sem autorização.
- O cadastro/edição de anúncio deve permitir manter os dados de contato do vendedor, inclusive WhatsApp, conforme o fluxo existente.

### Anúncios, filtros e administração

- Preservar criação, edição, publicação e remoção de anúncios conforme permissões atuais.
- Preservar filtros por marca, modelo e valor e garantir que a ação de pesquisar/aplicar filtros funcione no celular.
- Preservar favoritos/interesses e a possibilidade de consultar os anúncios salvos.
- Recursos administrativos e de master devem respeitar as permissões existentes. Não abrir cadastro privilegiado ou ações administrativas ao público.
- Não remover dados de teste, anúncios ou registros reais sem confirmação explícita.

## 4. Arquitetura atual conhecida

A aplicação começou concentrada em um único `index.html`. A primeira etapa de modularização separou estilos e partes do JavaScript.

Estrutura conhecida na branch de trabalho:

```text
/
├── AGENTS.md                         # este contexto obrigatório
├── README.md
├── index.html                        # estrutura da página e ponto de entrada
├── styles/
│   ├── main.css                      # entry point dos estilos
│   ├── tokens.css                    # variáveis/tokens visuais
│   ├── base.css                      # estilos gerais
│   └── responsive.css                # regras responsivas
├── modules/
│   ├── state.js                      # estado compartilhado legado
│   ├── shared/
│   │   ├── helpers.js                # funções utilitárias compartilhadas
  │   └── api.js                    # chamadas HTTP compartilhadas
│   └── marketplace/
│       ├── filters.js                # filtros
│       ├── gallery.js                # galeria de imagens
│       ├── favorites.js               # favoritos/interesses
│       ├── cards.js                  # cartões/anúncios
│       └── interactions.js           # gestos e interações
├── supabase-integration.js           # integração existente com Supabase
├── equipment-marketplace.js          # funcionalidades existentes do marketplace
└── guided-tour.js                    # tour guiado
```

> Esta árvore é o estado conhecido após a primeira modularização. **Confirme os nomes e a existência dos arquivos na branch atual antes de usá-los como verdade absoluta.** Atualize este documento quando a arquitetura mudar.

### Ordem de carregamento e compatibilidade

- Os arquivos JavaScript modulares atuais são carregados como **scripts clássicos**, em uma ordem definida no `index.html`.
- Eles compartilham estado/funções no escopo global para manter compatibilidade com integrações legadas.
- **Não adicionar `type="module"` isoladamente** nem converter arquivos para ES Modules sem mapear e migrar as dependências entre todos os scripts.
- Ao mudar a ordem dos scripts, confira todas as dependências e os pontos de entrada.
- `styles/main.css` funciona como ponto de entrada e importa tokens, base e responsividade. Preserve esse contrato ou atualize todos os consumidores.

### Direção da evolução técnica

A modularização atual é uma primeira separação, não uma arquitetura final. Evoluir gradualmente, preferindo:
- separar responsabilidades de interface, estado e acesso a dados;
- centralizar chamadas HTTP e serviços de acesso a dados em módulos próprios;
- reduzir dependências globais de forma incremental;
- evitar duplicação de regras de negócio;
- introduzir testes automatizados para gestos, filtros, favoritos, galeria e permissões;
- manter compatibilidade até que cada integração legada tenha sido migrada e testada.

Não fazer uma migração ampla de arquitetura apenas por preferência estética. Cada etapa deve ter escopo claro e validação.

## 5. Backend, autenticação e dados

- O projeto utiliza Supabase para autenticação, banco de dados e armazenamento de fotos.
- Existe integração com Supabase no código. Inspecione os arquivos e políticas atuais antes de alterar consultas, tabelas, autenticação ou storage.
- O bucket de fotos conhecido é `vehicle-photos`; os formatos de imagem configurados anteriormente incluem JPEG, PNG e WebP. Confirme a configuração real antes de depender dela.
- Há políticas de leitura de anúncios publicados e envio de fotos por usuários autenticados, mas políticas podem ter mudado. Nunca presumir permissões sem conferir o estado atual do projeto.
- A chave `SUPABASE_SERVICE_ROLE_KEY` é segredo de servidor. **Nunca colocá-la em código executado no navegador, no repositório, em logs ou em respostas.**
- Não alterar políticas RLS, autenticação, usuários, dados ou buckets sem compreender o impacto e obter confirmação quando houver risco para produção.
- A criação de contas privilegiadas/master deve permanecer restrita ao fluxo administrativo autorizado. Não criar cadastro público de administrador.

## 6. Design e experiência

- Priorizar uso no celular, áreas de toque confortáveis, hierarquia visual clara, carregamento fluido e imagens dos equipamentos em destaque.
- Manter identidade visual robusta/industrial, sem excesso de elementos decorativos.
- Evitar adicionar menus, botões ou ícones sem função real.
- Estados de carregamento, vazio, erro e sucesso devem ser claros.
- Garantir acessibilidade básica: rótulos, foco visível, contraste adequado e controles utilizáveis por teclado quando aplicável.
- Não sacrificar a dinâmica de cartões para transformar a tela principal em uma listagem convencional sem aprovação.

## 7. Processo obrigatório antes de alterar código

1. Ler este arquivo por completo.
2. Confirmar repositório, branch e estado do working tree.
3. Ler o `README.md` e inspecionar o `index.html` e os módulos relacionados à tarefa.
4. Identificar dependências, funções globais, eventos, integrações e possíveis efeitos colaterais.
5. Definir escopo mínimo e arquivos que serão alterados.
6. Criar ou selecionar uma branch separada de teste/desenvolvimento e implementar somente nela. **Nunca editar diretamente `main` ou o código/deployment de produção.**
7. Executar verificações adequadas:
   - sintaxe/compilação dos arquivos alterados;
   - testes automatizados disponíveis;
   - build/lint, se configurados;
   - deploy de Preview associado à branch de teste;
   - testes reais na Preview, em desktop e celular quando aplicável.
8. Disponibilizar o link da Preview ao responsável e aguardar sua avaliação. Corrigir problemas e gerar uma nova Preview quando necessário.
9. Conferir o diff para detectar alterações acidentais, segredos ou arquivos fora do escopo.
10. Registrar no commit uma mensagem objetiva.
11. Somente depois da validação da Preview, solicitar autorização explícita e específica para publicar em produção. Sem essa autorização, manter as alterações apenas na branch de teste/Preview.
12. Relatar claramente: alterações, validações executadas, limitações conhecidas, branch, commit e link funcional da Preview.

## 8. Checklist de regressão para mudanças no marketplace

Quando a alteração tocar cartões, navegação, anúncios ou interface, verificar, conforme aplicável:

- [ ] Arrastar para a direita salva/curte.
- [ ] Arrastar para a esquerda pula.
- [ ] Coração salva/curte.
- [ ] X pula.
- [ ] Toque na foto avança a galeria sem disparar outra ação.
- [ ] Filtros abrem, aceitam valores e aplicam a pesquisa no celular.
- [ ] Favoritos/interesses exibem os itens corretos.
- [ ] WhatsApp abre o contato do vendedor correto.
- [ ] Edição de anúncio preserva e atualiza os dados esperados.
- [ ] Login, sessão e saída continuam funcionando.
- [ ] Permissões de comprador, vendedor e master continuam respeitadas.
- [ ] Layout funciona em larguras móveis e desktop.

Marque um item como validado somente depois de executar o teste correspondente. Se não foi possível testar, deixe-o explicitamente como pendente.

## 9. Como manter este contexto atualizado

Este arquivo é a fonte de contexto operacional do repositório. Sempre que uma decisão estrutural ou regra permanente do produto mudar:
- atualizar este arquivo no mesmo conjunto de mudanças;
- remover instruções obsoletas em vez de acumular contradições;
- registrar decisões temporárias como temporárias;
- nunca inserir segredos ou dados pessoais;
- manter a seção de arquitetura alinhada à estrutura real.

## 10. Instrução para agentes de IA e novos chats

Antes de responder ou executar qualquer tarefa de código neste repositório:
1. localize e leia `AGENTS.md` na raiz;
2. siga as regras deste documento;
3. consulte os arquivos atuais para confirmar o contexto;
4. se não conseguir ler este arquivo, **não faça alterações**: informe a limitação e solicite acesso/conteúdo.

**Resumo inegociável:** nunca trabalhar diretamente em produção ou na `main`; sempre desenvolver em uma branch separada de teste, gerar uma Preview, testar e obter a validação do responsável. Só então, mediante autorização explícita e específica, publicar em produção. Sem autorização, produção permanece intocada.
