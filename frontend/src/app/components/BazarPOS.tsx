import { useState } from 'react';
import { ShoppingCart, Plus, Trash2, DollarSign, CreditCard, Smartphone, Banknote, FileText, TrendingUp } from 'lucide-react';
import { mockBazarItems, mockBazarSales, type BazarItem } from './mockData';

export function BazarPOS() {
  const [activeView, setActiveView] = useState<'dashboard' | 'stock' | 'pdv' | 'receipt'>('dashboard');
  const [cart, setCart] = useState<{ item: BazarItem; quantity: number }[]>([]);
  const [customer, setCustomer] = useState({ nome: '', telefone: '' });
  const [paymentMethod, setPaymentMethod] = useState<'dinheiro' | 'cartao' | 'pix'>('dinheiro');

  const totalVendasHoje = mockBazarSales
    .filter((sale) => sale.data === '2026-04-24')
    .reduce((sum, sale) => sum + sale.total, 0);

  const itensVendidosHoje = mockBazarSales
    .filter((sale) => sale.data === '2026-04-24')
    .reduce((sum, sale) => sum + sale.itens.reduce((s, i) => s + i.quantidade, 0), 0);

  const addToCart = (item: BazarItem) => {
    const existing = cart.find((c) => c.item.id === item.id);
    if (existing) {
      if (existing.quantity < item.quantidade) {
        setCart(
          cart.map((c) =>
            c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
          )
        );
      }
    } else {
      setCart([...cart, { item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((c) => c.item.id !== itemId));
  };

  const adjustQuantity = (itemId: string, delta: number) => {
    setCart(
      cart
        .map((c) => {
          if (c.item.id === itemId) {
            const newQty = c.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > c.item.quantidade) return c;
            return { ...c, quantity: newQty };
          }
          return c;
        })
        .filter((c) => c !== null) as { item: BazarItem; quantity: number }[]
    );
  };

  const getCartTotal = () => {
    return cart.reduce((sum, c) => sum + c.item.preco * c.quantity, 0);
  };

  const handleFinalizeSale = () => {
    console.log('Venda finalizada:', { cart, customer, paymentMethod, total: getCartTotal() });
    alert('Venda registrada com sucesso!');
    setActiveView('receipt');
  };

  const handleNewSale = () => {
    setCart([]);
    setCustomer({ nome: '', telefone: '' });
    setPaymentMethod('dinheiro');
    setActiveView('pdv');
  };

  // Dashboard View
  if (activeView === 'dashboard') {
    return (
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-green-800 mb-1">Vendas Hoje</p>
            <p className="text-3xl text-green-900">R$ {totalVendasHoje.toFixed(2)}</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-blue-800 mb-1">Itens Vendidos Hoje</p>
            <p className="text-3xl text-blue-900">{itensVendidosHoje}</p>
          </div>

          <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-sm text-purple-800 mb-1">Transações Hoje</p>
            <p className="text-3xl text-purple-900">
              {mockBazarSales.filter((s) => s.data === '2026-04-24').length}
            </p>
          </div>
        </div>

        {/* Ações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setActiveView('pdv')}
            className="p-8 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-3"
          >
            <ShoppingCart className="w-8 h-8" />
            <span className="text-xl">Iniciar Nova Venda</span>
          </button>

          <button
            onClick={() => setActiveView('stock')}
            className="p-8 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-3"
          >
            <FileText className="w-8 h-8" />
            <span className="text-xl">Estoque do Bazar</span>
          </button>
        </div>

        {/* Últimas Vendas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg text-gray-900">Últimas Vendas</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {mockBazarSales.slice(-5).reverse().map((sale) => (
              <div key={sale.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-900">Venda #{sale.id}</span>
                  <span className="text-green-600">R$ {sale.total.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{new Date(sale.data).toLocaleDateString('pt-BR')}</span>
                  <span>{sale.metodoPagamento}</span>
                  <span>{sale.vendedor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Stock View
  if (activeView === 'stock') {
    const categories = Array.from(new Set(mockBazarItems.map((item) => item.categoria)));

    return (
      <div className="space-y-6">
        <button
          onClick={() => setActiveView('dashboard')}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          ← Voltar
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl text-gray-900 mb-6">Estoque do Bazar</h3>

          {categories.map((category) => (
            <div key={category} className="mb-6">
              <h4 className="text-gray-900 mb-3">{category}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockBazarItems
                  .filter((item) => item.categoria === category)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <h5 className="text-gray-900 mb-2">{item.nome}</h5>
                      <p className="text-sm text-gray-600 mb-3">{item.descricao}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                        {item.tamanho && (
                          <div>
                            <span className="text-gray-500">Tamanho:</span> {item.tamanho}
                          </div>
                        )}
                        {item.cor && (
                          <div>
                            <span className="text-gray-500">Cor:</span> {item.cor}
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">Condição:</span> {item.condicao}
                        </div>
                        <div>
                          <span className="text-gray-500">Estoque:</span> {item.quantidade}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg text-green-600">
                          R$ {item.preco.toFixed(2)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            item.quantidade > 5
                              ? 'bg-green-100 text-green-800'
                              : item.quantidade > 0
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.quantidade > 5
                            ? 'Disponível'
                            : item.quantidade > 0
                            ? 'Últimas unidades'
                            : 'Esgotado'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // PDV View
  if (activeView === 'pdv') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Carrinho (esquerda) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl text-gray-900 mb-6 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Carrinho
          </h3>

          <div className="space-y-3 mb-6 max-h-96 overflow-auto">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Carrinho vazio</p>
              </div>
            ) : (
              cart.map((c) => (
                <div
                  key={c.item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-gray-900">{c.item.nome}</p>
                    <p className="text-sm text-gray-600">R$ {c.item.preco.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => adjustQuantity(c.item.id, -1)}
                        className="w-7 h-7 bg-red-100 text-red-600 rounded hover:bg-red-200 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-gray-900">{c.quantity}</span>
                      <button
                        onClick={() => adjustQuantity(c.item.id, 1)}
                        className="w-7 h-7 bg-green-100 text-green-600 rounded hover:bg-green-200 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(c.item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t-2 border-gray-200 pt-4">
            <div className="flex items-center justify-between text-2xl mb-6">
              <span className="text-gray-900">Total:</span>
              <span className="text-green-600">R$ {getCartTotal().toFixed(2)}</span>
            </div>

            <button
              onClick={() => setActiveView('dashboard')}
              className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 mb-2"
            >
              Cancelar Venda
            </button>
          </div>
        </div>

        {/* Produtos e Checkout (direita) */}
        <div className="space-y-6">
          {/* Produtos Disponíveis */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl text-gray-900 mb-4">Produtos Disponíveis</h3>
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-auto">
              {mockBazarItems
                .filter((item) => item.quantidade > 0)
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-red-400 hover:bg-red-50 transition-colors text-left"
                  >
                    <p className="text-sm text-gray-900 mb-1">{item.nome}</p>
                    <p className="text-xs text-gray-600 mb-2">{item.descricao}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-green-600">R$ {item.preco.toFixed(2)}</span>
                      <Plus className="w-4 h-4 text-red-600" />
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {/* Cliente e Pagamento */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl text-gray-900 mb-4">Dados do Cliente (opcional)</h3>

            <div className="space-y-3 mb-6">
              <input
                type="text"
                placeholder="Nome"
                value={customer.nome}
                onChange={(e) => setCustomer({ ...customer, nome: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Telefone"
                value={customer.telefone}
                onChange={(e) => setCustomer({ ...customer, telefone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <h4 className="text-gray-900 mb-3">Método de Pagamento</h4>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => setPaymentMethod('dinheiro')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  paymentMethod === 'dinheiro'
                    ? 'border-red-600 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <Banknote className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="text-xs text-gray-900">Dinheiro</p>
              </button>

              <button
                onClick={() => setPaymentMethod('cartao')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  paymentMethod === 'cartao'
                    ? 'border-red-600 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <CreditCard className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-xs text-gray-900">Cartão</p>
              </button>

              <button
                onClick={() => setPaymentMethod('pix')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  paymentMethod === 'pix'
                    ? 'border-red-600 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <Smartphone className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <p className="text-xs text-gray-900">Pix</p>
              </button>
            </div>

            <button
              onClick={handleFinalizeSale}
              disabled={cart.length === 0}
              className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
            >
              <DollarSign className="w-5 h-5" />
              Finalizar Venda - R$ {getCartTotal().toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Receipt View
  if (activeView === 'receipt') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl text-gray-900 mb-2">Venda Realizada!</h3>
            <p className="text-gray-600">Comprovante gerado com sucesso</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <span className="text-gray-600">Data:</span>
              <span className="text-gray-900">{new Date().toLocaleDateString('pt-BR')}</span>
            </div>

            <h4 className="text-gray-900 mb-3">Itens:</h4>
            <div className="space-y-2 mb-4">
              {cart.map((c) => (
                <div key={c.item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {c.quantity}x {c.item.nome}
                  </span>
                  <span className="text-gray-900">R$ {(c.item.preco * c.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t-2 border-gray-300">
              <div className="flex justify-between text-xl">
                <span className="text-gray-900">Total:</span>
                <span className="text-green-600">R$ {getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-600">Pagamento:</span>
                <span className="text-gray-900 capitalize">{paymentMethod}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleNewSale}
            className="w-full px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-lg"
          >
            <Plus className="w-5 h-5" />
            Nova Venda
          </button>
        </div>
      </div>
    );
  }

  return null;
}
