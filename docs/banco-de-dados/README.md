# Banco de Dados

Documentação da modelagem de banco de dados do sistema da Cáritas.

## Conteúdo

Este diretório reúne os principais artefatos da modelagem:

- **Modelo conceitual**: visão de alto nível das entidades, relacionamentos, cardinalidades e especializações.
- **Modelo lógico**: representação textual/estruturada das tabelas, atributos, PKs e FKs.
- **Dicionário de dados**: definição dos campos, tipos, chaves e regras de negócio.

## Arquivos

- `modelo-conceitual.pdf` ou [modelo_conceitual](https://app.brmodeloweb.com/publicview/69f64a013150233f95850428)
- `modelo-logico.svg`
- `dicionario_dados_caritas.md`

## Organização da modelagem

A modelagem contempla, entre outros, os seguintes blocos do domínio:

- unidades (`Unidade`, `CaritasDiocesana`, `Paroquia`)
- pessoas (`Pessoa`, `Assistido`, `Colaborador`, `Cliente`)
- contribuições (`Contribuicao`, `ContribuicaoFinanceira`, `ContribuicaoMaterial`, `Doador`)
- estoque (`Estoque`, `ItemEstoque`, `MovimentacaoEstoque`)
- bazar e vendas (`Bazar`, `Venda`, `ItemVenda`, `Recibo`)
- atendimento social (`AtendimentoSocial`, `Necessidade`, `ConcessaoBeneficio`)
- financeiro (`Caixa`, `MovimentacaoFinanceira`)

## Convenções adotadas

No modelo lógico textual:

- `PK` representa chave primária
- `FK` representa chave estrangeira
- enums são descritos no dicionário de dados
- tabelas associativas podem utilizar chave composta quando necessário

## Observações

- `MovimentacaoFinanceira` centraliza entradas e saídas financeiras.
- `MovimentacaoEstoque` centraliza entradas e saídas de itens em estoque.
- `ConcessaoBeneficio` atende uma `Necessidade` vinculada a uma `Unidade` ou a um `Assistido`, no contexto de um `AtendimentoSocial`, e pode ser especializada em `ConcessaoMaterial` ou `ConcessaoFinanceira`.
- `ItemEstoque` permite diferenciar o mesmo item em estoque quando houver datas de validade diferentes.

## Referências

Para detalhes completos de atributos, tipos e regras:
- consulte `dicionario_dados_caritas.md`
- consulte o arquivo do modelo conceitual
- consulte o arquivo do modelo lógico