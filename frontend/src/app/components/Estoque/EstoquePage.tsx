import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRightLeft,
  Boxes,
  ClipboardList,
  Gift,
  Loader2,
  RefreshCcw,
  Warehouse,
} from "lucide-react";
import { toast } from "sonner";

import { getAuthSession } from "../../api/auth";
import { listFamilies } from "../../api/families";
import { listParishes } from "../../api/parishes";
import {
  addParishInventoryItemQuantity,
  createBasketDelivery,
  createBasketTemplate,
  createParishInventory,
  createParishInventoryItem,
  createParishInventoryRepasse,
  deleteBasketTemplate,
  deleteParishInventory,
  deleteParishInventoryItem,
  getParishInventoryRepasse,
  listBasketDeliveries,
  listBasketTemplates,
  listFamilyBasketDeliveries,
  listExpiredItems,
  listItemsExpiringThisWeek,
  listParishInventories,
  listParishInventoryItems,
  listParishInventoryItemsByParish,
  listParishInventoryRepasses,
  updateBasketTemplate,
  updateParishInventory,
  updateParishInventoryItem,
} from "../../api/estoque";
import type {
  BasketDelivery,
  CreateParishInventoryRepassePayload,
  CreateBasketDeliveryPayload,
  BasketTemplate,
  ExpiredParishInventoryItem,
  ExpiringParishInventoryItem,
  AddParishInventoryItemQuantityPayload,
  ParishInventory,
  ParishInventoryItem,
  ParishInventoryRepasse,
} from "../../types/EstoqueTypes";
import type { Family, Parish } from "../../types/types";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import AdicionarLoteModal from "./AdicionarLoteModal";
import AlertasValidade from "./AlertasValidade";
import DetalheEntregaDialog from "./DetalheEntregaDialog";
import DetalheRepasseDialog from "./DetalheRepasseDialog";
import EntregasCestaList from "./EntregasCestaList";
import HistoricoFamiliaModal from "./HistoricoFamiliaModal";
import EstoqueResumo from "./EstoqueResumo";
import ExcluirInventarioDialog from "./ExcluirInventarioDialog";
import ExcluirItemInventarioDialog from "./ExcluirItemInventarioDialog";
import ExcluirModeloCestaDialog from "./ExcluirModeloCestaDialog";
import InventarioForm, {
  type InventarioFormValues,
} from "./InventarioForm";
import InventariosList from "./InventariosList";
import ItemInventarioForm, {
  type ItemInventarioFormValues,
} from "./ItemInventarioForm";
import ItensInventarioList from "./ItensInventarioList";
import ModeloCestaForm, {
  type ModeloCestaFormValues,
} from "./ModeloCestaForm";
import ModelosCestaList from "./ModelosCestaList";
import RegistrarEntregaModal from "./RegistrarEntregaModal";
import RepasseEstoqueForm from "./RepasseEstoqueForm";
import RepassesEstoqueList from "./RepassesEstoqueList";
import ResumoEstoqueDiocese from "./ResumoEstoqueDiocese";

export type EstoqueMode = "diocese" | "paroquia";

type EstoqueSection =
  | "visao-geral"
  | "inventarios"
  | "validade"
  | "modelos"
  | "repasses"
  | "entregas";

export interface EstoquePageProps {
  modo: EstoqueMode;
  parishId?: number;
  parishName?: string;
  readOnlyParishLookup?: boolean;
}

interface EstoqueData {
  inventories: ParishInventory[];
  items: ParishInventoryItem[];
  expiringItems: ExpiringParishInventoryItem[];
  expiredItems: ExpiredParishInventoryItem[];
  templates: BasketTemplate[];
  repasses: ParishInventoryRepasse[];
  deliveries: BasketDelivery[];
}

const EMPTY_DATA: EstoqueData = {
  inventories: [],
  items: [],
  expiringItems: [],
  expiredItems: [],
  templates: [],
  repasses: [],
  deliveries: [],
};

const DIOCESE_ALL_PARISHES_VALUE = "__all_parishes__";

const SECTIONS: Array<{
  id: EstoqueSection;
  label: string;
  icon: typeof Warehouse;
}> = [
  { id: "visao-geral", label: "Visão geral", icon: Warehouse },
  { id: "inventarios", label: "Inventários e itens", icon: Boxes },
  { id: "validade", label: "Validade", icon: AlertTriangle },
  { id: "modelos", label: "Modelos de cesta", icon: ClipboardList },
  { id: "repasses", label: "Repasses", icon: ArrowRightLeft },
  { id: "entregas", label: "Entregas", icon: Gift },
];

function sortInventories(inventories: ParishInventory[]): ParishInventory[] {
  return [...inventories].sort((first, second) =>
    first.name.localeCompare(second.name, "pt-BR"),
  );
}

function sortItems(items: ParishInventoryItem[]): ParishInventoryItem[] {
  return [...items].sort((first, second) => {
    const inventoryComparison =
      first.parish_inventory_id - second.parish_inventory_id;

    if (inventoryComparison !== 0) {
      return inventoryComparison;
    }

    return first.name.localeCompare(second.name, "pt-BR");
  });
}

function sortTemplates(templates: BasketTemplate[]): BasketTemplate[] {
  return [...templates].sort((first, second) => {
    if (first.active !== second.active) {
      return first.active ? -1 : 1;
    }

    return first.name.localeCompare(second.name, "pt-BR");
  });
}

function sortRepasses(
  repasses: ParishInventoryRepasse[],
): ParishInventoryRepasse[] {
  return [...repasses].sort(
    (first, second) =>
      new Date(second.delivered_at).getTime() -
      new Date(first.delivered_at).getTime(),
  );
}

function syncTemplateItemWithInventoryItem(
  template: BasketTemplate,
  inventoryItem: ParishInventoryItem,
): BasketTemplate {
  return {
    ...template,
    items: template.items.map((item) =>
      item.parish_inventory_item_id === inventoryItem.id
        ? {
            ...item,
            name: inventoryItem.name,
            available_total_quantity: inventoryItem.total_quantity,
            quantities: inventoryItem.quantities.map((quantity) => ({
              id: quantity.id,
              quantity: quantity.quantity,
              valid_until: quantity.valid_until,
            })),
          }
        : item,
    ),
  };
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined;

    if (status === 401) {
      return "Sua sessão expirou. Entre novamente para continuar.";
    }

    if (status === 403) {
      return "Seu usuário não possui permissão para acessar ou alterar este estoque.";
    }

    if (data?.errors) {
      return Object.values(data.errors).flat().join(" ");
    }

    if (data?.message) {
      return data.message;
    }
  }

  return fallback;
}

