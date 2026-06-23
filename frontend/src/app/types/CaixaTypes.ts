export type CaixaMovementType = "in" | "out";

export interface Caixa {
  id: number;
  name: string;
  balance: number | string;
  created_at?: string;
  updated_at?: string;
}

export interface CaixaLog {
  id: number;
  cashbox_id: number;
  user_id?: number;
  family_id?: number | null;
  movement_type: CaixaMovementType;
  reason?: string | null;
  amount: number | string;
  created_at: string;
  cashbox?: {
    id: number;
    parish_id?: number;
    name: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CaixaMovimentacaoPayload {
  name: string;
  amount: number;
  movement_type: CaixaMovementType;
  reason?: string | null;
  family_id?: number | null;
}
