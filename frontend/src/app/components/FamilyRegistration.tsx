import { useState } from 'react';
import { Search, Plus, Trash2, ArrowLeft, ArrowRight, Check, User, Users as UsersIcon, FileText } from 'lucide-react';
import { Wizard } from './Wizard';
import { mockFamilies, type Family, type FamilyMember } from './mockData';

interface FamilyRegistrationProps {
  onClose: () => void;
}

export function FamilyRegistration({ onClose }: FamilyRegistrationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<Family[]>([]);

  // Form data
  const [responsavel, setResponsavel] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    endereco: '',
    cidade: 'Caxias do Sul',
    bairro: '',
  });

  const [membros, setMembros] = useState<FamilyMember[]>([]);
  const [newMember, setNewMember] = useState({
    nome: '',
    cpf: '',
    parentesco: '',
    idade: '',
  });

  const [dadosSocioeconomicos, setDadosSocioeconomicos] = useState({
    renda: '',
    moradia: '',
    necessidades: [] as string[],
  });

  const steps = ['Busca', 'Responsável', 'Membros', 'Socioeconômico', 'Revisão'];

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const results = mockFamilies.filter(
        (family) =>
          family.responsavel.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          family.responsavel.cpf.includes(searchTerm)
      );
      setSearchResults(results);
      setShowSearchResults(true);
    }
  };

  const handleAddMember = () => {
    if (newMember.nome && newMember.cpf && newMember.parentesco && newMember.idade) {
      setMembros([
        ...membros,
        {
          id: `M${Date.now()}`,
          nome: newMember.nome,
          cpf: newMember.cpf,
          parentesco: newMember.parentesco,
          idade: parseInt(newMember.idade),
        },
      ]);
      setNewMember({ nome: '', cpf: '', parentesco: '', idade: '' });
    }
  };

  const handleRemoveMember = (id: string) => {
    setMembros(membros.filter((m) => m.id !== id));
  };

  const toggleNecessidade = (necessidade: string) => {
    if (dadosSocioeconomicos.necessidades.includes(necessidade)) {
      setDadosSocioeconomicos({
        ...dadosSocioeconomicos,
        necessidades: dadosSocioeconomicos.necessidades.filter((n) => n !== necessidade),
      });
    } else {
      setDadosSocioeconomicos({
        ...dadosSocioeconomicos,
        necessidades: [...dadosSocioeconomicos.necessidades, necessidade],
      });
    }
  };

  const handleSubmit = () => {
    console.log('Cadastro realizado:', { responsavel, membros, dadosSocioeconomicos });
    alert('Família cadastrada com sucesso!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[calc(100dvh-1rem)] overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl text-gray-900">Cadastro de Núcleo Familiar</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          <Wizard steps={steps} currentStep={currentStep}>
            <div />
          </Wizard>
        </div>

        <div className="p-6">
          {/* Step 1: Busca */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Search className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl text-gray-900 mb-2">Verificar Cadastro Existente</h3>
                <p className="text-gray-600">
                  Busque por CPF ou nome para evitar duplicidade na rede
                </p>
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Digite CPF ou nome completo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSearch}
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>

              {showSearchResults && (
                <div className="mt-6">
                  {searchResults.length > 0 ? (
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                      <h4 className="text-lg text-yellow-900 mb-4">
                        ⚠️ Cadastros encontrados ({searchResults.length})
                      </h4>
                      {searchResults.map((family) => (
                        <div
                          key={family.id}
                          className="bg-white p-4 rounded-lg mb-3 border border-yellow-300"
                        >
                          <p className="text-gray-900">
                            <strong>{family.responsavel.nome}</strong>
                          </p>
                          <p className="text-sm text-gray-600">CPF: {family.responsavel.cpf}</p>
                          <p className="text-sm text-gray-600">
                            Paróquia: {family.paroquia}
                          </p>
                          <p className="text-sm text-gray-600">
                            Cadastrado em: {family.dataCadastro}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                      <Check className="w-12 h-12 text-green-600 mx-auto mb-3" />
                      <p className="text-green-900">
                        Nenhum cadastro encontrado. Pode prosseguir com o novo cadastro.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2 text-lg"
                >
                  <Plus className="w-5 h-5" />
                  Novo Cadastro Familiar
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Responsável */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-8 h-8 text-blue-600" />
                <h3 className="text-xl text-gray-900">Dados do Responsável</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">Nome Completo *</label>
                  <input
                    type="text"
                    value={responsavel.nome}
                    onChange={(e) => setResponsavel({ ...responsavel, nome: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome completo do responsável"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">CPF *</label>
                  <input
                    type="text"
                    value={responsavel.cpf}
                    onChange={(e) => setResponsavel({ ...responsavel, cpf: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="000.000.000-00"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Telefone *</label>
                  <input
                    type="text"
                    value={responsavel.telefone}
                    onChange={(e) => setResponsavel({ ...responsavel, telefone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">Endereço *</label>
                  <input
                    type="text"
                    value={responsavel.endereco}
                    onChange={(e) => setResponsavel({ ...responsavel, endereco: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Rua, número, complemento"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Bairro *</label>
                  <input
                    type="text"
                    value={responsavel.bairro}
                    onChange={(e) => setResponsavel({ ...responsavel, bairro: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome do bairro"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Cidade</label>
                  <input
                    type="text"
                    value={responsavel.cidade}
                    onChange={(e) => setResponsavel({ ...responsavel, cidade: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    disabled
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Membros */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <UsersIcon className="w-8 h-8 text-blue-600" />
                <h3 className="text-xl text-gray-900">Membros da Família</h3>
              </div>

              {/* Lista de membros */}
              {membros.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h4 className="text-gray-900 mb-3">Membros cadastrados ({membros.length})</h4>
                  <div className="space-y-2">
                    {membros.map((membro) => (
                      <div
                        key={membro.id}
                        className="bg-white p-3 rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <p className="text-gray-900">{membro.nome}</p>
                          <p className="text-sm text-gray-600">
                            {membro.parentesco} • {membro.idade} anos • CPF: {membro.cpf}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveMember(membro.id)}
                          className="text-red-600 hover:text-red-700 p-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulário novo membro */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <h4 className="text-blue-900 mb-4">Adicionar Membro</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 mb-2">Nome Completo</label>
                    <input
                      type="text"
                      value={newMember.nome}
                      onChange={(e) => setNewMember({ ...newMember, nome: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nome do membro"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">CPF</label>
                    <input
                      type="text"
                      value={newMember.cpf}
                      onChange={(e) => setNewMember({ ...newMember, cpf: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="000.000.000-00"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Idade</label>
                    <input
                      type="number"
                      value={newMember.idade}
                      onChange={(e) => setNewMember({ ...newMember, idade: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Idade"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-700 mb-2">Grau de Parentesco</label>
                    <select
                      value={newMember.parentesco}
                      onChange={(e) => setNewMember({ ...newMember, parentesco: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione...</option>
                      <option value="Esposo(a)">Esposo(a)</option>
                      <option value="Filho(a)">Filho(a)</option>
                      <option value="Pai/Mãe">Pai/Mãe</option>
                      <option value="Irmão(ã)">Irmão(ã)</option>
                      <option value="Avô(ó)">Avô(ó)</option>
                      <option value="Neto(a)">Neto(a)</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleAddMember}
                  className="mt-4 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Adicionar Membro
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Socioeconômico */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-8 h-8 text-blue-600" />
                <h3 className="text-xl text-gray-900">Dados Socioeconômicos</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-3">Renda Familiar *</label>
                  <div className="space-y-2">
                    {[
                      'Sem renda',
                      'Até 1 salário mínimo',
                      '1 a 2 salários mínimos',
                      '2 a 3 salários mínimos',
                      'Mais de 3 salários mínimos',
                    ].map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="renda"
                          value={option}
                          checked={dadosSocioeconomicos.renda === option}
                          onChange={(e) =>
                            setDadosSocioeconomicos({
                              ...dadosSocioeconomicos,
                              renda: e.target.value,
                            })
                          }
                          className="w-5 h-5"
                        />
                        <span className="text-gray-900">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-3">Tipo de Moradia *</label>
                  <div className="space-y-2">
                    {['Própria', 'Aluguel', 'Cedida', 'Ocupação', 'Situação de rua'].map(
                      (option) => (
                        <label
                          key={option}
                          className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="moradia"
                            value={option}
                            checked={dadosSocioeconomicos.moradia === option}
                            onChange={(e) =>
                              setDadosSocioeconomicos({
                                ...dadosSocioeconomicos,
                                moradia: e.target.value,
                              })
                            }
                            className="w-5 h-5"
                          />
                          <span className="text-gray-900">{option}</span>
                        </label>
                      )
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-3">
                    Necessidades Urgentes (selecione todas que se aplicam)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      'Alimentos',
                      'Roupas',
                      'Calçados',
                      'Material de higiene',
                      'Medicamentos',
                      'Auxílio moradia',
                      'Móveis',
                      'Eletrodomésticos',
                    ].map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={dadosSocioeconomicos.necessidades.includes(option)}
                          onChange={() => toggleNecessidade(option)}
                          className="w-5 h-5"
                        />
                        <span className="text-gray-900">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Revisão */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Check className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl text-gray-900 mb-2">Revisão do Cadastro</h3>
                <p className="text-gray-600">Confira os dados antes de confirmar</p>
              </div>

              <div className="space-y-4">
                {/* Responsável */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg text-gray-900 mb-4">Responsável</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Nome:</span>
                      <p className="text-gray-900">{responsavel.nome}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">CPF:</span>
                      <p className="text-gray-900">{responsavel.cpf}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Telefone:</span>
                      <p className="text-gray-900">{responsavel.telefone}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Bairro:</span>
                      <p className="text-gray-900">{responsavel.bairro}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Endereço:</span>
                      <p className="text-gray-900">{responsavel.endereco}</p>
                    </div>
                  </div>
                </div>

                {/* Membros */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg text-gray-900 mb-4">
                    Membros da Família ({membros.length})
                  </h4>
                  {membros.length > 0 ? (
                    <div className="space-y-2">
                      {membros.map((membro) => (
                        <div key={membro.id} className="text-sm text-gray-900">
                          • {membro.nome} ({membro.parentesco}, {membro.idade} anos)
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">Nenhum membro cadastrado</p>
                  )}
                </div>

                {/* Dados Socioeconômicos */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg text-gray-900 mb-4">Dados Socioeconômicos</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600">Renda Familiar:</span>
                      <p className="text-gray-900">{dadosSocioeconomicos.renda}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Tipo de Moradia:</span>
                      <p className="text-gray-900">{dadosSocioeconomicos.moradia}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Necessidades:</span>
                      <p className="text-gray-900">
                        {dadosSocioeconomicos.necessidades.length > 0
                          ? dadosSocioeconomicos.necessidades.join(', ')
                          : 'Nenhuma selecionada'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                <p className="text-green-900">
                  Ao confirmar, o núcleo familiar será cadastrado no sistema e estará disponível
                  para atendimento.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer com botões */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl flex justify-between">
          <button
            onClick={() => {
              if (currentStep === 0) {
                onClose();
              } else {
                setCurrentStep(currentStep - 1);
              }
            }}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 0 ? 'Cancelar' : 'Voltar'}
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={currentStep === 0 && !showSearchResults}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Próximo
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-lg"
            >
              <Check className="w-5 h-5" />
              Confirmar Cadastro
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
