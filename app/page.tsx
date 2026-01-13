"use client";

import { useState, useActionState, useMemo, useEffect, useRef } from "react";
import { submitContestation, type FormState } from "./actions";
import { 
  CheckCircle2, Loader2, Search, Building2, 
  Calendar, Phone, Mail, Hash, User, FileText, AlertCircle, Info, Paperclip, X, Plus
} from "lucide-react";

const BONUS_TYPES = [
  "Indicação de Novo Zubalero", "Meta de Produtividade", "Bônus de Domingo",
  "Bônus de Fim de Ano", "Bônus Adicional 2 Turnos", "Conectividade",
  "Hora Certa", "Bônus Ofertado por Whatsapp ou Push App",
  "Bônus Data Comemorativa", "Bônus de Treinamento", "Bônus Especial", "SKU / Item"
];

export default function ZubalePortal() {
  const [bonusSelected, setBonusSelected] = useState("");
  const [storeSearch, setStoreSearch] = useState("");
  const [phone, setPhone] = useState("+55");
  
  // Estado para gerenciar múltiplos arquivos
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [storesDatabase, setStoresDatabase] = useState<string[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(true);

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    submitContestation, 
    null
  );

  useEffect(() => {
    async function loadStores() {
      try {
        const response = await fetch("/api/stores");
        const data = await response.json();
        setStoresDatabase(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro ao carregar lojas");
      } finally {
        setIsLoadingStores(false);
      }
    }
    loadStores();
  }, []);

  const filteredStores = useMemo(() => {
    if (!storeSearch) return [];
    const searchLower = storeSearch.toLowerCase();
    return storesDatabase
      .filter(s => s.toLowerCase().includes(searchLower))
      .slice(0, 50);
  }, [storeSearch, storesDatabase]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (!val.startsWith("55")) val = "55" + val;
    setPhone("+" + val.substring(0, 13)); 
  };

  // Lógica para adicionar arquivos respeitando o limite de 5
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => {
        const totalFiles = [...prev, ...newFiles];
        return totalFiles.slice(0, 5); // Garante o limite de 5
      });
    }
    // Reseta o input para permitir selecionar o mesmo arquivo novamente se for removido
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Wrapper para garantir que todos os arquivos do estado sejam enviados no FormData
  const handleSubmit = (formData: FormData) => {
    formData.delete("evidencias_files"); // Limpa o input nativo
    selectedFiles.forEach(file => {
      formData.append("evidencias_files", file);
    });
    formAction(formData);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
              <Building2 className="text-white" size={24} />
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 block leading-tight tracking-tighter">
                ZUBALE <span className="text-blue-600">BRASIL</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Portal de Contestações</span>
            </div>
          </div>
          <div className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black border border-blue-100 hidden sm:block">
            AMBIENTE SEGURO
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-12">
        <div className="mb-12">
          <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight italic">
            Solicitar Revisão <br/> de Pagamento
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-xl">
            Preencha os dados abaixo para contestar divergências em bônus ou itens não pagos.
          </p>
        </div>

        {state?.success ? (
          <SuccessView />
        ) : (
          <form action={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
              <div className="p-8 md:p-12 space-y-10">
                
                <section className="space-y-6">
                  <SectionTitle number="01" title="Sua Identificação" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Protocolo Suporte" name="protocolo" icon={<Hash size={18}/>} placeholder="Ex: 20250001010101" required />
                    <InputField label="Nome Completo" name="nome" icon={<User size={18}/>} placeholder="Nome como no App" required />
                    <InputField label="Telefone" name="telefone" icon={<Phone size={18}/>} value={phone} onChange={handlePhoneChange} placeholder="+5511999999999" required />
                    <InputField label="E-mail Cadastrado" name="email" type="email" icon={<Mail size={18}/>} placeholder="exemplo@zubale.com" required />
                  </div>
                </section>

                <section className="space-y-6">
                  <SectionTitle number="02" title="Dados da Atuação" />
                  <div className="space-y-6">
                    <FieldWrapper label="O que deseja contestar?" icon={<AlertCircle size={18}/>}>
                      <select 
                        name="tipoSolicitacao" 
                        required 
                        className="custom-select"
                        onChange={(e) => setBonusSelected(e.target.value)}
                      >
                        <option value="">Selecione o tipo de bônus</option>
                        {BONUS_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </FieldWrapper>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField label="Data da Contestação" name="data_contestacao" type="date" icon={<Calendar size={18}/>} required />
                      <FieldWrapper label="Turno Atuado" icon={<Hash size={18}/>}>
                        <select name="turno" required className="custom-select">
                          <option value="">Selecione</option>
                          <option value="Manhã">Manhã</option>
                          <option value="Tarde">Tarde</option>
                          <option value="Noite">Noite</option>
                          <option value="Integral">Integral</option>
                        </select>
                      </FieldWrapper>
                    </div>

                    <FieldWrapper label="Loja Atuada" icon={<Search size={18}/>}>
                      <div className="relative">
                        <input 
                          list="stores-list" 
                          placeholder={isLoadingStores ? "Carregando lojas..." : "Digite para pesquisar a loja..."}
                          className="custom-input pl-4"
                          onChange={(e) => setStoreSearch(e.target.value)}
                          name="loja"
                          required
                          disabled={isLoadingStores}
                        />
                        <datalist id="stores-list">
                          {filteredStores.map((s, i) => <option key={i} value={s} />)}
                        </datalist>
                        {isLoadingStores && (
                          <div className="absolute right-4 top-4">
                            <Loader2 className="animate-spin text-blue-500" size={18} />
                          </div>
                        )}
                      </div>
                    </FieldWrapper>
                  </div>
                </section>

                {bonusSelected && (
                  <section className="space-y-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
                    <SectionTitle number="03" title="Detalhes Financeiros" />
                    
                    {bonusSelected === "Indicação de Novo Zubalero" ? (
                      <InputField label="Código de indicação utilizado" name="codigo_indicacao" icon={<Hash size={18}/>} required />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {bonusSelected === "SKU / Item" && (
                          <div className="md:col-span-2">
                            <InputField label="Código do Item / SKU" name="sku_codigo" icon={<Hash size={18}/>} required />
                          </div>
                        )}
                        <InputField label="Valor Recebido (R$)" name="valor_recebido" type="number" step="0.01" icon={<Hash size={18}/>} placeholder="0,00" required />
                        <InputField label="Valor Anunciado (R$)" name="valor_anunciado" type="number" step="0.01" icon={<Hash size={18}/>} placeholder="0,00" required />
                      </div>
                    )}

                    <FieldWrapper label="Explique seu caso" icon={<FileText size={18}/>}>
                      <textarea name="detalhamento" required rows={4} className="custom-input resize-none" placeholder="Conte-nos o que aconteceu em detalhes..."></textarea>
                    </FieldWrapper>

                    {/* SEÇÃO DE ARQUIVOS MÚLTIPLOS E OPCIONAIS */}
                    <FieldWrapper label={`Evidências (Opcional - Máx 5)`} icon={<Info size={18}/>}>
                      <div className="space-y-4">
                        {/* Grid de Preview de Arquivos Selecionados */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl animate-in fade-in zoom-in duration-200">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <Paperclip size={16} className="text-blue-500 flex-shrink-0" />
                                <span className="text-xs font-bold text-blue-700 truncate">{file.name}</span>
                              </div>
                              <button 
                                type="button" 
                                onClick={() => removeFile(index)}
                                className="p-1 hover:bg-blue-200 rounded-full text-blue-600 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}

                          {/* Botão para Adicionar mais arquivos (mostra apenas se < 5) */}
                          {selectedFiles.length < 5 && (
                            <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-slate-50 transition-all group">
                              <input 
                                type="file" 
                                multiple 
                                accept="image/*" 
                                onChange={handleFileChange} 
                                className="hidden" 
                                ref={fileInputRef}
                              />
                              <Plus size={16} className="text-slate-400 group-hover:text-blue-500" />
                              <span className="text-xs font-bold text-slate-500 uppercase">Adicionar Print</span>
                            </label>
                          )}
                        </div>
                        
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest ml-1">
                          PNG ou JPG até 5MB cada.
                        </p>
                      </div>
                    </FieldWrapper>
                  </section>
                )}
              </div>

              {state?.error && (
                <div className="mx-8 mb-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
                  <AlertCircle size={20} /> {state.error}
                </div>
              )}

              <div className="p-8 bg-slate-50 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isPending || !bonusSelected}
                  className="w-full bg-blue-600 text-white font-black py-5 rounded-[1.5rem] hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-40 flex justify-center items-center gap-3 text-xl shadow-xl shadow-blue-200"
                >
                  {isPending ? <Loader2 className="animate-spin" /> : "ENVIAR CONTESTAÇÃO"}
                </button>
              </div>
            </div>
          </form>
        )}
      </main>

      <style jsx global>{`
        .custom-input, .custom-select {
          width: 100%;
          border: 2px solid #f1f5f9;
          padding: 1rem 1.25rem;
          border-radius: 1.25rem;
          background: #f8fafc;
          font-weight: 600;
          color: #0f172a;
          transition: all 0.2s ease;
        }
        .custom-input:focus, .custom-select:focus {
          outline: none;
          border-color: #2563eb;
          background: white;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }
        .custom-input::placeholder { color: #cbd5e1; }
      `}</style>
    </div>
  );
}

// COMPONENTES AUXILIARES
function SectionTitle({ number, title }: { number: string, title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="bg-slate-900 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-lg">{number}</span>
      <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">{title}</h2>
    </div>
  );
}

function FieldWrapper({ label, icon, children }: { label: string, icon: any, children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}

function InputField({ label, icon, ...props }: any) {
  return (
    <FieldWrapper label={label} icon={icon}>
      <input className="custom-input" {...props} />
    </FieldWrapper>
  );
}

function SuccessView() {
  return (
    <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 text-center animate-in zoom-in duration-500">
      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
        <CheckCircle2 size={48} />
      </div>
      <h2 className="text-3xl font-black text-slate-900 mb-4">Recebemos seu reporte!</h2>
      <p className="text-slate-500 font-medium mb-10">Nossa equipe de operações irá analisar <br/> as informações e retornará via E-mail.</p>
      <button onClick={() => window.location.reload()} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all">
        REALIZAR OUTRO REPORTE
      </button>
    </div>
  );
}