import { useState } from 'react';
import { Package, AlertTriangle, Calendar, Plus, TrendingUp, TrendingDown, Search } from 'lucide-react';
import { mockStockItems, mockStockMovements } from './mockData';

export function StockControl() {
  const [activeView, setActiveView] = useState<'dashboard' | 'entry' | 'history'>('dashboard');
  const [newEntry, setNewEntry] = useState({
    categoria: '',
    nome: '',
    quantidade: '',
    unidade: '',
    doador: '',
    dataValidade: '',
    lote: '',
  });

  const missingItems = mockStockItems.filter((item) => item.quantidade === 0);
  const expiringItems = mockStockItems.filter((item) => {
    if (!item.dataValidade) return false;
    const daysUntilExpiry =
      (new Date(item.dataValidade).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  });

  const handleSubmitEntry = () => {
    console.log('Nova entrada:', newEntry);
    alert('Entrada registrada com sucesso!');
    setActiveView('dashboard');
    setNewEntry({
      categoria: '',
      nome: '',
      quantidade: '',
      unidade: '',
      doador: '',
      dataValidade: '',
      lote: '',
    });
  };

  // Dashboard View
  if (activeView === 'dashboard') {
    return (
      <div className="space-y-6">
        {/* Alertas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {missingItems.length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-red-900 mb-2">
                    ⚠️ Itens em Falta ({missingItems.length})
                  </h3>
                  <ul className="space-y-1 text-sm text-red-800">
                    {missingItems.slice(0, 5).map((item) => (
                      <li key={item.id}>• {item.nome}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {expiringItems.length > 0 && (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-orange-900 mb-2">
                    Validade Próxima ({expiringItems.length})
                  </h3>
                  <ul className="space-y-1 text-sm text-orange-800">
                    {expiringItems.map((item) => {
                      const daysLeft = Math.ceil(
                        (new Date(item.dataValidade!).getTime() - new Date().getTime()) /
                          (1000 * 60 * 60 * 24)
                      );
                      return (
                        <li key={item.id}>
                          • {item.quantidade} {item.unidade} de {item.nome} (
                          <strong>{daysLeft} dias</strong>)
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveView('entry')}
            className="p-6 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-3"
          >
            <Plus className="w-6 h-6" />
            <span className="text-lg">Registrar Entrada</span>
          </button>

          <button
            onClick={() => setActiveView('history')}
            className="p-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-3"
          >
            <Package className="w-6 h-6" />
            <span className="text-lg">Ver Histórico</span>
          </button>

          <button className="p-6 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors flex items-center justify-center gap-3">
            <Search className="w-6 h-6" />
            <span className="text-lg">Buscar Item</span>
          </button>
        </div>

        {/* Tabela de Estoque */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg text-gray-900">Itens em Estoque</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-600">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600">Item</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600">Quantidade</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600">Localização</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600">Validade</th>
                  <th className="px-6 py-3 text-left text-xs text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockStockItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">{item.categoria}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.nome}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {item.quantidade} {item.unidade}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{item.localizacao}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {item.dataValidade
                        ? new Date(item.dataValidade).toLocaleDateString('pt-BR')
                        : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {item.quantidade === 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-red-100 text-red-800">
                          Em falta
                        </span>
                      ) : item.dataValidade &&
                        (new Date(item.dataValidade).getTime() - new Date().getTime()) /
                          (1000 * 60 * 60 * 24) <=
                          30 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-orange-100 text-orange-800">
                          Validade próxima
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Entry View
  if (activeView === 'entry') {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setActiveView('dashboard')}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          ← Voltar
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl text-gray-900 mb-6">Registrar Entrada de Doação</h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Categoria *</label>
                <select
                  value={newEntry.categoria}
                  onChange={(e) => setNewEntry({ ...newEntry, categoria: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione...</option>
                  <option value="Alimentos">Alimentos</option>
                  <option value="Roupas">Roupas</option>
                  <option value="Calçados">Calçados</option>
                  <option value="Higiene">Higiene</option>
                  <option value="Limpeza">Limpeza</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Nome do Item *</label>
                <input
                  type="text"
                  value={newEntry.nome}
                  onChange={(e) => setNewEntry({ ...newEntry, nome: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Arroz, Feijão, Camiseta..."
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Quantidade *</label>
                <input
                  type="number"
                  value={newEntry.quantidade}
                  onChange={(e) => setNewEntry({ ...newEntry, quantidade: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Unidade *</label>
                <select
                  value={newEntry.unidade}
                  onChange={(e) => setNewEntry({ ...newEntry, unidade: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione...</option>
                  <option value="unidades">Unidades</option>
                  <option value="kg">Quilogramas (kg)</option>
                  <option value="litros">Litros</option>
                  <option value="pacotes">Pacotes</option>
                  <option value="caixas">Caixas</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">Doador</label>
                <input
                  type="text"
                  value={newEntry.doador}
                  onChange={(e) => setNewEntry({ ...newEntry, doador: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do doador ou instituição"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Data de Validade</label>
                <input
                  type="date"
                  value={newEntry.dataValidade}
                  onChange={(e) => setNewEntry({ ...newEntry, dataValidade: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Lote</label>
                <input
                  type="text"
                  value={newEntry.lote}
                  onChange={(e) => setNewEntry({ ...newEntry, lote: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Número do lote (opcional)"
                />
              </div>
            </div>

            <button
              onClick={handleSubmitEntry}
              disabled={
                !newEntry.categoria ||
                !newEntry.nome ||
                !newEntry.quantidade ||
                !newEntry.unidade
              }
              className="mt-6 w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            >
              <Plus className="w-5 h-5" />
              Confirmar Entrada
            </button>
          </div>
        </div>
      </div>
    );
  }

  // History View
  if (activeView === 'history') {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setActiveView('dashboard')}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          ← Voltar
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg text-gray-900">Histórico de Movimentações</h3>
          </div>
          <div className="p-6 space-y-4">
            {mockStockMovements.map((movement) => (
              <div
                key={movement.id}
                className="flex gap-4 pb-4 border-b border-gray-200 last:border-0"
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    movement.tipo === 'entrada'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {movement.tipo === 'entrada' ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-gray-900">
                      {movement.tipo === 'entrada' ? 'Entrada' : 'Saída'} - {movement.itemNome}
                    </p>
                    <span className="text-sm text-gray-600">
                      {new Date(movement.data).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Quantidade: {movement.quantidade} • Responsável: {movement.responsavel}
                  </p>
                  {movement.doador && (
                    <p className="text-sm text-gray-500">Doador: {movement.doador}</p>
                  )}
                  {movement.familia && (
                    <p className="text-sm text-gray-500">Família: {movement.familia}</p>
                  )}
                  {movement.observacoes && (
                    <p className="text-sm text-gray-500 italic">{movement.observacoes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
