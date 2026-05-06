# Frontend - como rodar

## Pré-requisitos
- Node.js instalado
- npm instalado
- pnpm instalado globalmente

## Verificar versões
```powershell
node -v
npm -v
pnpm -v
```

## Entrar na pasta do frontend
```powershell
cd .\frontend
```

## Instalar dependências
```powershell
pnpm install
```

## Rodar em modo desenvolvimento
```powershell
pnpm dev
```

## Resultado esperado
O Vite deve subir o projeto e mostrar algo como:

```text
Local: http://localhost:5173/
```

Abra esse endereço no navegador.


## Observações
- O comando `pnpm dev` precisa ser executado dentro da pasta `frontend`
- Rodar `pnpm dev` na raiz do repositório não funciona se não houver `package.json` lá
- O script `dev` do projeto executa o Vite
