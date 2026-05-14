# Dicionário de Dados — Sistema Cáritas

## Convenções
- PK: chave primária
- FK: chave estrangeira
- Tipo sugerido: sugestão para implementação

---

## Unidade
Descrição: representa uma unidade da organização, podendo ser Cáritas Diocesana ou Paróquia.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_unidade | INT | PK | Identificador único da unidade |
| id_endereco | INT | FK | Endereço principal da unidade |
| nome | VARCHAR(120) |  | Nome da unidade |
| email | VARCHAR(120) |  | E-mail institucional |
| telefone | VARCHAR(20) |  | Telefone principal da unidade |
| status |  ENUM |  | `ATIVA`,`INATIVA`|

## Pessoa
Descrição: entidade base para pessoas do sistema.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_pessoa | INT | PK | Identificador único da pessoa |
| id_endereco | INT | FK | Endereço principal da pessoa |
| nome | VARCHAR(120) |  | Nome completo |
| cpf | VARCHAR(14) |  | CPF da pessoa |
| genero | VARCHAR(20) / ENUM |  | Gênero da pessoa |
| email | VARCHAR(120) |  | E-mail da pessoa |
| data_nascimento | DATE |  | Data de nascimento |

## Assistido
Descrição: especialização de pessoa que recebe atendimento/apoio da Cáritas.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_pessoa | INT | PK/FK | Identificador da pessoa assistida |
| id_unidade | INT | FK | Unidade onde o assistido está vinculado |
| id_familia | INT | FK | Família à qual o assistido pertence |
| nome_mae | VARCHAR(120) |  | Nome da mãe |
| situacao_cadastral | VARCHAR(30) / ENUM |  | Situação do cadastro |
| data_cadastro | DATE |  | Data de cadastro |
| renda_pessoal | DECIMAL(10,2) |  | Renda pessoal informada |

OBSERVAÇÃO: O atributo nome_mae foi dado como necessario pois entra como um atributo que tem o objetivo de ajudar a identificar pessoas mesmo sem documento oficial como CPF.


## Colaborador
Descrição: especialização de pessoa que atua no sistema.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_pessoa | INT | PK/FK | Identificador da pessoa colaboradora |
| cargo | VARCHAR(80) |  | Cargo/função |
| nivel_acesso |  ENUM |  | ``ADMINISTRADOR ``,``ATENDENTE_SOCIAL``, ``RESPONSAVEL_ESTOQUE`` ``RESPONSAVEL_BAZAR`` |
| data_ingresso | DATE |  | Data de ingresso |
| ativo | BOOLEAN |  | Indica se está ativo |

## Familia
Descrição: representa o núcleo familiar associado a assistidos.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_familia | INT | PK | Identificador único da família |
| id_assistido_responsavel | INT | FK | Assistido responsável pela família |
| nome | VARCHAR(120) |  | Nome de identificação da família |
| data_cadastro | DATE |  | Data de cadastro |
| observacao_geral | TEXT |  | Observações gerais |

## ParceiroInstitucional
Descrição: representa instituições parceiras.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_parceiro_institucional | INT | PK | Identificador único do parceiro |
| nome | VARCHAR(120) |  | Nome da instituição |
| cnpj | VARCHAR(18) |  | CNPJ |
| email | VARCHAR(120) |  | E-mail institucional |
| telefone | VARCHAR(20) |  | Telefone |
| tipo_parceiro |  ENUM |  |`EMPRESA`,`FARMACIA`,`MERCADO`,`ONG`,`INSTITUICAO_RELIGIOSA`,`ORGAO_PUBLICO`
 |

## Contribuicao
Descrição: registro base de contribuições recebidas.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_contribuicao | INT | PK | Identificador único da contribuição |
| data_contribuicao | DATE |  | Data da contribuição |
| id_doador | INT | FK | Doador responsável |

## Item
Descrição: item genérico do sistema.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_item | INT | PK | Identificador único do item |
| nome | VARCHAR(120) |  | Nome do item |

## Vestimenta
Descrição: especialização de item para vestuário.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_item | INT | PK/FK | Identificador do item vestimenta |
| tamanho | ENUM|  | `PP`,`P`,`M`,`G`,`GG`,`XGG`,`G1`,`G2` |
| genero |  ENUM |  | `MASCULINO`,`FEMININO` |
| publico |  ENUM |  | `ADULTO`,`INFANTIL` |
| preco_sugerido | DECIMAL(10,2) |  | Preço sugerido para bazar |

## Alimento
Descrição: especialização de item para alimentos.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_item | INT | PK/FK | Identificador do item alimento |
| peso_unitario |  ENUM |  | `5KG`,`10KG`,`20KG` |

## Visita
Descrição: visita realizada a uma família.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_visita | INT | PK | Identificador da visita |
| id_familia | INT | FK | Família visitada |
| id_agendamento | INT | FK | Agendamento de origem |
| id_colaborador | INT | FK | Colaborador responsável |
| data_visita | DATE |  | Data da visita |
| encaminhamento | TEXT |  | Encaminhamentos definidos |
| observacao_geral | TEXT |  | Observações gerais |

