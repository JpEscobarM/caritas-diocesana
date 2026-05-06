import { useState } from 'react';
import { Search, AlertTriangle, Plus, Minus, FileText, Check, Package } from 'lucide-react';
import { mockFamilies, mockStockItems, type Family } from './mockData';

export function BenefitsManagement() {
  const [activeView, setActiveView] = useState<'search' | 'select' | 'confirm'>('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>({});
  const [justification, setJustification] = useState('');

  const handleSearch = () => {
    const found = mockFamilies.find(
      (f) =>
        f.responsavel.cpf.includes(searchTerm) ||
        f.responsavel.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (found) {
      setSelectedFamily(found);
    } else {
      alert('Família não encontrada');
    }
  };

  const hasRecentBenefit = (family: Family) => {
    if (family.beneficiosRecebidos.length === 0) return false;
    const lastBenefit = family.beneficiosRecebidos[family.beneficiosRecebidos.length - 1];
    const daysDiff =
      (new Date().getTime() - new Date(lastBenefit.data).getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff < 30;
  };

  const adjustItemQuantity = (itemId: string, delta: number) => {
    const newQty = (selectedItems[itemId] || 0) + delta;
    if (newQty <= 0) {
      const { [itemId]: _, ...rest } = selectedItems;
      setSelectedItems(rest);
    } else {
      setSelectedItems({ ...selectedItems, [itemId]: newQty });
    }
  };

  const handleConfirm = () => {
    console.log('Benefício concedido:', { family: selectedFamily, items: selectedItems, justification });
    alert('Benefício registrado com sucesso! Comprovante gerado.');
    setActiveView('search');
    setSelectedFamily(null);
    setSelectedItems({});
    setJustification('');
    setSearchTerm('');
  };

  // Search View
  if (activeView === 'search') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl text-gray-900 mb-6">Buscar Família</h3>

          <div className="flex gap-3 mb-6">
            <input
              type="text"
              placeholder="Digite CPF ou nome da família..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {selectedFamily && (
            <div className="space-y-4">
              {hasRecentBenefit(selectedFamily) && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-yellow-900 mb-2">⚠️ Alerta de Benefício Recente</h4>
                      <p className="text-sm text-yellow-800">
                        Esta família recebeu benefício há menos de 30 dias. Último atendimento
                        em{' '}
                        {selectedFamily.beneficiosRecebidos[
                          selectedFamily.beneficiosRecebidos.length - 1
                        ]?.data &&
                          new Date(
                            selectedFamily.beneficiosRecebidos[
                              selectedFamily.beneficiosRecebidos.length - 1
                            ].data
                          ).toLocaleDateString('pt-BR')}
                        .
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-gray-900 mb-4">Dados da Família</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Responsável:</span>
                    <p className="text-gray-900">{selectedFamily.responsavel.nome}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">CPF:</span>
                    <p className="text-gray-900">{selectedFamily.responsavel.cpf}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Endereço:</span>
                    <p className="text-gray-900">
                      {selectedFamily.responsavel.endereco}, {selectedFamily.responsavel.bairro}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Telefone:</span>
                    <p className="text-gray-900">{selectedFamily.responsavel.telefone}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveView('select')}
                className="w-full px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-lg"
              >
                <Package className="w-5 h-5" />
                Selecionar Itens para Doação
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Select Items View
  if (activeView === 'select' && selectedFamily) {
    const categories = Array.from(new Set(mockStockItems.map((item) => item.categoria)));

    return (
      <div className="space-y-6">
        <button
          onClick={() => setActiveView('search')}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          ← Voltar
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl text-gray-900 mb-6">Selecionar Itens do Estoque</h3>

          {categories.map((category) => (
            <div key={category} className="mb-6">
              <h4 className="text-gray-900 mb-3">{category}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mockStockItems
                  .filter((item) => item.categoria === category && item.quantidade > 0)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-gray-900">{item.nome}</p>
                          <p className="text-sm text-gray-600">
                            Disponível: {item.quantidade} {item.unidade}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => adjustItemQuantity(item.id, -1)}
                            className="w-8 h-8 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center text-gray-900">
                            {selectedItems[item.id] || 0}
                          </span>
                          <button
                            onClick={() => adjustItemQuantity(item.id, 1)}
                            className="w-8 h-8 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 flex items-center justify-center"
                            disabled={(selectedItems[item.id] || 0) >= item.quantidade}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}

          <button
            onClick={() => setActiveView('confirm')}
            disabled={Object.keys(selectedItems).length === 0}
            className="mt-6 w-full px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          >
            Prosseguir para Confirmação
          </button>
        </div>
      </div>
    );
  }

  // Confirm View
  if (activeView === 'confirm' && selectedFamily) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setActiveView('select')}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          ← Voltar
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl text-gray-900 mb-6">Confirmar Concessão de Benefício</h3>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h4 className="text-gray-900 mb-4">Resumo da Entrega</h4>
            <div className="space-y-2 mb-4">
              {Object.entries(selectedItems).map(([itemId, qty]) => {
                const item = mockStockItems.find((i) => i.id === itemId);
                return item ? (
                  <div key={itemId} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.nome}</span>
                    <span className="text-gray-900">
                      {qty} {item.unidade}
                    </span>
                  </div>
                ) : null;
              })}
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-gray-900">
                <strong>Família:</strong> {selectedFamily.responsavel.nome}
              </p>
              <p className="text-gray-600 text-sm">CPF: {selectedFamily.responsavel.cpf}</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">
              Justificativa / Análise Social *
            </label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descreva a situação da família, motivo da concessão do benefício e observações relevantes..."
            />
          </div>

          <button
            onClick={handleConfirm}
            disabled={!justification}
            className="w-full px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          >
            <Check className="w-5 h-5" />
            Confirmar e Gerar Comprovante
          </button>
        </div>
      </div>
    );
  }

  return null;
}
