/**
 * Tipos do módulo de estoque da Cáritas Diocesana.
 *
 * Regras principais:
 * - a diocese gerencia os estoques das paróquias, mas não possui estoque próprio;
 * - a entrada ocorre pela criação do item com o primeiro lote ou pela adição de lote;
 * - o total do item é calculado e atualizado pelo backend;
 * - a saída ocorre exclusivamente por entrega de cesta a uma família.
 */

export type ISODateString = string;
export type ISODateTimeString = string;

export interface ApiDataResponse<T> {
  data: T;
}

export interface ApiListResponse<T> {
  data: T[];
}

export interface ApiValidationErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

// -----------------------------------------------------------------------------
// Inventários paroquiais
// -----------------------------------------------------------------------------

export interface ParishInventory {
  id: number;
  parish_id: number;
  name: string;
  description: string | null;
  created_at: ISODateTimeString;
  updated_at: ISODateTimeString;
}

interface CreateParishInventoryBasePayload {
  name: string;
  description?: string | null;
}

/**
 * Token da diocese: parish_id é obrigatório.
 * Token paroquial: parish_id deve ser omitido; o backend usa a paróquia da sessão.
 */
export type CreateParishInventoryPayload =
  | (CreateParishInventoryBasePayload & { parish_id: number })
  | (CreateParishInventoryBasePayload & { parish_id?: never });

export interface UpdateParishInventoryPayload {
  name?: string;
  description?: string | null;
}

export type ParishInventoryResponse = ApiDataResponse<ParishInventory>;
export type ParishInventoriesListResponse = ApiListResponse<ParishInventory>;

// -----------------------------------------------------------------------------
// Itens e lotes
// -----------------------------------------------------------------------------

export interface ParishInventoryItemQuantity {
  id: number;
  quantity: number;
  valid_until: ISODateString;
  created_at: ISODateTimeString;
  updated_at: ISODateTimeString;
}

export interface ParishInventoryItem {
  id: number;
  name: string;
  description: string | null;
  parish_inventory_id: number;
  total_quantity: number;
  quantities: ParishInventoryItemQuantity[];
  created_at: ISODateTimeString;
  updated_at: ISODateTimeString;
}

export interface CreateParishInventoryItemPayload {
  parish_inventory_id: number;
  name: string;
  description?: string | null;
  quantity: number;
  valid_until: ISODateString;
}

export interface UpdateParishInventoryItemPayload {
  name?: string;
  description?: string | null;
}

export interface AddParishInventoryItemQuantityPayload {
  quantity: number;
  valid_until: ISODateString;
}

export type ParishInventoryItemResponse = ApiDataResponse<ParishInventoryItem>;
export type ParishInventoryItemsListResponse =
  ApiListResponse<ParishInventoryItem>;

// -----------------------------------------------------------------------------
// Alertas de validade
// -----------------------------------------------------------------------------

export interface ExpiringParishInventoryItem extends ParishInventoryItem {
  valid_until_quantity: number;
}

export interface ExpiredParishInventoryItem extends ParishInventoryItem {
  expired_quantity: number;
}

export interface ItemsExpiringThisWeekResponse {
  valid_until_items_count: number;
  valid_until_total_quantity: number;
  data: ExpiringParishInventoryItem[];
}

export interface ExpiredItemsResponse {
  expired_items_count: number;
  expired_total_quantity: number;
  data: ExpiredParishInventoryItem[];
}

// -----------------------------------------------------------------------------
// Modelos de cesta
// -----------------------------------------------------------------------------

export interface BasketTemplateAvailableQuantity {
  id: number;
  quantity: number;
  valid_until: ISODateString;
}

export interface BasketTemplateItem {
  id: number;
  parish_inventory_item_id: number;
  name: string;
  quantity: number;
  available_total_quantity: number;
  quantities: BasketTemplateAvailableQuantity[];
}

export interface BasketTemplate {
  id: number;
  parish_id: number;
  name: string;
  description: string | null;
  active: boolean;
  items: BasketTemplateItem[];
  created_at: ISODateTimeString;
  updated_at: ISODateTimeString;
}

export interface BasketTemplatePayloadItem {
  parish_inventory_item_id: number;
  quantity: number;
}

export interface CreateBasketTemplatePayload {
  parish_id: number;
  name: string;
  description?: string | null;
  items: BasketTemplatePayloadItem[];
}

export interface UpdateBasketTemplatePayload {
  name?: string;
  description?: string | null;
  active?: boolean;
  items?: BasketTemplatePayloadItem[];
}

export type BasketTemplateResponse = ApiDataResponse<BasketTemplate>;
export type BasketTemplatesListResponse = ApiListResponse<BasketTemplate>;

// -----------------------------------------------------------------------------
// Entregas de cesta
// -----------------------------------------------------------------------------

export interface BasketDeliveryItem {
  id: number;
  parish_inventory_item_id: number;
  parish_inventory_item_quantity_id: number;
  name: string;
  quantity: number;
  valid_until: ISODateString;
}

export interface BasketDelivery {
  id: number;
  parish_id: number;
  family_id: number;
  family_name: string;
  basket_template_id: number | null;
  basket_template_name: string | null;
  delivered_at: ISODateTimeString;
  notes: string | null;
  items: BasketDeliveryItem[];
  created_at: ISODateTimeString;
  updated_at: ISODateTimeString;
}

/**
 * Item informado diretamente. O backend escolhe os lotes com menor validade
 * primeiro quando parish_inventory_item_quantity_id não é enviado.
 */
export interface BasketDeliveryItemByInventoryItemPayload {
  parish_inventory_item_id: number;
  parish_inventory_item_quantity_id?: number;
  quantity: number;
}

/** Item informado por um lote específico. */
export interface BasketDeliveryItemByQuantityPayload {
  parish_inventory_item_quantity_id: number;
  parish_inventory_item_id?: number;
  quantity: number;
}

/** Garante que pelo menos o item ou o lote seja informado. */
export type CreateBasketDeliveryItemPayload =
  | BasketDeliveryItemByInventoryItemPayload
  | BasketDeliveryItemByQuantityPayload;

interface CreateBasketDeliveryBasePayload {
  family_id: number;
  delivered_at?: ISODateTimeString;
  notes?: string | null;
}

/** Entrega baseada em um modelo, com ou sem ajustes nos itens. */
export type CreateBasketDeliveryFromTemplatePayload =
  CreateBasketDeliveryBasePayload & {
    basket_template_id: number;
    items?: CreateBasketDeliveryItemPayload[];
  };

/** Cesta montada na hora, sem modelo predefinido. */
export type CreateCustomBasketDeliveryPayload =
  CreateBasketDeliveryBasePayload & {
    basket_template_id?: never;
    items: CreateBasketDeliveryItemPayload[];
  };

export type CreateBasketDeliveryPayload =
  | CreateBasketDeliveryFromTemplatePayload
  | CreateCustomBasketDeliveryPayload;

export interface BasketDeliveryFilters {
  family_id?: number;
}

export type BasketDeliveryResponse = ApiDataResponse<BasketDelivery>;
export type BasketDeliveriesListResponse = ApiListResponse<BasketDelivery>;