## Agendamento
Descrição: agendamento realizado para visita a uma família.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_agendamento | INT | PK | Identificador do agendamento |
| id_colaborador | INT | FK | Colaborador responsável |
| id_familia | INT | FK | Família relacionada |
| data_agendamento | DATE |  | Data agendada |
| horario | TIME |  | Horário agendado |


## ConcessaoBeneficio
Descrição: registro base de concessão de benefício gerada a partir de um atendimento social.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_concessao_beneficio | INT | PK | Identificador da concessão |
| id_atendimento_social | INT | FK | Atendimento social que originou a concessão |
| id_necessidade | INT | FK | Necessidade atendida |
| data_concessao | DATE |  | Data da concessão |

## Estoque
Descrição: representa estoques pertencentes a unidades.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_estoque | INT | PK | Identificador do estoque |
| id_unidade | INT | FK | Unidade responsável pelo estoque |
| nome | VARCHAR(120) |  | Nome do estoque |
| descricao | TEXT |  | Descrição do estoque |

## Necessidade
Descrição: necessidade registrada por uma unidade.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_necessidade | INT | PK | Identificador da necessidade |
| id_unidade | INT | FK | Unidade que registrou a necessidade |
| descricao | TEXT |  | Descrição da necessidade |
| tipo_necessidade |  ENUM |  |`MATERIAL`,`FINANCEIRA` |
| valor_solicitado | DECIMAL(10,2) |  | Valor solicitado/estimado |
| data_registro | DATE |  | Data de registro |
| status_necessidade |  ENUM |  | `ATENDIDA`,`EM_ESPERA`,`URGENTE`|

## MovimentacaoEstoque
Descrição: movimentação de entrada ou saída de item em estoque.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_movimentacao_estoque | INT | PK | Identificador da movimentação |
| id_item_estoque | INT | FK | Registro de item armazenado afetado |
| id_contribuicao_material | INT | FK | Contribuição material de origem, se aplicável |
| id_concessao_material | INT | FK | Concessão material de origem, se aplicável |
| id_venda | INT | FK | Venda de origem, se aplicável |
| data_movimentacao | DATE |  | Data da movimentação |
| quantidade | INT |  | Quantidade movimentada |
| origem_movimentacao |  ENUM |  | `CONTRIBUICAO`,`CONCESSAO`,`VENDA`|
| tipo_movimentacao | ENUM |  | `ENTRADA`,`SAIDA`|

Regra: apenas um entre id_contribuicao_material, id_concessao_material e id_venda deve estar preenchido.

## AtendimentoSocial
Descrição: atendimento social realizado a um assistido.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_atendimento_social | INT | PK | Identificador do atendimento |
| id_unidade | INT | FK | Unidade responsável |
| id_assistido | INT | FK | Assistido atendido |
| id_colaborador | INT | FK | Colaborador responsável |
| data_atendimento | DATE |  | Data do atendimento |
| motivo_atendimento | VARCHAR(40) / ENUM |  | Motivo do atendimento |
| encaminhamento | TEXT |  | Encaminhamento realizado |
| observacao_geral | TEXT |  | Observações gerais |

## ContribuicaoFinanceira
Descrição: especialização de contribuição para doação financeira.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_contribuicao | INT | PK/FK | Identificador da contribuição |
| valor | DECIMAL(10,2) |  | Valor da contribuição financeira |
| forma_pagamento | ENUM |  | `PIX`,`DINHEIRO`,`TRANSFERENCIA_BANCARIA`|

## ContribuicaoMaterial
Descrição: especialização de contribuição para doação material.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_contribuicao | INT | PK/FK | Identificador da contribuição material |

## CaritasDiocesana
Descrição: especialização de unidade representando a Cáritas Diocesana.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_unidade | INT | PK/FK | Identificador da unidade do tipo Cáritas Diocesana |

## Paroquia
Descrição: especialização de unidade representando a Paróquia.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_unidade | INT | PK/FK | Identificador da unidade do tipo Paróquia |

## Caixa
Descrição: caixa financeiro da unidade.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_caixa | INT | PK | Identificador do caixa |
| id_unidade | INT | FK | Unidade responsável pelo caixa |
| nome | VARCHAR(120) |  | Nome do caixa |
| descricao | TEXT |  | Descrição do caixa |

## MovimentacaoFinanceira
Descrição: movimentação financeira central do sistema.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_movimentacao_financeira | INT | PK | Identificador da movimentação financeira |
| id_caixa | INT | FK | Caixa afetado |
| id_contribuicao_financeira | INT | FK | Contribuição financeira de origem, se aplicável |
| id_concessao_financeira | INT | FK | Concessão financeira de origem, se aplicável |
| id_venda | INT | FK | Venda de origem, se aplicável |
| data_movimentacao | DATE |  | Data da movimentação |
| valor | DECIMAL(10,2) |  | Valor movimentado |
| origem_movimentacao | VARCHAR(20) / ENUM |  | `CONTRIBUICAO`,`CONCESSAO`,`VENDA`|
| tipo_movimentacao | ENUM |  | `ENTRADA`,`SAIDA` |

