import { api } from "./api";

import type {
  AddParishInventoryItemQuantityPayload,
  BasketDeliveriesListResponse,
  BasketDelivery,
  BasketDeliveryFilters,
  BasketDeliveryResponse,
  BasketTemplate,
  BasketTemplateResponse,
  BasketTemplatesListResponse,
  CreateBasketDeliveryPayload,
  CreateBasketTemplatePayload,
  CreateParishInventoryItemPayload,
  CreateParishInventoryPayload,
  ExpiredItemsResponse,
  ItemsExpiringThisWeekResponse,
  ParishInventoriesListResponse,
  ParishInventory,
  ParishInventoryItem,
  ParishInventoryItemResponse,
  ParishInventoryItemsListResponse,
  ParishInventoryResponse,
  UpdateBasketTemplatePayload,
  UpdateParishInventoryItemPayload,
  UpdateParishInventoryPayload,
} from "../types/EstoqueTypes";

// -----------------------------------------------------------------------------
// Inventários paroquiais
// -----------------------------------------------------------------------------

/** Lista os inventários disponíveis no escopo do token autenticado. */
export async function listParishInventories(): Promise<ParishInventory[]> {
  const response = await api.get<ParishInventoriesListResponse>(
    "/parish-inventories",
  );

  return response.data.data;
}

/** Cria um inventário para uma paróquia. */
export async function createParishInventory(
  payload: CreateParishInventoryPayload,
): Promise<ParishInventory> {
  const response = await api.post<ParishInventoryResponse>(
    "/parish-inventories",
    payload,
  );

  return response.data.data;
}

/** Atualiza o nome e a descrição de um inventário paroquial. */
export async function updateParishInventory(
  parishInventoryId: number,
  payload: UpdateParishInventoryPayload,
): Promise<ParishInventory> {
  const response = await api.patch<ParishInventoryResponse>(
    `/parish-inventories/${parishInventoryId}`,
    payload,
  );

  return response.data.data;
}

/** Exclui um inventário. A API responde com HTTP 204 e sem conteúdo. */
export async function deleteParishInventory(
  parishInventoryId: number,
): Promise<void> {
  await api.delete(`/parish-inventories/${parishInventoryId}`);
}

// -----------------------------------------------------------------------------
// Itens e lotes
// -----------------------------------------------------------------------------

/** Lista os itens de inventário disponíveis no escopo do token. */
export async function listParishInventoryItems(): Promise<
  ParishInventoryItem[]
> {
  const response = await api.get<ParishInventoryItemsListResponse>(
    "/parish-inventory-items",
  );

  return response.data.data;
}

/** Cria um item e registra o primeiro lote com quantidade e validade. */
export async function createParishInventoryItem(
  payload: CreateParishInventoryItemPayload,
): Promise<ParishInventoryItem> {
  const response = await api.post<ParishInventoryItemResponse>(
    "/parish-inventory-items",
    payload,
  );

  return response.data.data;
}

/** Atualiza somente os dados cadastrais do item. */
export async function updateParishInventoryItem(
  parishInventoryItemId: number,
  payload: UpdateParishInventoryItemPayload,
): Promise<ParishInventoryItem> {
  const response = await api.patch<ParishInventoryItemResponse>(
    `/parish-inventory-items/${parishInventoryItemId}`,
    payload,
  );

  return response.data.data;
}

/**
 * Adiciona quantidade ao item com uma data de validade.
 * O backend atualiza automaticamente o total_quantity do item.
 */
export async function addParishInventoryItemQuantity(
  parishInventoryItemId: number,
  payload: AddParishInventoryItemQuantityPayload,
): Promise<ParishInventoryItem> {
  const response = await api.post<ParishInventoryItemResponse>(
    `/parish-inventory-items/${parishInventoryItemId}/quantities`,
    payload,
  );

  return response.data.data;
}

