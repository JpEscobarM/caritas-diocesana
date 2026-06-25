# Cáritas Diocesana — Frontend

Frontend do sistema **Cáritas Diocesana**, desenvolvido como projeto acadêmico na disciplina de **Laboratório de Software**, com o objetivo de apoiar a gestão de doações, famílias acompanhadas, paróquias, visitas, estoque, entregas de cestas, caixa e demais funcionalidades administrativas.

O projeto busca aplicar, em um contexto real, práticas de desenvolvimento de software voltadas ao levantamento de requisitos, organização de funcionalidades, implementação, validação e entrega de uma solução com impacto social.

## Projeto acadêmico

Este sistema foi desenvolvido por estudantes como parte das atividades da disciplina de **Laboratório de Software**, em parceria com a **Cáritas de Caxias do Sul**.

## Equipe

| Integrante                 | GitHub                                                 |
| -------------------------- | ------------------------------------------------------ |
| Anderson Pastore Rizzi     | [@andersonprizzi](https://github.com/andersonprizzi)   |
| Davi dos Santos            | [@Davi193](https://github.com/Davi193)                 |
| João Paulo Escobar Martins | [@JpEscobarM](https://github.com/JpEscobarM)           |
| Lucas Schiochet            | [@LucasSchiochet2](https://github.com/LucasSchiochet2) |
| Yuri Sabedot Venturin      | [@YSVenturin](https://github.com/YSVenturin)           |

## Links do projeto

- **Frontend:** este repositório
- **Backend:** https://github.com/LucasSchiochet2/caritas-system

## Tecnologias utilizadas

- React
- TypeScript
- Vite
- Tailwind CSS
- Axios
- pnpm

## Funcionalidades principais

O sistema Cáritas Diocesana possui funcionalidades voltadas para o acompanhamento e organização das atividades realizadas pela diocese e pelas paróquias.

Entre os principais módulos estão:

- autenticação por tipo de acesso;
- painel geral da diocese;
- painel geral da paróquia;
- gestão de paróquias;
- gestão de usuários;
- cadastro e acompanhamento de núcleos familiares;
- gestão de visitas;
- estoque paroquial;
- entregas de cestas;
- movimentações de caixa da paróquia.

## Pré-requisitos

Antes de iniciar o projeto, é necessário ter instalado:

- Node.js
- npm
- pnpm instalado globalmente

Para verificar as versões instaladas:

```powershell
node -v
npm -v
pnpm -v
```

Caso o `pnpm` não esteja instalado, execute:

```powershell
npm install -g pnpm
```

## Instalação das dependências

Dentro da pasta `frontend`, execute:

```powershell
pnpm install
```

## Rodando o projeto em desenvolvimento

Para iniciar o ambiente de desenvolvimento:

```powershell
pnpm dev
```

O Vite deve iniciar o projeto e exibir no terminal um endereço parecido com:

```text
Local: http://localhost:5173/
```

Abra esse endereço no navegador para acessar o sistema.

## Build de produção

Para gerar a versão de produção:

```powershell
pnpm build
```

Os arquivos finais serão gerados na pasta:

```text
dist/
```

A pasta `dist` contém o frontend compilado, otimizado e pronto para publicação em um servidor web, como Nginx, Apache, IIS, cPanel, Vercel, Netlify ou outro serviço de hospedagem estática.

## Pré-visualizar build localmente

Após gerar o build, é possível pré-visualizar a versão de produção com:

```powershell
pnpm preview
```

## Estrutura principal do projeto

```text
frontend/
├── src/
│   └── app/
│       ├── api/            # Funções de integração com a API
│       ├── components/     # Componentes reutilizáveis
│       ├── config/         # Configurações e permissões
│       ├── pages/          # Páginas principais do sistema
│       ├── types/          # Tipagens TypeScript
│       └── utils/          # Funções auxiliares
├── public/
├── .env
├── package.json
├── pnpm-lock.yaml
└── vite.config.ts
```

## Scripts disponíveis

```powershell
pnpm dev
```

Inicia o projeto em modo desenvolvimento.

```powershell
pnpm build
```

Gera os arquivos finais para produção.

```powershell
pnpm preview
```

Executa uma prévia local do build de produção.

```powershell
pnpm lint
```

Executa a verificação de lint, caso configurada no projeto.

## Fluxo básico para rodar o projeto

```powershell
cd .\frontend
pnpm install
pnpm dev
```

Depois, acesse:

```text
http://localhost:5173/
```

## Screenshots

### Tela inicial

![Tela inicial](docs/images/tela-inicial.png)

### Painel geral da diocese

![Painel geral da diocese](docs/images/painel-diocesano.png)

### Painel geral da paróquia

![Painel geral da paróquia](docs/images/painel-paroquial.png)

## Finalidade

Este projeto tem finalidade acadêmica e social, aproximando a universidade da comunidade por meio do desenvolvimento de uma solução tecnológica voltada ao apoio das atividades realizadas pela Cáritas Diocesana de Caxias do Sul.