Regra: apenas um entre id_contribuicao_financeira, id_concessao_financeira e id_venda deve estar preenchido.

## Bazar
Descrição: bazar pertencente a uma unidade.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_bazar | INT | PK | Identificador do bazar |
| id_unidade | INT | FK | Unidade responsável |
| nome | VARCHAR(120) |  | Nome do bazar |
| descricao | TEXT |  | Descrição do bazar |

## ConcessaoMaterial
Descrição: especialização de concessão de benefício do tipo material.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_concessao_beneficio | INT | PK/FK | Identificador da concessão material |

## ConcessaoFinanceira
Descrição: especialização de concessão de benefício do tipo financeiro.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_concessao_beneficio | INT | PK/FK | Identificador da concessão financeira |

## Venda
Descrição: venda realizada em bazar para um cliente.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_venda | INT | PK | Identificador da venda |
| id_bazar | INT | FK | Bazar onde a venda ocorreu |
| id_cliente | INT | FK | Cliente da venda |
| data_venda | DATE |  | Data da venda |
| valor_total | DECIMAL(10,2) |  | Valor total da venda |

## Cliente
Descrição: especialização de pessoa para compras no bazar.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_pessoa | INT | PK/FK | Identificador da pessoa cliente |

## ItemVenda
Descrição: itens vendidos em uma venda.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_venda | INT | PK/FK | Venda à qual o item pertence |
| id_item | INT | PK/FK | Item vendido |
| quantidade | INT |  | Quantidade vendida |
| valor_unitario | DECIMAL(10,2) |  | Valor unitário praticado |

## ItemContribuicaoMaterial
Descrição: itens que compõem uma contribuição material.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_contribuicao | INT | PK/FK | Contribuição material relacionada |
| id_item | INT | PK/FK | Item doado |
| quantidade | INT |  | Quantidade do item na contribuição |

## ItemNecessidade
Descrição: itens associados a uma necessidade.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_necessidade | INT | PK/FK | Necessidade relacionada |
| id_item | INT | PK/FK | Item necessário |
| quantidade | INT |  | Quantidade solicitada |

## Recibo
Descrição: recibo gerado a partir de uma venda.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_recibo | INT | PK | Identificador do recibo |
| id_venda | INT | FK | Venda associada ao recibo |

## Telefone
Descrição: telefones de pessoas.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_telefone | INT | PK | Identificador do telefone |
| id_pessoa | INT | FK | Pessoa proprietária do telefone |
| ddd | VARCHAR(3) |  | DDD |
| numero | VARCHAR(20) |  | Número do telefone |

## Endereco
Descrição: endereços do sistema.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_endereco | INT | PK | Identificador do endereço |
| rua | VARCHAR(120) |  | Rua |
| bairro | VARCHAR(80) |  | Bairro |
| numero | VARCHAR(10) |  | Número |
| cep | VARCHAR(10) |  | CEP |
| cidade | VARCHAR(80) |  | Cidade |

## UtensilioDomestico
Descrição: especialização de item para utensílios domésticos.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_item | INT | PK/FK | Identificador do utensílio doméstico |
| material |  ENUM |  | `INOX`,`AÇO`,`PLASTICO`,`MADEIRA`|

## Higiene
Descrição: especialização de item para produtos de higiene.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_item | INT | PK/FK | Identificador do item de higiene |
| unidade_medida | ENUM|  | `ML`,`G`,`UN`|

## ItemEstoque
Descrição: representa o item armazenado em um estoque específico.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_item_estoque | INT | PK | Identificador do item armazenado |
| id_item | INT | FK | Item armazenado |
| id_estoque | INT | FK | Estoque onde o item está armazenado |
| quantidade | INT |  | Quantidade disponível |
| data_validade | DATE |  | Data de validade, quando aplicável |

## Evento
Descrição: evento realizado por uma unidade e coordenado por um colaborador.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_evento | INT | PK | Identificador do evento |
| id_unidade | INT | FK | Unidade responsável |
| id_colaborador | INT | FK | Colaborador responsável |
| nome | VARCHAR(120) |  | Nome do evento |
| data_evento | DATE |  | Data do evento |
| descricao | TEXT |  | Descrição do evento |

## Doador
Descrição: entidade lógica para identificar quem realiza a contribuição.

| Campo | Tipo sugerido | Chave | Descrição |
|---|---|---|---|
| id_doador | INT | PK | Identificador do doador |
| tipo_doador | VARCHAR(30) / ENUM |  | Tipo do doador |
| id_pessoa | INT | FK | Pessoa doadora, quando aplicável |
| id_parceiro_institucional | INT | FK | Parceiro institucional doador, quando aplicável |

Regra: apenas um entre id_pessoa e id_parceiro_institucional deve estar preenchido.