/** Exclui o item e seus lotes. */
export async function deleteParishInventoryItem(
  parishInventoryItemId: number,
): Promise<void> {
  await api.delete(`/parish-inventory-items/${parishInventoryItemId}`);
}

// -----------------------------------------------------------------------------
// Alertas de validade
// -----------------------------------------------------------------------------

/** Lista lotes com vencimento entre hoje e os próximos sete dias. */
export async function listItemsExpiringThisWeek(): Promise<ItemsExpiringThisWeekResponse> {
  const response = await api.get<ItemsExpiringThisWeekResponse>(
    "/valid-until-this-week",
  );

  return response.data;
}

/** Lista os lotes vencidos disponíveis no escopo do token. */
export async function listExpiredItems(): Promise<ExpiredItemsResponse> {
  const response = await api.get<ExpiredItemsResponse>("/expired-items");

  return response.data;
}

// -----------------------------------------------------------------------------
// Modelos de cesta
// -----------------------------------------------------------------------------

/** Lista os modelos de cesta disponíveis no escopo do token. */
export async function listBasketTemplates(): Promise<BasketTemplate[]> {
  const response =
    await api.get<BasketTemplatesListResponse>("/basket-templates");

  return response.data.data;
}

/** Retorna um modelo com seus itens, saldos e lotes disponíveis. */
export async function getBasketTemplate(
  basketTemplateId: number,
): Promise<BasketTemplate> {
  const response = await api.get<BasketTemplateResponse>(
    `/basket-templates/${basketTemplateId}`,
  );

  return response.data.data;
}

/** Cria um modelo de cesta para uma paróquia. */
export async function createBasketTemplate(
  payload: CreateBasketTemplatePayload,
): Promise<BasketTemplate> {
  const response = await api.post<BasketTemplateResponse>(
    "/basket-templates",
    payload,
  );

  return response.data.data;
}

/** Atualiza os dados e os itens de um modelo de cesta. */
export async function updateBasketTemplate(
  basketTemplateId: number,
  payload: UpdateBasketTemplatePayload,
): Promise<BasketTemplate> {
  const response = await api.patch<BasketTemplateResponse>(
    `/basket-templates/${basketTemplateId}`,
    payload,
  );

  return response.data.data;
}

/** Exclui um modelo de cesta. A API responde com HTTP 204. */
export async function deleteBasketTemplate(
  basketTemplateId: number,
): Promise<void> {
  await api.delete(`/basket-templates/${basketTemplateId}`);
}

// -----------------------------------------------------------------------------
// Entregas de cesta
// -----------------------------------------------------------------------------

/** Lista entregas e permite filtrar pelo identificador da família. */
export async function listBasketDeliveries(
  filters: BasketDeliveryFilters = {},
): Promise<BasketDelivery[]> {
  const response = await api.get<BasketDeliveriesListResponse>(
    "/basket-deliveries",
    { params: filters },
  );

  return response.data.data;
}

/** Retorna os detalhes de uma entrega e os lotes baixados. */
export async function getBasketDelivery(
  basketDeliveryId: number,
): Promise<BasketDelivery> {
  const response = await api.get<BasketDeliveryResponse>(
    `/basket-deliveries/${basketDeliveryId}`,
  );

  return response.data.data;
}

/**
 * Registra a entrega de uma cesta para uma família.
 * Esta é a única operação de saída de estoque implementada no sistema.
 */
export async function createBasketDelivery(
  payload: CreateBasketDeliveryPayload,
): Promise<BasketDelivery> {
  const response = await api.post<BasketDeliveryResponse>(
    "/basket-deliveries",
    payload,
  );

  return response.data.data;
}

/** Lista o histórico de cestas recebidas por uma família. */
export async function listFamilyBasketDeliveries(
  familyId: number,
): Promise<BasketDelivery[]> {
  const response = await api.get<BasketDeliveriesListResponse>(
    `/families/${familyId}/basket-deliveries`,
  );

  return response.data.data;
}
