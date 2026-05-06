Atue como um Senior UX/UI Designer. Seu objetivo é desenhar um sistema web responsivo (Desktop e Mobile) completo, robusto e de alta fidelidade, semelhante a um ERP social/institucional moderno. O sistema será utilizado pela Cáritas Diocesana de Caxias do Sul e suas paróquias afiliadas. É fundamental que a interface seja altamente intuitiva, com botões grandes e fluxos simplificados, pois parte significativa dos usuários voluntários possui baixa familiaridade com tecnologia.

Diretrizes Visuais Globais:

    Estilo: Moderno, limpo, institucional, humanizado e acolhedor, transmitindo confiança. Nível de produção de software real.

    Cores: * Primária: Azul Institucional (#1E3A8A) para transmitir confiança e guiar ações principais.

        Secundária: Verde Suave (#2E7D32) indicando acolhimento, ação social e sucesso.

        Background: Cinza Claro (#F5F5F5) para fundos e redução de cansaço visual.

        Superfícies: Branco predominante em cards, modais e formulários.

        Alertas: Amarelo suave/Laranja para pendências e avisos de estoque/validade.

    Layout Desktop: Utilizar Sidebar lateral esquerda fixa (menu de navegação principal), Header superior (informações do usuário logado, notificações rápidas e atalhos), área central de Dashboard organizada em Cards e tabelas de dados responsivas. Formulários devem ter múltiplas etapas (steppers) com hierarquia visual clara.

    Layout Mobile: Layout focado na operação em campo (ex: visitas domiciliares). Uso de Menu Hambúrguer ou Bottom Navigation para atalhos rápidos. Cards empilhados verticalmente em vez de tabelas complexas, botões de ação ("Call to Action") expandidos para facilitar o toque (acessibilidade).

ESTRUTURA DE MÓDULOS E PERMISSÕES:
O sistema deve exibir claramente a separação entre dois módulos, respeitando a autonomia jurídica das paróquias e a gestão diocesana:

    Módulo Cáritas Diocesana: Acesso administrativo e gerencial. Ampla visão de relatórios, controle geral de estoque , acompanhamento de campanhas e gestão completa do Bazar Diocesano.

    Módulo Cáritas Paroquial: Acesso operacional restrito aos dados da própria paróquia. Foco no atendimento local, cadastro de famílias, controle do próprio estoque de doações e registro de visitas domiciliares. O compartilhamento de dados entre paróquias serve apenas para visualização de benefícios recebidos via CPF único, prevenindo fraudes.

TELAS E FLUXOS A SEREM GERADOS (Gerar versões Desktop e Mobile para todas):

TELA OBRIGATÓRIA 0: Login Institucional

    Visual: Elegante, limpo e acolhedor. Logo da Cáritas em grande destaque no topo do card central. Fundo com imagem humanizada com overlay suave ou padrão geométrico clean.

    Componentes: Título de boas-vindas. Duas opções de acesso em formato de cards ou botões grandes com ícones: "Entrar como Cáritas Diocesana" e "Entrar como Cáritas Paroquial". Após o clique, exibir campos de Usuário/CPF, Senha e botão primário de "Acessar".

FLUXO 1: Cadastro de Núcleos Familiares (Foco em evitar duplicidade )

    Tela 1.1 - Busca: Input de busca gigante por CPF ou Nome para verificar existência na rede. Botão "Novo Cadastro Familiar" caso não exista.

    Tela 1.2 - Wizard de Cadastro (Step 1 - Responsável): Formulário limpo com dados do responsável (Nome, CPF, Contato, Endereço).

    Tela 1.3 - Wizard (Step 2 - Membros): Tabela/Lista interativa para adicionar dependentes e grau de parentesco.

    Tela 1.4 - Wizard (Step 3 - Socioeconômico): Checkboxes e selects grandes sobre vulnerabilidade (renda, moradia, necessidades urgentes).

    Tela 1.5 - Revisão: Card de resumo dos dados e botão de sucesso "Confirmar Cadastro".

FLUXO 2: Visita Domiciliar (Para voluntários em campo )

    Tela 2.1 - Agenda: Dashboard listando famílias com visitas pendentes  e calendário de agendamentos.

    Tela 2.2 - Perfil/Histórico: View da família com timeline vertical de últimos atendimentos.

    Tela 2.3 - Agendamento: Modal simples para definir data, hora e voluntário.

    Tela 2.4 - Execução/Formulário: Tela mobile-first para o voluntário registrar observações in loco, status da visita e anexar anotações.

FLUXO 3: Concessão de Benefícios (Distribuição de doações )

    Tela 3.1 - Solicitação: Perfil da família com alerta visual se já receberam benefício recente em outra paróquia.

    Tela 3.2 - Seleção de Itens: Catálogo visual (cards) do estoque atual. Botões de "+" e "-" para selecionar cesta básica, roupas, etc.

    Tela 3.3 - Fechamento: Resumo da entrega, input para justificativa/análise social e botão de geração de comprovante digital.

FLUXO 4: Controle de Estoque Paroquial (Foco em validade e contagem )

    Tela 4.1 - Dashboard de Estoque: Visão geral. Banners de alerta amarelos/vermelhos no topo: "Itens em Falta" e "Validade Próxima". Tabela de itens com lotes e saldos.

    Tela 4.2 - Entrada: Formulário de recebimento (Doador, Categoria, Quantidade, Data de Validade).

    Tela 4.3 - Histórico: Timeline de entradas (doações recebidas) e saídas (benefícios entregues).

FLUXO 5: Venda no Bazar Diocesano (Fonte de receita, necessita interface de PDV )

    Tela 5.1 - Dashboard Bazar: KPIs rápidos (vendas do dia, itens vendidos, arrecadação).

    Tela 5.2 - Estoque Bazar: Grid de itens precificados e categorizados (roupas, calçados).

    Tela 5.3 - PDV (Frente de Caixa): Interface de tela dividida. Esquerda: itens sendo bipados/buscados (carrinho). Direita: Input de cadastro rápido do cliente, seleção de método de pagamento em botões gigantes (Dinheiro, Cartão, Pix).

    Tela 5.4 - Conclusão: Exibição do recibo não-fiscal gerado e botão "Nova Venda", com confirmação visual de caixa e estoque atualizados.