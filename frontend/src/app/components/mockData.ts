// Mock data for the Cáritas system

export interface FamilyMember {
  id: string;
  nome: string;
  cpf: string;
  parentesco: string;
  idade: number;
}

export interface Family {
  id: string;
  responsavel: {
    nome: string;
    cpf: string;
    telefone: string;
    endereco: string;
    cidade: string;
    bairro: string;
  };
  membros: FamilyMember[];
  dadosSocioeconomicos: {
    renda: string;
    moradia: string;
    necessidades: string[];
  };
  paroquia: string;
  dataCadastro: string;
  ultimoAtendimento?: string;
  beneficiosRecebidos: Benefit[];
}

export interface Benefit {
  id: string;
  data: string;
  paroquia: string;
  itens: { nome: string; quantidade: number }[];
  voluntario: string;
  observacoes?: string;
}

export interface Visit {
  id: string;
  familiaId: string;
  familiaNome: string;
  data: string;
  horario: string;
  voluntario: string;
  status: 'pendente' | 'agendada' | 'concluida' | 'cancelada';
  observacoes?: string;
  resultado?: string;
}

export interface StockItem {
  id: string;
  categoria: string;
  nome: string;
  quantidade: number;
  unidade: string;
  dataValidade?: string;
  lote?: string;
  localizacao: string;
  paroquia: string;
}

export interface StockMovement {
  id: string;
  tipo: 'entrada' | 'saida';
  data: string;
  itemId: string;
  itemNome: string;
  quantidade: number;
  responsavel: string;
  doador?: string;
  familia?: string;
  observacoes?: string;
}

export interface BazarItem {
  id: string;
  categoria: string;
  nome: string;
  descricao: string;
  preco: number;
  quantidade: number;
  tamanho?: string;
  cor?: string;
  condicao: string;
}

export interface BazarSale {
  id: string;
  data: string;
  itens: { itemId: string; nome: string; quantidade: number; preco: number }[];
  total: number;
  metodoPagamento: string;
  cliente?: {
    nome: string;
    telefone: string;
  };
  vendedor: string;
}

// Mock families
export const mockFamilies: Family[] = [
  {
    id: 'FAM001',
    responsavel: {
      nome: 'Maria da Silva Santos',
      cpf: '123.456.789-00',
      telefone: '(54) 99876-5432',
      endereco: 'Rua das Flores, 123',
      cidade: 'Caxias do Sul',
      bairro: 'São Pelegrino',
    },
    membros: [
      { id: 'M1', nome: 'João Santos', cpf: '987.654.321-00', parentesco: 'Esposo', idade: 45 },
      { id: 'M2', nome: 'Ana Silva', cpf: '456.789.123-00', parentesco: 'Filha', idade: 12 },
      { id: 'M3', nome: 'Pedro Silva', cpf: '789.123.456-00', parentesco: 'Filho', idade: 8 },
    ],
    dadosSocioeconomicos: {
      renda: 'Até 1 salário mínimo',
      moradia: 'Aluguel',
      necessidades: ['Alimentos', 'Roupas', 'Auxílio moradia'],
    },
    paroquia: 'Paróquia Sagrado Coração de Jesus',
    dataCadastro: '2024-01-15',
    ultimoAtendimento: '2026-04-10',
    beneficiosRecebidos: [
      {
        id: 'B1',
        data: '2026-04-10',
        paroquia: 'Paróquia Sagrado Coração de Jesus',
        itens: [
          { nome: 'Cesta Básica', quantidade: 1 },
          { nome: 'Roupas Infantis', quantidade: 5 },
        ],
        voluntario: 'João Silva',
        observacoes: 'Família em situação de vulnerabilidade',
      },
    ],
  },
  {
    id: 'FAM002',
    responsavel: {
      nome: 'José Oliveira',
      cpf: '234.567.890-11',
      telefone: '(54) 98765-4321',
      endereco: 'Avenida Central, 456',
      cidade: 'Caxias do Sul',
      bairro: 'Centro',
    },
    membros: [
      { id: 'M4', nome: 'Rosa Oliveira', cpf: '345.678.901-22', parentesco: 'Esposa', idade: 38 },
    ],
    dadosSocioeconomicos: {
      renda: '1 a 2 salários mínimos',
      moradia: 'Própria',
      necessidades: ['Alimentos'],
    },
    paroquia: 'Paróquia Nossa Senhora Aparecida',
    dataCadastro: '2024-03-20',
    beneficiosRecebidos: [],
  },
];