export default function EstoquePage({
  modo,
  parishId,
  parishName,
  readOnlyParishLookup = false,
}: EstoquePageProps) {
  const session = getAuthSession();
  const sessionParishId = session?.parish?.id;
  const sessionParishName = session?.parish?.name;

  const [section, setSection] = useState<EstoqueSection>("visao-geral");
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [selectedParishId, setSelectedParishId] = useState<number | null>(
    readOnlyParishLookup
      ? null
      : modo === "paroquia"
        ? parishId ?? sessionParishId ?? null
        : parishId ?? null,
  );
  const [selectedInventoryId, setSelectedInventoryId] = useState<number | null>(
    null,
  );
  const [data, setData] = useState<EstoqueData>(EMPTY_DATA);
  const [itemParishIds, setItemParishIds] = useState<Record<number, number>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingParishItemsId, setLoadingParishItemsId] = useState<
    number | null
  >(null);

  const [inventoryFormOpen, setInventoryFormOpen] = useState(false);
  const [inventoryBeingEdited, setInventoryBeingEdited] =
    useState<ParishInventory | null>(null);
  const [savingInventory, setSavingInventory] = useState(false);
  const [inventoryFormError, setInventoryFormError] = useState<string | null>(
    null,
  );

  const [inventoryBeingDeleted, setInventoryBeingDeleted] =
    useState<ParishInventory | null>(null);
  const [deletingInventory, setDeletingInventory] = useState(false);
  const [deleteInventoryError, setDeleteInventoryError] = useState<
    string | null
  >(null);

  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [itemBeingEdited, setItemBeingEdited] =
    useState<ParishInventoryItem | null>(null);
  const [savingItem, setSavingItem] = useState(false);
  const [itemFormError, setItemFormError] = useState<string | null>(null);

  const [itemBeingDeleted, setItemBeingDeleted] =
    useState<ParishInventoryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState(false);
  const [deleteItemError, setDeleteItemError] = useState<string | null>(null);

  const [itemReceivingEntry, setItemReceivingEntry] =
    useState<ParishInventoryItem | null>(null);
  const [savingEntry, setSavingEntry] = useState(false);
  const [entryFormError, setEntryFormError] = useState<string | null>(null);

  const [templateFormOpen, setTemplateFormOpen] = useState(false);
  const [templateBeingEdited, setTemplateBeingEdited] =
    useState<BasketTemplate | null>(null);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateFormError, setTemplateFormError] = useState<string | null>(
    null,
  );

  const [templateBeingDeleted, setTemplateBeingDeleted] =
    useState<BasketTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState(false);
  const [deleteTemplateError, setDeleteTemplateError] = useState<
    string | null
  >(null);
  const [togglingTemplateId, setTogglingTemplateId] = useState<number | null>(
    null,
  );

  const [families, setFamilies] = useState<Family[]>([]);
  const [familiesLoadError, setFamiliesLoadError] = useState<string | null>(
    null,
  );
  const [deliveryFormOpen, setDeliveryFormOpen] = useState(false);
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [deliveryFormError, setDeliveryFormError] = useState<string | null>(
    null,
  );
  const [deliveryBeingViewed, setDeliveryBeingViewed] =
    useState<BasketDelivery | null>(null);
  const [repasseFormOpen, setRepasseFormOpen] = useState(false);
  const [savingRepasse, setSavingRepasse] = useState(false);
  const [repasseFormError, setRepasseFormError] = useState<string | null>(null);
  const [repasseBeingViewed, setRepasseBeingViewed] =
    useState<ParishInventoryRepasse | null>(null);
  const [loadingRepasseDetails, setLoadingRepasseDetails] = useState(false);
  const [repasseDetailsError, setRepasseDetailsError] = useState<string | null>(
    null,
  );
  const [familyHistoryTarget, setFamilyHistoryTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [familyHistoryDeliveries, setFamilyHistoryDeliveries] = useState<
    BasketDelivery[]
  >([]);
  const [loadingFamilyHistory, setLoadingFamilyHistory] = useState(false);
  const [familyHistoryError, setFamilyHistoryError] = useState<string | null>(
    null,
  );

  async function loadData(showSuccessMessage = false) {
    try {
      if (showSuccessMessage) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const shouldLoadOperationalData =
        modo === "paroquia" && !readOnlyParishLookup;
      const parishPromise =
        modo === "diocese"
          ? listParishes()
          : listParishes().catch(() => (session?.parish ? [session.parish] : []));
      const familiesPromise =
        shouldLoadOperationalData
          ? listFamilies(true, 1000)
              .then((familyData) => ({
                familyData,
                familyError: null as string | null,
              }))
              .catch((error: unknown) => ({
                familyData: [] as Family[],
                familyError: getErrorMessage(
                  error,
                  "Nao foi possivel carregar as familias disponiveis para entrega.",
                ),
              }))
          : Promise.resolve({
              familyData: [] as Family[],
              familyError: null as string | null,
            });

      const [
        parishData,
        inventories,
        items,
        expiringResponse,
        expiredResponse,
        templates,
        repasses,
        deliveries,
        familyResult,
      ] = await Promise.all([
        parishPromise,
        listParishInventories(),
        listParishInventoryItems(),
        listItemsExpiringThisWeek(),
        listExpiredItems(),
        shouldLoadOperationalData ? listBasketTemplates() : Promise.resolve([]),
        shouldLoadOperationalData
          ? listParishInventoryRepasses()
          : Promise.resolve([]),
        shouldLoadOperationalData ? listBasketDeliveries() : Promise.resolve([]),
        familiesPromise,
      ]);

      const activeParishes = parishData
        .filter((parish) => parish.active)
        .sort((first, second) =>
          first.name.localeCompare(second.name, "pt-BR"),
        );

      setParishes(activeParishes);
      setFamilies(
        familyResult.familyData
          .filter((family) => family.is_active !== false)
          .sort((first, second) =>
            first.name.localeCompare(second.name, "pt-BR"),
          ),
      );
      setFamiliesLoadError(familyResult.familyError);
      setData({
        inventories: sortInventories(inventories),
        items: sortItems(items),
        expiringItems: expiringResponse.data,
        expiredItems: expiredResponse.data,
        templates: sortTemplates(templates),
        repasses: sortRepasses(repasses),
        deliveries,
      });

      if (showSuccessMessage) {
        toast.success("Estoque atualizado com sucesso.");
      }
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Não foi possível carregar o estoque. Tente novamente.",
        ),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadData();
    // A carga inicial deve acontecer apenas quando o contexto do módulo mudar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo, readOnlyParishLookup]);

  useEffect(() => {
    if (modo === "paroquia" && !readOnlyParishLookup) {
      setSelectedParishId(parishId ?? sessionParishId ?? null);
    }
  }, [modo, parishId, readOnlyParishLookup, sessionParishId]);

  async function loadParishInventoryItems(
    parishIdToLoad: number,
  ): Promise<boolean> {
    const previousLoadedItemIds = new Set(
      Object.entries(itemParishIds)
        .filter(([, loadedParishId]) => loadedParishId === parishIdToLoad)
        .map(([itemId]) => Number(itemId)),
    );

    try {
      setLoadingParishItemsId(parishIdToLoad);

      const items = await listParishInventoryItemsByParish(parishIdToLoad);

      setData((current) => {
        const fetchedItemIds = new Set(items.map((item) => item.id));
        const parishInventoryIds = new Set(
          current.inventories
            .filter((inventory) => inventory.parish_id === parishIdToLoad)
            .map((inventory) => inventory.id),
        );
        const remainingItems = current.items.filter(
          (item) =>
            !fetchedItemIds.has(item.id) &&
            !previousLoadedItemIds.has(item.id) &&
            !parishInventoryIds.has(item.parish_inventory_id),
        );

        return {
          ...current,
          items: sortItems([...remainingItems, ...items]),
        };
      });
      setItemParishIds((current) => {
        const next = { ...current };

        for (const [itemId, loadedParishId] of Object.entries(next)) {
          if (loadedParishId === parishIdToLoad) {
            delete next[Number(itemId)];
          }
        }

        for (const item of items) {
          next[item.id] = parishIdToLoad;
        }

        return next;
      });

      return true;
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Não foi possível listar o estoque desta paróquia.",
        ),
      );
      return false;
    } finally {
      setLoadingParishItemsId(null);
    }
  }

  async function selectParishForViewing(parishIdToView: number) {
    const loaded = await loadParishInventoryItems(parishIdToView);

    if (!loaded) {
      return;
    }

    setSelectedParishId(parishIdToView);
    setSelectedInventoryId(null);
    setSection("visao-geral");
  }

  const selectedParish = useMemo(
    () => parishes.find((parish) => parish.id === selectedParishId) ?? null,
    [parishes, selectedParishId],
  );

  const activeParishIds = useMemo(
    () => new Set(parishes.map((parish) => parish.id)),
    [parishes],
  );

  const inventoryParishIds = useMemo(
    () =>
      new Map(
        data.inventories.map((inventory) => [
          inventory.id,
          inventory.parish_id,
        ] as const),
      ),
    [data.inventories],
  );

  const isDioceseConsolidated =
    (modo === "diocese" || readOnlyParishLookup) && selectedParishId === null;
  const canManageCurrentParish =
    !readOnlyParishLookup &&
    modo === "paroquia" &&
    selectedParishId !== null &&
    selectedParishId === sessionParishId;

  const parishInventories = useMemo(
    () =>
      data.inventories.filter((inventory) =>
        isDioceseConsolidated
          ? activeParishIds.has(inventory.parish_id)
          : inventory.parish_id === selectedParishId,
      ),
    [activeParishIds, data.inventories, isDioceseConsolidated, selectedParishId],
  );

  const parishInventoryIds = useMemo(
    () => new Set(parishInventories.map((inventory) => inventory.id)),
    [parishInventories],
  );

  const parishItems = useMemo(
    () =>
      data.items.filter((item) => {
        const itemParishId =
          inventoryParishIds.get(item.parish_inventory_id) ??
          itemParishIds[item.id];

        return isDioceseConsolidated
          ? itemParishId !== undefined && activeParishIds.has(itemParishId)
          : itemParishId === selectedParishId;
      }),
    [
      activeParishIds,
      data.items,
      inventoryParishIds,
      isDioceseConsolidated,
      itemParishIds,
      selectedParishId,
    ],
  );

  const parishExpiringItems = useMemo(
    () =>
      data.expiringItems.filter((item) =>
        parishInventoryIds.has(item.parish_inventory_id),
      ),
    [data.expiringItems, parishInventoryIds],
  );

  const parishExpiredItems = useMemo(
    () =>
      data.expiredItems.filter((item) =>
        parishInventoryIds.has(item.parish_inventory_id),
      ),
    [data.expiredItems, parishInventoryIds],
  );

  const parishTemplates = useMemo(
    () =>
      data.templates.filter((template) =>
        isDioceseConsolidated
          ? activeParishIds.has(template.parish_id)
          : template.parish_id === selectedParishId,
      ),
    [activeParishIds, data.templates, isDioceseConsolidated, selectedParishId],
  );

  const repasseParishFilterId =
    modo === "paroquia" ? sessionParishId ?? selectedParishId : selectedParishId;
  const parishRepasses = useMemo(
    () =>
      data.repasses.filter((repasse) =>
        modo === "diocese" && repasseParishFilterId === null
          ? activeParishIds.has(repasse.parish_id)
          : repasse.parish_id === repasseParishFilterId,
      ),
    [activeParishIds, data.repasses, modo, repasseParishFilterId],
  );

  const parishDeliveries = useMemo(
    () =>
      data.deliveries.filter((delivery) =>
        isDioceseConsolidated
          ? activeParishIds.has(delivery.parish_id)
          : delivery.parish_id === selectedParishId,
      ),
    [activeParishIds, data.deliveries, isDioceseConsolidated, selectedParishId],
  );

  const parishFamilies = useMemo(
    () =>
      families.filter((family) =>
        isDioceseConsolidated
          ? activeParishIds.has(family.parish_id)
          : family.parish_id === selectedParishId,
      ),
    [activeParishIds, families, isDioceseConsolidated, selectedParishId],
  );

  useEffect(() => {
    const inventoryStillExists = parishInventories.some(
      (inventory) => inventory.id === selectedInventoryId,
    );

    if (!inventoryStillExists) {
      setSelectedInventoryId(parishInventories[0]?.id ?? null);
    }
  }, [parishInventories, selectedInventoryId]);

  const selectedInventory =
    parishInventories.find(
      (inventory) => inventory.id === selectedInventoryId,
    ) ?? null;

  const selectedParishLabel =
    isDioceseConsolidated
      ? "Todas as paróquias — visão consolidada"
      : selectedParish?.name ??
        (selectedParishId === sessionParishId
          ? parishName ?? sessionParishName ?? "Paróquia atual"
          : `Paróquia #${selectedParishId}`);

  const showingParishItemsWithoutInventory =
    selectedInventoryId === null &&
    parishInventories.length === 0 &&
    parishItems.length > 0;
  const selectedInventoryItems = showingParishItemsWithoutInventory
    ? parishItems
    : parishItems.filter(
        (item) => item.parish_inventory_id === selectedInventoryId,
      );
  const selectedInventoryName =
    selectedInventory?.name ??
    (showingParishItemsWithoutInventory ? selectedParishLabel : null);

  const totalQuantity = parishItems.reduce(
    (total, item) => total + item.total_quantity,
    0,
  );
  const expiringQuantity = parishExpiringItems.reduce(
    (total, item) => total + item.valid_until_quantity,
    0,
  );
  const expiredQuantity = parishExpiredItems.reduce(
    (total, item) => total + item.expired_quantity,
    0,
  );

  async function refreshValidityAlerts(): Promise<boolean> {
    try {
      const [expiringResponse, expiredResponse] = await Promise.all([
        listItemsExpiringThisWeek(),
        listExpiredItems(),
      ]);

      setData((current) => ({
        ...current,
        expiringItems: expiringResponse.data,
        expiredItems: expiredResponse.data,
      }));

      return true;
    } catch {
      return false;
    }
  }

  function openCreateInventory() {
    setInventoryBeingEdited(null);
    setInventoryFormError(null);
    setInventoryFormOpen(true);
  }

  function openEditInventory(inventory: ParishInventory) {
    setSelectedInventoryId(inventory.id);
    setInventoryBeingEdited(inventory);
    setInventoryFormError(null);
    setInventoryFormOpen(true);
  }

  function openDeleteInventory(inventory: ParishInventory) {
    setSelectedInventoryId(inventory.id);
    setInventoryBeingDeleted(inventory);
    setDeleteInventoryError(null);
  }

  async function handleInventorySubmit(values: InventarioFormValues) {
    if (selectedParishId === null) {
      setInventoryFormError(
        "Não foi possível identificar a paróquia deste inventário.",
      );
      return;
    }

    try {
      setSavingInventory(true);
      setInventoryFormError(null);

      if (inventoryBeingEdited) {
        const updatedInventory = await updateParishInventory(
          inventoryBeingEdited.id,
          values,
        );

        setData((current) => ({
          ...current,
          inventories: sortInventories(
            current.inventories.map((inventory) =>
              inventory.id === updatedInventory.id
                ? updatedInventory
                : inventory,
            ),
          ),
        }));
        setSelectedInventoryId(updatedInventory.id);
        toast.success("Inventário atualizado com sucesso.");
      } else {
        const createPayload =
          modo === "diocese"
            ? { parish_id: selectedParishId, ...values }
            : values;

        const createdInventory = await createParishInventory(createPayload);

        setData((current) => ({
          ...current,
          inventories: sortInventories([
            ...current.inventories,
            createdInventory,
          ]),
        }));
        setSelectedInventoryId(createdInventory.id);
        toast.success("Inventário criado com sucesso.");
      }

      setInventoryFormOpen(false);
      setInventoryBeingEdited(null);
    } catch (error) {
      setInventoryFormError(
        getErrorMessage(
          error,
          inventoryBeingEdited
            ? "Não foi possível atualizar o inventário."
            : "Não foi possível criar o inventário.",
        ),
      );
    } finally {
      setSavingInventory(false);
    }
  }

  async function handleDeleteInventory() {
    if (!inventoryBeingDeleted) {
      return;
    }

    try {
      setDeletingInventory(true);
      setDeleteInventoryError(null);

      const deletedInventoryId = inventoryBeingDeleted.id;
      await deleteParishInventory(deletedInventoryId);

      setData((current) => ({
        ...current,
        inventories: current.inventories.filter(
          (inventory) => inventory.id !== deletedInventoryId,
        ),
        items: current.items.filter(
          (item) => item.parish_inventory_id !== deletedInventoryId,
        ),
        expiringItems: current.expiringItems.filter(
          (item) => item.parish_inventory_id !== deletedInventoryId,
        ),
        expiredItems: current.expiredItems.filter(
          (item) => item.parish_inventory_id !== deletedInventoryId,
        ),
      }));

      setInventoryBeingDeleted(null);
      toast.success("Inventário excluído com sucesso.");
    } catch (error) {
      setDeleteInventoryError(
        getErrorMessage(
          error,
          "Não foi possível excluir o inventário. Verifique se existem dados vinculados a ele.",
        ),
      );
    } finally {
      setDeletingInventory(false);
    }
  }

  function openCreateItem() {
    if (!selectedInventory) {
      toast.error("Selecione um inventário antes de criar um item.");
      return;
    }

    setItemBeingEdited(null);
    setItemFormError(null);
    setItemFormOpen(true);
  }

  function openEditItem(item: ParishInventoryItem) {
    setSelectedInventoryId(item.parish_inventory_id);
    setItemBeingEdited(item);
    setItemFormError(null);
    setItemFormOpen(true);
  }

  function openDeleteItem(item: ParishInventoryItem) {
    setSelectedInventoryId(item.parish_inventory_id);
    setItemBeingDeleted(item);
    setDeleteItemError(null);
  }

  function openAddEntry(item: ParishInventoryItem) {
    setSelectedInventoryId(item.parish_inventory_id);
    setItemReceivingEntry(item);
    setEntryFormError(null);
  }

  async function handleAddEntry(
    payload: AddParishInventoryItemQuantityPayload,
  ) {
    if (!itemReceivingEntry) {
      return;
    }

    try {
      setSavingEntry(true);
      setEntryFormError(null);

      const updatedItem = await addParishInventoryItemQuantity(
        itemReceivingEntry.id,
        payload,
      );

      setData((current) => ({
        ...current,
        items: sortItems(
          current.items.map((item) =>
            item.id === updatedItem.id ? updatedItem : item,
          ),
        ),
        templates: current.templates.map((template) =>
          syncTemplateItemWithInventoryItem(template, updatedItem),
        ),
      }));

      setItemReceivingEntry(null);
      toast.success(
        `Entrada registrada. O total de ${updatedItem.name} agora é ${updatedItem.total_quantity}.`,
      );

      const validityUpdated = await refreshValidityAlerts();

      if (!validityUpdated) {
        toast.warning(
          "A entrada foi registrada, mas os alertas de validade não puderam ser atualizados agora.",
        );
      }
    } catch (error) {
      setEntryFormError(
        getErrorMessage(error, "Não foi possível registrar a entrada do item."),
      );
    } finally {
      setSavingEntry(false);
    }
  }

  async function handleItemSubmit(values: ItemInventarioFormValues) {
    try {
      setSavingItem(true);
      setItemFormError(null);

      if (itemBeingEdited) {
        const updatedItem = await updateParishInventoryItem(
          itemBeingEdited.id,
          {
            name: values.name,
            description: values.description,
          },
        );

        setData((current) => ({
          ...current,
          items: sortItems(
            current.items.map((item) =>
              item.id === updatedItem.id ? updatedItem : item,
            ),
          ),
          expiringItems: current.expiringItems.map((item) =>
            item.id === updatedItem.id
              ? {
                  ...item,
                  name: updatedItem.name,
                  description: updatedItem.description,
                  updated_at: updatedItem.updated_at,
                }
              : item,
          ),
          expiredItems: current.expiredItems.map((item) =>
            item.id === updatedItem.id
              ? {
                  ...item,
                  name: updatedItem.name,
                  description: updatedItem.description,
                  updated_at: updatedItem.updated_at,
                }
              : item,
          ),
          templates: current.templates.map((template) =>
            syncTemplateItemWithInventoryItem(template, updatedItem),
          ),
        }));

        toast.success("Item atualizado com sucesso.");
      } else {
        if (selectedInventoryId === null) {
          setItemFormError(
            "Selecione o inventário em que o item será cadastrado.",
          );
          return;
        }

        if (values.quantity === undefined || !values.valid_until) {
          setItemFormError(
            "Informe a quantidade inicial e a validade do primeiro lote.",
          );
          return;
        }

        const createdItem = await createParishInventoryItem({
          parish_inventory_id: selectedInventoryId,
          name: values.name,
          description: values.description,
          quantity: values.quantity,
          valid_until: values.valid_until,
        });

        setData((current) => ({
          ...current,
          items: sortItems([...current.items, createdItem]),
        }));

        toast.success("Item criado com sucesso.");

        const validityUpdated = await refreshValidityAlerts();

        if (!validityUpdated) {
          toast.warning(
            "O item foi criado, mas os alertas de validade não puderam ser atualizados agora.",
          );
        }
      }

      setItemFormOpen(false);
      setItemBeingEdited(null);
    } catch (error) {
      setItemFormError(
        getErrorMessage(
          error,
          itemBeingEdited
            ? "Não foi possível atualizar o item."
            : "Não foi possível criar o item.",
        ),
      );
    } finally {
      setSavingItem(false);
    }
  }

  async function handleDeleteItem() {
    if (!itemBeingDeleted) {
      return;
    }

    try {
      setDeletingItem(true);
      setDeleteItemError(null);

      const deletedItemId = itemBeingDeleted.id;
      await deleteParishInventoryItem(deletedItemId);

      setData((current) => ({
        ...current,
        items: current.items.filter((item) => item.id !== deletedItemId),
        expiringItems: current.expiringItems.filter(
          (item) => item.id !== deletedItemId,
        ),
        expiredItems: current.expiredItems.filter(
          (item) => item.id !== deletedItemId,
        ),
        templates: current.templates.map((template) => ({
          ...template,
          items: template.items.filter(
            (item) => item.parish_inventory_item_id !== deletedItemId,
          ),
        })),
      }));

      setItemBeingDeleted(null);
      toast.success("Item excluído com sucesso.");
    } catch (error) {
      setDeleteItemError(
        getErrorMessage(
          error,
          "Não foi possível excluir o item. Verifique se ele está vinculado a um modelo de cesta.",
        ),
      );
    } finally {
      setDeletingItem(false);
    }
  }

  function openCreateTemplate() {
    if (selectedParishId === null) {
      toast.error("Não foi possível identificar a paróquia do modelo.");
      return;
    }

    if (parishItems.length === 0) {
      toast.error(
        "Cadastre pelo menos um item no estoque antes de criar um modelo de cesta.",
      );
      return;
    }

    setTemplateBeingEdited(null);
    setTemplateFormError(null);
    setTemplateFormOpen(true);
  }

  function openEditTemplate(template: BasketTemplate) {
    setTemplateBeingEdited(template);
    setTemplateFormError(null);
    setTemplateFormOpen(true);
  }

  function openDeleteTemplate(template: BasketTemplate) {
    setTemplateBeingDeleted(template);
    setDeleteTemplateError(null);
  }

  async function handleTemplateSubmit(values: ModeloCestaFormValues) {
    if (selectedParishId === null) {
      setTemplateFormError(
        "Não foi possível identificar a paróquia deste modelo.",
      );
      return;
    }

    try {
      setSavingTemplate(true);
      setTemplateFormError(null);

      if (templateBeingEdited) {
        const updatedTemplate = await updateBasketTemplate(
          templateBeingEdited.id,
          {
            name: values.name,
            description: values.description,
            active: values.active,
            items: values.items,
          },
        );

        setData((current) => ({
          ...current,
          templates: sortTemplates(
            current.templates.map((template) =>
              template.id === updatedTemplate.id ? updatedTemplate : template,
            ),
          ),
        }));
        toast.success("Modelo de cesta atualizado com sucesso.");
      } else {
        const basePayload = {
          name: values.name,
          description: values.description,
          items: values.items,
        };
        const createPayload =
          modo === "diocese"
            ? { parish_id: selectedParishId, ...basePayload }
            : basePayload;

        const createdTemplate = await createBasketTemplate(createPayload);

        setData((current) => ({
          ...current,
          templates: sortTemplates([
            ...current.templates,
            createdTemplate,
          ]),
        }));
        toast.success("Modelo de cesta criado com sucesso.");
      }

      setTemplateFormOpen(false);
      setTemplateBeingEdited(null);
    } catch (error) {
      setTemplateFormError(
        getErrorMessage(
          error,
          templateBeingEdited
            ? "Não foi possível atualizar o modelo de cesta."
            : "Não foi possível criar o modelo de cesta.",
        ),
      );
    } finally {
      setSavingTemplate(false);
    }
  }

  async function handleToggleTemplateActive(template: BasketTemplate) {
    try {
      setTogglingTemplateId(template.id);

      const updatedTemplate = await updateBasketTemplate(template.id, {
        name: template.name,
        active: !template.active,
      });

      setData((current) => ({
        ...current,
        templates: sortTemplates(
          current.templates.map((currentTemplate) =>
            currentTemplate.id === updatedTemplate.id
              ? updatedTemplate
              : currentTemplate,
          ),
        ),
      }));

      toast.success(
        updatedTemplate.active
          ? "Modelo ativado com sucesso."
          : "Modelo desativado com sucesso.",
      );
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Não foi possível alterar a situação do modelo.",
        ),
      );
    } finally {
      setTogglingTemplateId(null);
    }
  }

  async function handleDeleteTemplate() {
    if (!templateBeingDeleted) {
      return;
    }

    try {
      setDeletingTemplate(true);
      setDeleteTemplateError(null);

      const deletedTemplateId = templateBeingDeleted.id;
      await deleteBasketTemplate(deletedTemplateId);

      setData((current) => ({
        ...current,
        templates: current.templates.filter(
          (template) => template.id !== deletedTemplateId,
        ),
      }));

      setTemplateBeingDeleted(null);
      toast.success("Modelo de cesta excluído com sucesso.");
    } catch (error) {
      setDeleteTemplateError(
        getErrorMessage(
          error,
          "Não foi possível excluir o modelo de cesta. Verifique se há entregas vinculadas.",
        ),
      );
    } finally {
      setDeletingTemplate(false);
    }
  }

  function openCreateRepasse() {
    if (modo !== "diocese") {
      toast.error("Apenas a diocese pode registrar repasses.");
      return;
    }

    setRepasseFormError(null);
    setRepasseFormOpen(true);
  }

  async function handleRepasseSubmit(
    payload: CreateParishInventoryRepassePayload,
  ) {
    try {
      setSavingRepasse(true);
      setRepasseFormError(null);

      const createdRepasse = await createParishInventoryRepasse(payload);

      setData((current) => ({
        ...current,
        repasses: sortRepasses([
          createdRepasse,
          ...current.repasses.filter(
            (repasse) => repasse.id !== createdRepasse.id,
          ),
        ]),
      }));
      setRepasseFormOpen(false);
      toast.success("Repasse registrado com sucesso.");

      try {
        const [inventories, items, expiringResponse, expiredResponse] =
          await Promise.all([
            listParishInventories(),
            listParishInventoryItemsByParish(payload.parish_id),
            listItemsExpiringThisWeek(),
            listExpiredItems(),
          ]);

        setData((current) => {
          const fetchedItemIds = new Set(items.map((item) => item.id));
          const parishInventoryIds = new Set(
            inventories
              .filter((inventory) => inventory.parish_id === payload.parish_id)
              .map((inventory) => inventory.id),
          );
          const remainingItems = current.items.filter(
            (item) =>
              !fetchedItemIds.has(item.id) &&
              !parishInventoryIds.has(item.parish_inventory_id),
          );

          return {
            ...current,
            inventories: sortInventories(inventories),
            items: sortItems([...remainingItems, ...items]),
            expiringItems: expiringResponse.data,
            expiredItems: expiredResponse.data,
          };
        });
        setItemParishIds((current) => {
          const next = { ...current };

          for (const [itemId, loadedParishId] of Object.entries(next)) {
            if (loadedParishId === payload.parish_id) {
              delete next[Number(itemId)];
            }
          }

          for (const item of items) {
            next[item.id] = payload.parish_id;
          }

          return next;
        });
      } catch {
        toast.warning(
          "O repasse foi registrado, mas os saldos da tela não puderam ser atualizados agora. Use o botão Atualizar.",
        );
      }
    } catch (error) {
      setRepasseFormError(
        getErrorMessage(error, "Não foi possível registrar o repasse."),
      );
    } finally {
      setSavingRepasse(false);
    }
  }

  function openRepasseDetails(repasse: ParishInventoryRepasse) {
    setRepasseBeingViewed(repasse);
    setRepasseDetailsError(null);
    setLoadingRepasseDetails(true);

    void getParishInventoryRepasse(repasse.id)
      .then((detailedRepasse) => {
        setRepasseBeingViewed(detailedRepasse);
        setData((current) => ({
          ...current,
          repasses: sortRepasses(
            current.repasses.map((currentRepasse) =>
              currentRepasse.id === detailedRepasse.id
                ? detailedRepasse
                : currentRepasse,
            ),
          ),
        }));
      })
      .catch((error: unknown) => {
        setRepasseDetailsError(
          getErrorMessage(
            error,
            "Não foi possível carregar os detalhes deste repasse.",
          ),
        );
      })
      .finally(() => setLoadingRepasseDetails(false));
  }

  function openCreateDelivery() {
    if (selectedParishId === null) {
      toast.error("Não foi possível identificar a paróquia da entrega.");
      return;
    }

    if (familiesLoadError) {
      toast.error(familiesLoadError);
      return;
    }

    if (parishFamilies.length === 0) {
      toast.error(
        "Nenhuma família ativa foi encontrada para esta paróquia.",
      );
      return;
    }

    if (parishItems.length === 0) {
      toast.error(
        "Cadastre itens no estoque antes de registrar uma entrega.",
      );
      return;
    }

    setDeliveryFormError(null);
    setDeliveryFormOpen(true);
  }

  async function handleDeliverySubmit(
    payload: CreateBasketDeliveryPayload,
  ) {
    try {
      setSavingDelivery(true);
      setDeliveryFormError(null);

      const createdDelivery = await createBasketDelivery(payload);

      setData((current) => ({
        ...current,
        deliveries: [createdDelivery, ...current.deliveries],
      }));
      setFamilyHistoryDeliveries((current) =>
        familyHistoryTarget?.id === createdDelivery.family_id
          ? [
              createdDelivery,
              ...current.filter((delivery) => delivery.id !== createdDelivery.id),
            ]
          : current,
      );
      setDeliveryFormOpen(false);
      toast.success(
        `Entrega registrada para ${createdDelivery.family_name}.`,
      );

      try {
        const [items, templates, expiringResponse, expiredResponse] =
          await Promise.all([
            listParishInventoryItems(),
            listBasketTemplates(),
            listItemsExpiringThisWeek(),
            listExpiredItems(),
          ]);

        setData((current) => ({
          ...current,
          items: sortItems(items),
          templates: sortTemplates(templates),
          expiringItems: expiringResponse.data,
          expiredItems: expiredResponse.data,
        }));
      } catch {
        toast.warning(
          "A entrega foi registrada, mas os saldos da tela não puderam ser atualizados agora. Use o botão Atualizar.",
        );
      }
    } catch (error) {
      setDeliveryFormError(
        getErrorMessage(
          error,
          "Não foi possível registrar a entrega. Verifique a família e os saldos disponíveis.",
        ),
      );
    } finally {
      setSavingDelivery(false);
    }
  }

  async function loadFamilyHistory(familyId: number) {
    try {
      setLoadingFamilyHistory(true);
      setFamilyHistoryError(null);

      const deliveries = await listFamilyBasketDeliveries(familyId);
      setFamilyHistoryDeliveries(deliveries);
    } catch (error) {
      setFamilyHistoryError(
        getErrorMessage(
          error,
          "Não foi possível carregar o histórico desta família.",
        ),
      );
    } finally {
      setLoadingFamilyHistory(false);
    }
  }

  function openFamilyHistory(delivery: BasketDelivery) {
    setFamilyHistoryTarget({
      id: delivery.family_id,
      name: delivery.family_name,
    });
    setFamilyHistoryDeliveries([]);
    setFamilyHistoryError(null);
    void loadFamilyHistory(delivery.family_id);
  }

  const canSelectParish =
    modo === "diocese" || readOnlyParishLookup;
  const canShowOperationalSections =
    modo === "paroquia" && !readOnlyParishLookup;
  const shouldShowEmptyParishSelection =
    canShowOperationalSections && selectedParishId === null;
  const shouldShowOverview =
    modo === "diocese" || readOnlyParishLookup || section === "visao-geral";

  if (loading) {
    return (
      <Card>
        <CardContent className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
          <Loader2
            className="size-8 animate-spin text-primary"
            aria-hidden="true"
          />
          <div>
            <p className="font-semibold text-foreground">Carregando estoque</p>
            <p className="text-sm text-muted-foreground">
              Aguarde enquanto buscamos inventários, lotes e entregas.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-6" aria-labelledby="estoque-page-title">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h2
            id="estoque-page-title"
            className="text-2xl font-bold text-foreground"
          >
            {readOnlyParishLookup
              ? "Estoques das paróquias"
              : "Gestão de estoque"}
          </h2>
          <p className="max-w-3xl text-muted-foreground">
            {readOnlyParishLookup
              ? "Consulte os estoques das paróquias em uma tela simples de listagem de itens."
              : modo === "diocese"
                ? "Consulte e gerencie os estoques das paróquias. A diocese não possui estoque próprio."
                : "Gerencie inventários, lotes, modelos de cesta e entregas da sua paróquia."}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {canSelectParish && (
            <Select
              value={
                selectedParishId === null
                  ? DIOCESE_ALL_PARISHES_VALUE
                  : selectedParishId.toString()
              }
              disabled={loadingParishItemsId !== null}
              onValueChange={(value) => {
                if (value === DIOCESE_ALL_PARISHES_VALUE) {
                  setSelectedParishId(null);
                  setSelectedInventoryId(null);
                  setSection("visao-geral");
                  return;
                }

                void selectParishForViewing(Number(value));
              }}
            >
              <SelectTrigger
                className="w-full max-w-full sm:w-80"
                aria-label="Selecionar paróquia"
              >
                <SelectValue placeholder="Selecione uma paróquia" />
              </SelectTrigger>
              <SelectContent>
                {(modo === "diocese" || readOnlyParishLookup) && (
                  <SelectItem value={DIOCESE_ALL_PARISHES_VALUE}>
                    Todas as paróquias — consolidado
                  </SelectItem>
                )}
                {parishes.map((parish) => (
                  <SelectItem key={parish.id} value={parish.id.toString()}>
                    {parish.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {modo === "diocese" && (
            <Button
              type="button"
              onClick={openCreateRepasse}
              disabled={
                loading ||
                refreshing ||
                savingRepasse ||
                loadingParishItemsId !== null
              }
            >
              {savingRepasse ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <ArrowRightLeft aria-hidden="true" />
              )}
              Novo repasse
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => void loadData(true)}
            disabled={
              refreshing ||
              savingInventory ||
              deletingInventory ||
              savingItem ||
              deletingItem ||
              savingEntry ||
              savingTemplate ||
              deletingTemplate ||
              togglingTemplateId !== null ||
              loadingParishItemsId !== null ||
              savingRepasse ||
              savingDelivery
            }
          >
            <RefreshCcw
              className={refreshing ? "animate-spin" : undefined}
              aria-hidden="true"
            />
            {refreshing ? "Atualizando..." : "Atualizar"}
          </Button>
        </div>
      </header>

      {shouldShowEmptyParishSelection ? (
        <Card>
          <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
            <Warehouse
              className="size-10 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold text-foreground">
                Selecione uma paróquia
              </p>
              <p className="text-sm text-muted-foreground">
                Escolha a paróquia para visualizar e gerenciar seu estoque.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="rounded-xl border bg-card px-4 py-3 text-sm">
            <span className="text-muted-foreground">Estoque em exibição:</span>{" "}
            <strong className="text-foreground">{selectedParishLabel}</strong>
            {isDioceseConsolidated && (
              <p className="mt-1 text-muted-foreground">
                Esta visão é consolidada e serve para consulta. Selecione uma
                paróquia para listar os itens do estoque dela.
              </p>
            )}
            {canShowOperationalSections && !canManageCurrentParish && (
              <p className="mt-1 text-muted-foreground">
                Consulta liberada. Alterações continuam disponíveis apenas no
                estoque da sua paróquia.
              </p>
            )}
          </div>

          {canShowOperationalSections && (
            <nav
              className="flex gap-2 overflow-x-auto rounded-xl border bg-card p-2"
              aria-label="Seções do estoque"
            >
              {SECTIONS.map((item) => {
                const Icon = item.icon;
                const active = section === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSection(item.id)}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          )}

          {shouldShowOverview && (
            <div className="space-y-6">
              <EstoqueResumo
                inventoriesCount={parishInventories.length}
                itemsCount={parishItems.length}
                totalQuantity={totalQuantity}
                expiringQuantity={expiringQuantity}
                expiredQuantity={expiredQuantity}
                deliveriesCount={parishDeliveries.length}
              />

              {isDioceseConsolidated && (
                <ResumoEstoqueDiocese
                  parishes={parishes}
                  inventories={data.inventories}
                  items={data.items}
                  expiringItems={data.expiringItems}
                  expiredItems={data.expiredItems}
                  selectingParishId={loadingParishItemsId}
                  onSelectParish={selectParishForViewing}
                />
              )}

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
                <InventariosList
                  inventories={parishInventories}
                  selectedInventoryId={selectedInventoryId}
                  onSelect={setSelectedInventoryId}
                  compact
                />
                <ItensInventarioList
                  items={selectedInventoryItems}
                  inventoryName={selectedInventoryName}
                  compact
                />
              </div>
            </div>
          )}

          {canShowOperationalSections && section === "inventarios" && (
            <div className="grid gap-6 xl:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.5fr)]">
              <InventariosList
                inventories={parishInventories}
                selectedInventoryId={selectedInventoryId}
                onSelect={setSelectedInventoryId}
                onCreate={
                  canManageCurrentParish ? openCreateInventory : undefined
                }
                onEdit={canManageCurrentParish ? openEditInventory : undefined}
                onDelete={
                  canManageCurrentParish ? openDeleteInventory : undefined
                }
                actionsDisabled={
                  savingInventory ||
                  deletingInventory ||
                  savingItem ||
                  deletingItem ||
                  savingEntry ||
                  savingTemplate ||
                  deletingTemplate ||
                  savingRepasse ||
                  togglingTemplateId !== null
                }
              />
              <ItensInventarioList
                items={selectedInventoryItems}
                inventoryName={selectedInventoryName}
                onCreate={
                  canManageCurrentParish && selectedInventory
                    ? openCreateItem
                    : undefined
                }
                onAddLot={canManageCurrentParish ? openAddEntry : undefined}
                onEdit={canManageCurrentParish ? openEditItem : undefined}
                onDelete={canManageCurrentParish ? openDeleteItem : undefined}
                actionsDisabled={
                  savingInventory ||
                  deletingInventory ||
                  savingItem ||
                  deletingItem ||
                  savingEntry ||
                  savingTemplate ||
                  deletingTemplate ||
                  savingRepasse ||
                  togglingTemplateId !== null
                }
              />
            </div>
          )}

          {canShowOperationalSections && section === "validade" && (
            <AlertasValidade
              inventories={parishInventories}
              expiringItems={parishExpiringItems}
              expiredItems={parishExpiredItems}
              onOpenInventory={(inventoryId) => {
                setSelectedInventoryId(inventoryId);
                setSection("inventarios");
              }}
            />
          )}

          {canShowOperationalSections && section === "modelos" && (
            <ModelosCestaList
              templates={parishTemplates}
              inventories={parishInventories}
              inventoryItems={parishItems}
              onCreate={
                canManageCurrentParish ? openCreateTemplate : undefined
              }
              onEdit={canManageCurrentParish ? openEditTemplate : undefined}
              onDelete={
                canManageCurrentParish ? openDeleteTemplate : undefined
              }
              onToggleActive={
                canManageCurrentParish
                  ? (template) => void handleToggleTemplateActive(template)
                  : undefined
              }
              actionsDisabled={
                savingTemplate ||
                deletingTemplate ||
                togglingTemplateId !== null ||
                savingItem ||
                deletingItem ||
                savingEntry ||
                savingRepasse
              }
            />
          )}

          {canShowOperationalSections && section === "repasses" && (
            <RepassesEstoqueList
              repasses={parishRepasses}
              parishes={parishes}
              onCreate={modo === "diocese" ? openCreateRepasse : undefined}
              onViewDetails={openRepasseDetails}
              actionsDisabled={
                savingRepasse ||
                refreshing ||
                loadingParishItemsId !== null ||
                savingInventory ||
                deletingInventory ||
                savingItem ||
                deletingItem ||
                savingEntry ||
                savingTemplate ||
                deletingTemplate ||
                togglingTemplateId !== null
              }
            />
          )}

          {canShowOperationalSections && section === "entregas" && (
            <div className="space-y-4">
              {familiesLoadError && (
                <div
                  role="alert"
                  className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
                >
                  {familiesLoadError} Atualize a página antes de registrar uma
                  nova entrega.
                </div>
              )}
              <EntregasCestaList
                deliveries={parishDeliveries}
                onCreate={
                  canManageCurrentParish ? openCreateDelivery : undefined
                }
                onViewDetails={setDeliveryBeingViewed}
                onViewFamilyHistory={openFamilyHistory}
                actionsDisabled={
                  savingDelivery ||
                  savingItem ||
                  deletingItem ||
                  savingEntry ||
                  savingTemplate ||
                  deletingTemplate ||
                  savingRepasse ||
                  togglingTemplateId !== null
                }
              />
            </div>
          )}
        </>
      )}

      <InventarioForm
        open={inventoryFormOpen}
        onOpenChange={(open) => {
          setInventoryFormOpen(open);
          if (!open) {
            setInventoryBeingEdited(null);
            setInventoryFormError(null);
          }
        }}
        inventory={inventoryBeingEdited}
        saving={savingInventory}
        error={inventoryFormError}
        onSubmit={handleInventorySubmit}
      />

      <ExcluirInventarioDialog
        open={inventoryBeingDeleted !== null}
        inventory={inventoryBeingDeleted}
        deleting={deletingInventory}
        error={deleteInventoryError}
        onOpenChange={(open) => {
          if (!open) {
            setInventoryBeingDeleted(null);
            setDeleteInventoryError(null);
          }
        }}
        onConfirm={handleDeleteInventory}
      />

      <ItemInventarioForm
        open={itemFormOpen}
        onOpenChange={(open) => {
          setItemFormOpen(open);
          if (!open) {
            setItemBeingEdited(null);
            setItemFormError(null);
          }
        }}
        item={itemBeingEdited}
        inventoryName={selectedInventory?.name ?? null}
        saving={savingItem}
        error={itemFormError}
        onSubmit={handleItemSubmit}
      />

      <AdicionarLoteModal
        open={itemReceivingEntry !== null}
        item={itemReceivingEntry}
        saving={savingEntry}
        error={entryFormError}
        onOpenChange={(open) => {
          if (!open) {
            setItemReceivingEntry(null);
            setEntryFormError(null);
          }
        }}
        onSubmit={handleAddEntry}
      />

      <ExcluirItemInventarioDialog
        open={itemBeingDeleted !== null}
        item={itemBeingDeleted}
        deleting={deletingItem}
        error={deleteItemError}
        onOpenChange={(open) => {
          if (!open) {
            setItemBeingDeleted(null);
            setDeleteItemError(null);
          }
        }}
        onConfirm={handleDeleteItem}
      />

      <ModeloCestaForm
        open={templateFormOpen}
        onOpenChange={(open) => {
          setTemplateFormOpen(open);
          if (!open) {
            setTemplateBeingEdited(null);
            setTemplateFormError(null);
          }
        }}
        parishId={selectedParishId ?? 0}
        inventories={parishInventories}
        inventoryItems={parishItems}
        template={templateBeingEdited}
        saving={savingTemplate}
        error={templateFormError}
        onSubmit={handleTemplateSubmit}
      />

      <ExcluirModeloCestaDialog
        open={templateBeingDeleted !== null}
        template={templateBeingDeleted}
        deleting={deletingTemplate}
        error={deleteTemplateError}
        onOpenChange={(open) => {
          if (!open) {
            setTemplateBeingDeleted(null);
            setDeleteTemplateError(null);
          }
        }}
        onConfirm={handleDeleteTemplate}
      />

      <RepasseEstoqueForm
        open={repasseFormOpen}
        onOpenChange={(open) => {
          setRepasseFormOpen(open);
          if (!open) {
            setRepasseFormError(null);
          }
        }}
        parishes={parishes}
        defaultParishId={modo === "diocese" ? selectedParishId : null}
        saving={savingRepasse}
        error={repasseFormError}
        onSubmit={handleRepasseSubmit}
      />

      <DetalheRepasseDialog
        open={repasseBeingViewed !== null}
        repasse={repasseBeingViewed}
        parishes={parishes}
        loading={loadingRepasseDetails}
        error={repasseDetailsError}
        onOpenChange={(open) => {
          if (!open) {
            setRepasseBeingViewed(null);
            setRepasseDetailsError(null);
            setLoadingRepasseDetails(false);
          }
        }}
      />

      <RegistrarEntregaModal
        open={deliveryFormOpen}
        onOpenChange={(open) => {
          setDeliveryFormOpen(open);
          if (!open) {
            setDeliveryFormError(null);
          }
        }}
        parishId={selectedParishId ?? 0}
        families={parishFamilies}
        templates={parishTemplates}
        inventories={parishInventories}
        inventoryItems={parishItems}
        saving={savingDelivery}
        error={deliveryFormError}
        onSubmit={handleDeliverySubmit}
      />

      <DetalheEntregaDialog
        open={deliveryBeingViewed !== null}
        delivery={deliveryBeingViewed}
        onOpenChange={(open) => {
          if (!open) {
            setDeliveryBeingViewed(null);
          }
        }}
      />

      <HistoricoFamiliaModal
        open={familyHistoryTarget !== null}
        familyId={familyHistoryTarget?.id ?? null}
        familyName={familyHistoryTarget?.name ?? null}
        deliveries={familyHistoryDeliveries}
        loading={loadingFamilyHistory}
        error={familyHistoryError}
        onOpenChange={(open) => {
          if (!open) {
            setFamilyHistoryTarget(null);
            setFamilyHistoryDeliveries([]);
            setFamilyHistoryError(null);
          }
        }}
        onRetry={() => {
          if (familyHistoryTarget) {
            void loadFamilyHistory(familyHistoryTarget.id);
          }
        }}
        onViewDelivery={(delivery) => {
          setFamilyHistoryTarget(null);
          setDeliveryBeingViewed(delivery);
        }}
      />
    </section>
  );
}
