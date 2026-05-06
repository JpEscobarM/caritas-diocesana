import { useState } from 'react';
import { Calendar, Clock, User, FileText, CheckCircle, XCircle, AlertCircle, ChevronRight, Plus, Search } from 'lucide-react';
import { mockVisits, mockFamilies, type Visit } from './mockData';

export function HomeVisits() {
  const [activeView, setActiveView] = useState<'agenda' | 'profile' | 'schedule' | 'execute'>('agenda');
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [newVisit, setNewVisit] = useState({
    familiaId: '',
    data: '',
    horario: '',
    voluntario: '',
  });
  const [visitExecution, setVisitExecution] = useState({
    observacoes: '',
    status: 'concluida' as 'concluida' | 'cancelada',
    resultado: '',
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'agendada':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'concluida':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelada':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <AlertCircle className="w-4 h-4" />;
      case 'agendada':
        return <Clock className="w-4 h-4" />;
      case 'concluida':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelada':
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleScheduleVisit = () => {
    console.log('Visita agendada:', newVisit);
    alert('Visita agendada com sucesso!');
    setActiveView('agenda');
    setNewVisit({ familiaId: '', data: '', horario: '', voluntario: '' });
  };

  const handleExecuteVisit = () => {
    console.log('Visita executada:', visitExecution);
    alert('Visita registrada com sucesso!');
    setActiveView('agenda');
    setSelectedVisit(null);
  };

  // Agenda View
  if (activeView === 'agenda') {
    return (
      <div className="space-y-6">
        {/* Header com KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
            <div className="flex items-center justify-between">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
              <span className="text-2xl text-yellow-900">
                {mockVisits.filter((v) => v.status === 'pendente').length}
              </span>
            </div>
            <p className="text-sm text-yellow-800 mt-2">Pendentes</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <Clock className="w-8 h-8 text-blue-600" />
              <span className="text-2xl text-blue-900">
                {mockVisits.filter((v) => v.status === 'agendada').length}
              </span>
            </div>
            <p className="text-sm text-blue-800 mt-2">Agendadas</p>
          </div>

          <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
            <div className="flex items-center justify-between">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <span className="text-2xl text-green-900">
                {mockVisits.filter((v) => v.status === 'concluida').length}
              </span>
            </div>
            <p className="text-sm text-green-800 mt-2">Concluídas</p>
          </div>

          <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
            <button
              onClick={() => setActiveView('schedule')}
              className="w-full h-full flex flex-col items-center justify-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-8 h-8" />
              <span className="text-sm">Nova Visita</span>
            </button>
          </div>
        </div>

        {/* Lista de Visitas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg text-gray-900">Agenda de Visitas</h3>
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {mockVisits.map((visit) => (
              <div
                key={visit.id}
                className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedFamily(visit.familiaId);
                  setActiveView('profile');
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-gray-900">{visit.familiaNome}</h4>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs border ${getStatusColor(
                          visit.status
                        )}`}
                      >
                        {getStatusIcon(visit.status)}
                        {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(visit.data).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {visit.horario}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {visit.voluntario}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {visit.status === 'agendada' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVisit(visit);
                          setActiveView('execute');
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        Executar Visita
                      </button>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Profile View
  if (activeView === 'profile' && selectedFamily) {
    const family = mockFamilies.find((f) => f.id === selectedFamily);
    if (!family) return null;

    return (
      <div className="space-y-6">
        <button
          onClick={() => {
            setActiveView('agenda');
            setSelectedFamily(null);
          }}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          ← Voltar para agenda
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl text-gray-900 mb-6">Perfil da Família</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-sm text-gray-600">Responsável</label>
              <p className="text-gray-900">{family.responsavel.nome}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">CPF</label>
              <p className="text-gray-900">{family.responsavel.cpf}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Telefone</label>
              <p className="text-gray-900">{family.responsavel.telefone}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Endereço</label>
              <p className="text-gray-900">
                {family.responsavel.endereco}, {family.responsavel.bairro}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm text-gray-600 mb-2 block">Membros da Família</label>
            <div className="space-y-2">
              {family.membros.map((membro) => (
                <div key={membro.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">
                    {membro.nome} - {membro.parentesco} ({membro.idade} anos)
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-gray-900 mb-4">Histórico de Atendimentos</h4>
            <div className="space-y-4">
              {family.beneficiosRecebidos.map((beneficio) => (
                <div
                  key={beneficio.id}
                  className="flex gap-4 pb-4 border-b border-gray-200 last:border-0"
                >
                  <div className="flex-shrink-0 w-2 bg-blue-600 rounded-full"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        {new Date(beneficio.data).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="text-xs text-gray-500">{beneficio.paroquia}</span>
                    </div>
                    <p className="text-gray-900 mb-2">Benefício concedido</p>
                    <div className="text-sm text-gray-600">
                      {beneficio.itens.map((item, idx) => (
                        <span key={idx}>
                          {item.quantidade}x {item.nome}
                          {idx < beneficio.itens.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                    {beneficio.observacoes && (
                      <p className="text-sm text-gray-500 mt-2 italic">
                        {beneficio.observacoes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveView('schedule')}
          className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-lg"
        >
          <Plus className="w-5 h-5" />
          Agendar Nova Visita
        </button>
      </div>
    );
  }

  // Schedule View
  if (activeView === 'schedule') {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setActiveView('agenda')}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          ← Voltar
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl text-gray-900 mb-6">Agendar Visita Domiciliar</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Família *</label>
              <select
                value={newVisit.familiaId}
                onChange={(e) => setNewVisit({ ...newVisit, familiaId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione a família...</option>
                {mockFamilies.map((family) => (
                  <option key={family.id} value={family.id}>
                    {family.responsavel.nome} - {family.responsavel.endereco}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Data *</label>
                <input
                  type="date"
                  value={newVisit.data}
                  onChange={(e) => setNewVisit({ ...newVisit, data: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Horário *</label>
                <input
                  type="time"
                  value={newVisit.horario}
                  onChange={(e) => setNewVisit({ ...newVisit, horario: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Voluntário Responsável *</label>
              <input
                type="text"
                value={newVisit.voluntario}
                onChange={(e) => setNewVisit({ ...newVisit, voluntario: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome do voluntário"
              />
            </div>
          </div>

          <button
            onClick={handleScheduleVisit}
            disabled={!newVisit.familiaId || !newVisit.data || !newVisit.horario || !newVisit.voluntario}
            className="mt-6 w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          >
            <CheckCircle className="w-5 h-5" />
            Confirmar Agendamento
          </button>
        </div>
      </div>
    );
  }

  // Execute View
  if (activeView === 'execute' && selectedVisit) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => {
            setActiveView('agenda');
            setSelectedVisit(null);
          }}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          ← Voltar
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl text-gray-900 mb-6">Registrar Visita Domiciliar</h3>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Família:</span>
                <p className="text-blue-900">{selectedVisit.familiaNome}</p>
              </div>
              <div>
                <span className="text-blue-700">Data/Hora:</span>
                <p className="text-blue-900">
                  {new Date(selectedVisit.data).toLocaleDateString('pt-BR')} às{' '}
                  {selectedVisit.horario}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Status da Visita *</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 cursor-pointer flex-1">
                  <input
                    type="radio"
                    name="status"
                    value="concluida"
                    checked={visitExecution.status === 'concluida'}
                    onChange={(e) =>
                      setVisitExecution({
                        ...visitExecution,
                        status: e.target.value as 'concluida',
                      })
                    }
                    className="w-5 h-5"
                  />
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-900">Concluída</span>
                </label>

                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-red-500 cursor-pointer flex-1">
                  <input
                    type="radio"
                    name="status"
                    value="cancelada"
                    checked={visitExecution.status === 'cancelada'}
                    onChange={(e) =>
                      setVisitExecution({
                        ...visitExecution,
                        status: e.target.value as 'cancelada',
                      })
                    }
                    className="w-5 h-5"
                  />
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-gray-900">Cancelada</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Observações da Visita *</label>
              <textarea
                value={visitExecution.observacoes}
                onChange={(e) =>
                  setVisitExecution({ ...visitExecution, observacoes: e.target.value })
                }
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descreva o que foi observado durante a visita, condições da família, necessidades identificadas, etc."
              />
            </div>

            {visitExecution.status === 'concluida' && (
              <div>
                <label className="block text-gray-700 mb-2">
                  Resultado / Encaminhamentos
                </label>
                <textarea
                  value={visitExecution.resultado}
                  onChange={(e) =>
                    setVisitExecution({ ...visitExecution, resultado: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descreva os encaminhamentos realizados ou necessários..."
                />
              </div>
            )}
          </div>

          <button
            onClick={handleExecuteVisit}
            disabled={!visitExecution.observacoes}
            className="mt-6 w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          >
            <FileText className="w-5 h-5" />
            Registrar Visita
          </button>
        </div>
      </div>
    );
  }

  return null;
}
