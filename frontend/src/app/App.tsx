import { useState } from 'react';
import { Heart, Building2, Church, AlertTriangle, Calendar, Package, Users, Home, ClipboardList, DollarSign, LogOut, Bell, BarChart3, FileText, Settings, ChevronLeft, ChevronRight, TrendingUp, ShoppingBag } from 'lucide-react';
import { FamilyRegistration } from './components/FamilyRegistration';
import { HomeVisits } from './components/HomeVisits';
import { BenefitsManagement } from './components/BenefitsManagement';
import { StockControl } from './components/StockControl';
import { BazarPOS } from './components/BazarPOS';

type Profile = 'diocese' | 'paroquia' | null;

export default function App() {
  const [selectedProfile, setSelectedProfile] = useState<Profile>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('geral');
  const [paroquia, setParoquia] = useState('');
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [showMissingItems, setShowMissingItems] = useState(false);
  const [showExpiringItems, setShowExpiringItems] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showFamilyRegistration, setShowFamilyRegistration] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedProfile === 'paroquia') {
      if (!paroquia) {
        setError('Por favor, selecione uma paróquia');
        return;
      }
      if (usuario === 'joao' && senha === '123') {
        setIsLoggedIn(true);
      } else {
        setError('Usuário ou senha incorretos');
      }
    } else if (selectedProfile === 'diocese') {
      if (usuario === 'davi' && senha === '123') {
        setIsLoggedIn(true);
      } else {
        setError('Usuário ou senha incorretos');
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSelectedProfile(null);
    setParoquia('');
    setUsuario('');
    setSenha('');
    setError('');
    setActiveTab('geral');
  };

  // Cáritas Diocesana Interface
  if (isLoggedIn && selectedProfile === 'diocese') {
    const menuItems = [
      { id: 'geral', label: 'Painel Geral', icon: Home },
      { id: 'paroquias', label: 'Paróquias', icon: Church },
      { id: 'estoque-diocesano', label: 'Estoque Diocesano', icon: Package },
      { id: 'bazar', label: 'Bazar Diocesano', icon: ShoppingBag },
      { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
      { id: 'documentos', label: 'Documentos', icon: FileText },
      { id: 'configuracoes', label: 'Configurações', icon: Settings },
    ];

    return (
      <div className="size-full flex bg-background">
        {/* Sidebar */}
        <aside className={`bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
          {/* Logo */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-sidebar-primary-foreground rounded-lg flex-shrink-0">
                <Heart className="w-6 h-6 text-sidebar-primary fill-sidebar-primary" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className="text-sm font-medium">Cáritas Diocesana</h1>
                  <p className="text-xs text-sidebar-foreground/70">Painel Administrativo</p>
                </div>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 py-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                  activeTab === item.id
                    ? 'bg-sidebar-accent border-l-4 border-sidebar-primary text-sidebar-accent-foreground'
                    : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
                }`}
                title={sidebarCollapsed ? item.label : ''}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${activeTab === item.id ? 'text-sidebar-primary' : ''}`} />
                {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-sidebar-border">
            {!sidebarCollapsed && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center">
                    <span className="text-sm text-sidebar-primary-foreground font-medium">D</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Davi</p>
                    <p className="text-xs text-sidebar-foreground/70">Administrador</p>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-sidebar-accent hover:bg-sidebar-accent/80 rounded-lg text-sm transition-colors text-sidebar-accent-foreground"
              title={sidebarCollapsed ? 'Sair' : ''}
            >
              <LogOut className="w-4 h-4 text-sidebar-primary" />
              {!sidebarCollapsed && <span>Sair</span>}
            </button>
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute top-20 -right-3 w-6 h-6 bg-sidebar rounded-full flex items-center justify-center border-2 border-border hover:bg-sidebar-accent transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-3 h-3 text-sidebar-foreground" /> : <ChevronLeft className="w-3 h-3 text-sidebar-foreground" />}
          </button>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl text-foreground font-medium">
                  {menuItems.find((item) => item.id === activeTab)?.label || 'Painel Geral'}
                </h2>
                <p className="text-sm text-muted-foreground">Gestão Diocesana de Recursos</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="relative p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
                </button>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-auto p-6 bg-background">
            {activeTab === 'geral' && (
              <div className="max-w-7xl mx-auto space-y-6">
                {/* Estatísticas Gerais */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <Church className="w-8 h-8 text-primary" />
                      <TrendingUp className="w-4 h-4 text-success" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Paróquias Ativas</p>
                    <p className="text-3xl text-foreground font-medium">24</p>
                  </div>

                  <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="w-8 h-8 text-secondary" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Famílias Cadastradas</p>
                    <p className="text-3xl text-foreground font-medium">1.847</p>
                  </div>

                  <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <Package className="w-8 h-8 text-success" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Itens em Estoque (Geral)</p>
                    <p className="text-3xl text-foreground font-medium">3.542</p>
                  </div>

                  <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <Heart className="w-8 h-8 text-accent fill-accent" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Atendimentos (Este Mês)</p>
                    <p className="text-3xl text-foreground font-medium">312</p>
                  </div>
                </div>

                {/* Alertas Diocesanos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-warning/10 border-2 border-warning/30 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-foreground font-medium mb-2">Paróquias com Itens em Falta</h3>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• Paróquia Sagrado Coração (3 itens)</li>
                          <li>• Paróquia Nossa Senhora Aparecida (5 itens)</li>
                          <li>• Paróquia São José (2 itens)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-destructive/10 border-2 border-destructive/30 rounded-xl p-5">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-destructive flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-foreground font-medium mb-2">Validade Próxima (Diocesano)</h3>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• 120 pacotes de feijão (vencendo em 7 dias)</li>
                          <li>• 45 sachês de milho verde (vencendo em 15 dias)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabela de Paróquias */}
                <div className="bg-card rounded-xl shadow-sm border border-border">
                  <div className="p-6 border-b border-border">
                    <h3 className="text-lg text-foreground font-medium">Visão Geral das Paróquias</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted border-b border-border">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Paróquia</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Famílias</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Estoque</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Atendimentos (Mês)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {[
                          { nome: 'Paróquia Sagrado Coração de Jesus', familias: 142, estoque: 184, atendimentos: 23, status: 'Ativo' },
                          { nome: 'Paróquia Nossa Senhora Aparecida', familias: 238, estoque: 312, atendimentos: 45, status: 'Ativo' },
                          { nome: 'Paróquia São José', familias: 187, estoque: 256, atendimentos: 34, status: 'Ativo' },
                          { nome: 'Paróquia Santo Antônio', familias: 156, estoque: 198, atendimentos: 28, status: 'Ativo' },
                        ].map((paroquia, index) => (
                          <tr key={index} className="hover:bg-muted/50 transition-colors">
                            <td className="px-6 py-4 text-sm text-foreground font-medium">{paroquia.nome}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{paroquia.familias}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{paroquia.estoque}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{paroquia.atendimentos}</td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                                {paroquia.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bazar' && <BazarPOS />}

            {activeTab !== 'geral' && activeTab !== 'bazar' && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-card rounded-xl p-12 shadow-sm border border-border text-center">
                  <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-xl text-foreground font-medium mb-2">Em desenvolvimento</h3>
                  <p className="text-muted-foreground">Esta seção será implementada em breve.</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  // Cáritas Paroquial Interface
  if (isLoggedIn && selectedProfile === 'paroquia') {
    const menuItems = [
      { id: 'geral', label: 'Painel Geral', icon: Home },
      { id: 'nucleos', label: 'Núcleos Familiares', icon: Users },
      { id: 'estoque', label: 'Estoque Paroquial', icon: Package },
      { id: 'visitas', label: 'Visitas Domiciliares', icon: ClipboardList },
      { id: 'prestacao', label: 'Prestação de Contas', icon: DollarSign },
    ];

    return (
      <div className="size-full flex bg-background">
        {/* Sidebar */}
        <aside className={`bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
          {/* Logo */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-sidebar-primary-foreground rounded-lg flex-shrink-0">
                <Heart className="w-6 h-6 text-sidebar-primary fill-sidebar-primary" />
              </div>
              {!sidebarCollapsed && (
                <div>
                  <h1 className="text-sm font-medium">Cáritas Paroquial</h1>
                  <p className="text-xs text-sidebar-foreground/70">Sagrado Coração</p>
                </div>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 py-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                  activeTab === item.id
                    ? 'bg-sidebar-accent border-l-4 border-sidebar-primary text-sidebar-accent-foreground'
                    : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
                }`}
                title={sidebarCollapsed ? item.label : ''}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${activeTab === item.id ? 'text-sidebar-primary' : ''}`} />
                {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-sidebar-border">
            {!sidebarCollapsed && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center">
                    <span className="text-sm text-sidebar-primary-foreground font-medium">J</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">João</p>
                    <p className="text-xs text-sidebar-foreground/70">Voluntário</p>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-sidebar-accent hover:bg-sidebar-accent/80 rounded-lg text-sm transition-colors text-sidebar-accent-foreground"
              title={sidebarCollapsed ? 'Sair' : ''}
            >
              <LogOut className="w-4 h-4 text-sidebar-primary" />
              {!sidebarCollapsed && <span>Sair</span>}
            </button>
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute top-20 -right-3 w-6 h-6 bg-sidebar rounded-full flex items-center justify-center border-2 border-border hover:bg-sidebar-accent transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-3 h-3 text-sidebar-foreground" /> : <ChevronLeft className="w-3 h-3 text-sidebar-foreground" />}
          </button>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl text-foreground font-medium">
                  {menuItems.find((item) => item.id === activeTab)?.label || 'Painel Geral'}
                </h2>
                <p className="text-sm text-muted-foreground">Paróquia Sagrado Coração de Jesus</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="relative p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
                </button>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-auto p-6 bg-background">
            {activeTab === 'geral' && (
              <div className="max-w-6xl mx-auto space-y-6">
                {/* Alertas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Alerta de Itens em Falta */}
                  <div className="bg-warning/10 border-2 border-warning/30 rounded-xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-warning" />
                        <h3 className="text-foreground font-medium">Itens em Falta!</h3>
                      </div>
                      <button
                        onClick={() => setShowMissingItems(!showMissingItems)}
                        className="text-sm text-warning hover:text-warning/80 underline font-medium"
                      >
                        {showMissingItems ? 'Ocultar' : 'Verificar'}
                      </button>
                    </div>
                    {showMissingItems && (
                      <div className="mt-3 pt-3 border-t border-warning/20">
                        <p className="text-sm text-foreground mb-2">Mercadorias em falta:</p>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• Jaqueta Masculina G</li>
                          <li>• Calça Feminina Infantil</li>
                          <li>• Camiseta Masculina Manga Curta - P</li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Alerta de Itens com Validade Próxima */}
                  <div className="bg-destructive/10 border-2 border-destructive/30 rounded-xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-destructive" />
                        <h3 className="text-foreground font-medium">Itens com Validade Próxima!</h3>
                      </div>
                      <button
                        onClick={() => setShowExpiringItems(!showExpiringItems)}
                        className="text-sm text-destructive hover:text-destructive/80 underline font-medium"
                      >
                        {showExpiringItems ? 'Ocultar' : 'Verificar'}
                      </button>
                    </div>
                    {showExpiringItems && (
                      <div className="mt-3 pt-3 border-t border-destructive/20">
                        <p className="text-sm text-foreground mb-2">Itens com validade próxima:</p>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• 35 pacotes de feijão vencendo em <strong className="text-destructive">7 DIAS</strong></li>
                          <li>• 12 sachês de milho verde vencendo em <strong className="text-destructive">15 DIAS</strong></li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cards de Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <Package className="w-8 h-8 text-secondary" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Estoque atual</p>
                    <p className="text-3xl text-foreground font-medium">184 itens</p>
                  </div>

                  <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <Heart className="w-8 h-8 text-success fill-success" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Itens doados neste mês</p>
                    <p className="text-3xl text-foreground font-medium">12</p>
                  </div>

                  <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Famílias atendidas neste mês</p>
                    <p className="text-3xl text-foreground font-medium">3</p>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                  <h3 className="text-foreground font-medium mb-4">Ações Rápidas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <button
                      onClick={() => setShowFamilyRegistration(true)}
                      className="px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Novo Cadastro
                    </button>
                    <button
                      onClick={() => setActiveTab('estoque')}
                      className="px-4 py-3 bg-success text-primary-foreground rounded-lg hover:bg-success/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Package className="w-4 h-4" />
                      Consultar Estoque
                    </button>
                    <button
                      onClick={() => setActiveTab('visitas')}
                      className="px-4 py-3 bg-secondary text-primary-foreground rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <ClipboardList className="w-4 h-4" />
                      Visitas
                    </button>
                    <button
                      onClick={() => setActiveTab('prestacao')}
                      className="px-4 py-3 bg-accent text-primary-foreground rounded-lg hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Heart className="w-4 h-4" />
                      Conceder Benefício
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'nucleos' && (
              <>
                {showFamilyRegistration ? (
                  <FamilyRegistration onClose={() => setShowFamilyRegistration(false)} />
                ) : (
                  <div className="max-w-6xl mx-auto">
                    <div className="bg-card rounded-xl p-12 shadow-sm border border-border text-center">
                      <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="text-xl text-foreground font-medium mb-4">Núcleos Familiares</h3>
                      <p className="text-muted-foreground mb-6">
                        Gerencie o cadastro das famílias atendidas pela paróquia
                      </p>
                      <button
                        onClick={() => setShowFamilyRegistration(true)}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Novo Cadastro Familiar
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'estoque' && <StockControl />}

            {activeTab === 'visitas' && <HomeVisits />}

            {activeTab === 'prestacao' && <BenefitsManagement />}

            {activeTab !== 'geral' &&
              activeTab !== 'nucleos' &&
              activeTab !== 'estoque' &&
              activeTab !== 'visitas' &&
              activeTab !== 'prestacao' && (
                <div className="max-w-6xl mx-auto">
                  <div className="bg-card rounded-xl p-12 shadow-sm border border-border text-center">
                    <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-xl text-foreground font-medium mb-2">Em desenvolvimento</h3>
                    <p className="text-muted-foreground">Esta seção será implementada em breve.</p>
                  </div>
                </div>
              )}
          </main>
        </div>
      </div>
    );
  }

  // Interface de Login
  return (
    <div className="size-full flex items-center justify-center bg-background">
      <div className="w-full max-w-md mx-auto px-6">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4 shadow-lg shadow-primary/20">
            <Heart className="w-8 h-8 text-primary-foreground fill-primary-foreground" />
          </div>
          <h1 className="text-3xl mb-2 text-foreground font-medium">Sistema Cáritas</h1>
          <p className="text-muted-foreground">Gestão Integrada de Assistência Social</p>
        </div>

        {/* Card de Login */}
        <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
          {!selectedProfile ? (
            <>
              <h2 className="text-xl mb-6 text-center text-foreground font-medium">Selecione seu perfil de acesso</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedProfile('diocese')}
                  className="w-full flex items-center gap-4 p-4 border-2 border-border rounded-xl hover:border-primary hover:bg-muted transition-all group"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-lg group-hover:bg-primary transition-colors">
                    <Building2 className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <div className="text-left">
                    <div className="text-foreground font-medium">Cáritas Diocesana</div>
                    <div className="text-sm text-muted-foreground">Acesso administrativo diocesano</div>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedProfile('paroquia')}
                  className="w-full flex items-center gap-4 p-4 border-2 border-border rounded-xl hover:border-primary hover:bg-muted transition-all group"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-lg group-hover:bg-primary transition-colors">
                    <Church className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <div className="text-left">
                    <div className="text-foreground font-medium">Cáritas Paroquial</div>
                    <div className="text-sm text-muted-foreground">Acesso paroquial</div>
                  </div>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl text-foreground font-medium">
                  {selectedProfile === 'diocese' ? 'Cáritas Diocesana' : 'Cáritas Paroquial'}
                </h2>
                <button
                  onClick={() => setSelectedProfile(null)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Voltar
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {selectedProfile === 'paroquia' && (
                  <div>
                    <label className="block text-sm text-foreground font-medium mb-2">Paróquia</label>
                    <select
                      value={paroquia}
                      onChange={(e) => setParoquia(e.target.value)}
                      className="w-full px-4 py-3 bg-input-background border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    >
                      <option value="">Selecione sua paróquia</option>
                      <option value="sagrado-coracao">Paróquia Sagrado Coração de Jesus</option>
                      <option value="nossa-senhora">Paróquia Nossa Senhora Aparecida</option>
                      <option value="sao-jose">Paróquia São José</option>
                      <option value="santo-antonio">Paróquia Santo Antônio</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-foreground font-medium mb-2">Usuário</label>
                  <input
                    type="text"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    placeholder="Digite seu usuário"
                    className="w-full px-4 py-3 bg-input-background border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm text-foreground font-medium mb-2">Senha</label>
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full px-4 py-3 bg-input-background border border-border text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 mt-2 rounded-lg text-primary-foreground bg-primary hover:bg-primary/90 transition-colors font-medium shadow-md shadow-primary/20"
                >
                  Entrar
                </button>
              </form>

              <div className="mt-6 text-center">
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Esqueceu sua senha?
                </a>
              </div>
            </>
          )}
        </div>

        {/* Rodapé */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Sistema de Gestão Integrada - Cáritas Diocesana</p>
        </div>
      </div>
    </div>
  );
}