// Mock visits
export const mockVisits: Visit[] = [
  {
    id: 'V001',
    familiaId: 'FAM001',
    familiaNome: 'Maria da Silva Santos',
    data: '2026-04-25',
    horario: '14:00',
    voluntario: 'João Silva',
    status: 'agendada',
  },
  {
    id: 'V002',
    familiaId: 'FAM002',
    familiaNome: 'José Oliveira',
    data: '2026-04-26',
    horario: '10:00',
    voluntario: 'Maria Costa',
    status: 'pendente',
  },
];

// Mock stock items
export const mockStockItems: StockItem[] = [
  {
    id: 'ST001',
    categoria: 'Alimentos',
    nome: 'Arroz',
    quantidade: 50,
    unidade: 'kg',
    dataValidade: '2026-12-31',
    lote: 'L001',
    localizacao: 'Prateleira A1',
    paroquia: 'Paróquia Sagrado Coração de Jesus',
  },
  {
    id: 'ST002',
    categoria: 'Alimentos',
    nome: 'Feijão',
    quantidade: 35,
    unidade: 'pacotes 1kg',
    dataValidade: '2026-05-01',
    lote: 'L002',
    localizacao: 'Prateleira A2',
    paroquia: 'Paróquia Sagrado Coração de Jesus',
  },
  {
    id: 'ST003',
    categoria: 'Roupas',
    nome: 'Camiseta Masculina M',
    quantidade: 0,
    unidade: 'unidades',
    localizacao: 'Estante B1',
    paroquia: 'Paróquia Sagrado Coração de Jesus',
  },
  {
    id: 'ST004',
    categoria: 'Roupas',
    nome: 'Calça Infantil',
    quantidade: 0,
    unidade: 'unidades',
    localizacao: 'Estante B2',
    paroquia: 'Paróquia Sagrado Coração de Jesus',
  },
  {
    id: 'ST005',
    categoria: 'Alimentos',
    nome: 'Milho Verde',
    quantidade: 12,
    unidade: 'sachês',
    dataValidade: '2026-05-09',
    lote: 'L003',
    localizacao: 'Prateleira A3',
    paroquia: 'Paróquia Sagrado Coração de Jesus',
  },
];

// Mock stock movements
export const mockStockMovements: StockMovement[] = [
  {
    id: 'MOV001',
    tipo: 'entrada',
    data: '2026-04-20',
    itemId: 'ST001',
    itemNome: 'Arroz',
    quantidade: 50,
    responsavel: 'João Silva',
    doador: 'Supermercado ABC',
    observacoes: 'Doação mensal',
  },
  {
    id: 'MOV002',
    tipo: 'saida',
    data: '2026-04-10',
    itemId: 'ST001',
    itemNome: 'Arroz',
    quantidade: 10,
    responsavel: 'Maria Costa',
    familia: 'Maria da Silva Santos',
  },
];

// Mock bazar items
export const mockBazarItems: BazarItem[] = [
  {
    id: 'BZ001',
    categoria: 'Roupas',
    nome: 'Jaqueta Jeans',
    descricao: 'Jaqueta jeans feminina',
    preco: 35.0,
    quantidade: 3,
    tamanho: 'M',
    cor: 'Azul',
    condicao: 'Seminovo',
  },
  {
    id: 'BZ002',
    categoria: 'Roupas',
    nome: 'Calça Social',
    descricao: 'Calça social masculina',
    preco: 25.0,
    quantidade: 5,
    tamanho: 'G',
    cor: 'Preto',
    condicao: 'Bom estado',
  },
  {
    id: 'BZ003',
    categoria: 'Calçados',
    nome: 'Tênis Esportivo',
    descricao: 'Tênis esportivo unissex',
    preco: 45.0,
    quantidade: 2,
    tamanho: '39',
    cor: 'Branco',
    condicao: 'Seminovo',
  },
];

// Mock bazar sales
export const mockBazarSales: BazarSale[] = [
  {
    id: 'SALE001',
    data: '2026-04-24',
    itens: [
      { itemId: 'BZ001', nome: 'Jaqueta Jeans', quantidade: 1, preco: 35.0 },
      { itemId: 'BZ002', nome: 'Calça Social', quantidade: 2, preco: 25.0 },
    ],
    total: 85.0,
    metodoPagamento: 'Dinheiro',
    cliente: {
      nome: 'Ana Paula',
      telefone: '(54) 99123-4567',
    },
    vendedor: 'Davi Santos',
  },
];
