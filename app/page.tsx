"use client";

import { useState, useActionState, useMemo, useEffect, useRef } from "react";
import { submitContestation, type FormState } from "./actions";
import { 
  CheckCircle2, Loader2, Search, Building2, 
  Calendar, Phone, Mail, Hash, User, FileText, 
  AlertCircle, Info, Paperclip, X, Plus, ShieldCheck, ChevronDown, Clock, CopyX
} from "lucide-react";

// Lista de bônus corrigida e em ordem alfabética
const BONUS_TYPES = [
  "Bônus Adicional 2 Turnos",
  "Bônus Data Comemorativa",
  "Bônus de Domingo",
  "Bônus de Fim de Ano",
  "Bônus de Treinamento",
  "Bônus Especial",
  "Bônus Ofertado por WhatsApp ou Push App",
  "Conectividade",
  "Hora Certa",
  "Indicação de Novo Zubalero",
  "Meta de Produtividade",
  "SKU / Item"
];

export default function ZubalePortal() {
  const [bonusSelected, setBonusSelected] = useState("");
  const [phone, setPhone] = useState("+55");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [storesDatabase, setStoresDatabase] = useState<string[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [storeSearch, setStoreSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

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
      } catch (err) { console.error("Erro ao carregar lojas"); } 
      finally { setIsLoadingStores(false); }
    }
    loadStores();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredStores = useMemo(() => {
    if (!storeSearch) return storesDatabase;
    const searchLower = storeSearch.toLowerCase();
    return storesDatabase.filter(s => s.toLowerCase().includes(searchLower));
  }, [storeSearch, storesDatabase]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (!val.startsWith("55")) val = "55" + val;
    setPhone("+" + val.substring(0, 13)); 
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles].slice(0, 5));
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (formData: FormData) => {
    setLocalError(null);

    const protocolo = formData.get("protocolo")?.toString() || "";
    const telefoneLimpo = phone.replace(/\D/g, "");

    if (protocolo.length < 12) {
      setLocalError("O número do protocolo deve ter pelo menos 12 dígitos.");
      return;
    }

    if (telefoneLimpo.length !== 13) {
      setLocalError("O telefone deve conter o DDD e o número completo (11 dígitos).");
      return;
    }

    if (!storesDatabase.includes(storeSearch)) {
      setLocalError("Por favor, selecione uma loja válida da lista oficial.");
      return;
    }

    formData.set("loja", storeSearch);
    formData.delete("evidencias_files");
    selectedFiles.forEach(file => formData.append("evidencias_files", file));
    formAction(formData);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <img src="/logo_zubale.png" alt="Zubale Logo" className="h-7 md:h-9 w-auto object-contain" />
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-[11px] font-black border border-emerald-100 shadow-sm">
            <ShieldCheck size={14} /> 
            <span className="hidden xs:inline">SISTEMA PROTEGIDO</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 md:px-6 pt-10 md:pt-16">
        <div className="text-center mb-10 md:mb-12 animate-in fade-in duration-700">
          <h1 className="text-3xl md:text-6xl font-black text-slate-900 mb-4 md:mb-6 tracking-tight leading-tight italic">
            Contestação de <span className="text-blue-600">Pagamentos</span>
          </h1>
          <p className="text-slate-500 font-medium text-base md:text-xl max-w-2xl mx-auto leading-relaxed">
            Portal oficial para Zubaleros reportarem divergências em bônus, metas ou itens não pagos de forma rápida e segura.
          </p>
        </div>

        {state?.success ? (
          <SuccessView />
        ) : (
          <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* CARD DE REGRAS E DIRETRIZES */}
            <div className="bg-blue-600 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-blue-200 border border-blue-500 relative overflow-hidden group">
              <div className="absolute -right-8 -top-8 text-blue-500 opacity-20 transform rotate-12 transition-transform group-hover:scale-110">
                <Info size={160} />
              </div>
              <h3 className="text-lg md:text-xl font-black mb-4 flex items-center gap-2 italic uppercase tracking-tight">
                <Info size={24} /> Diretrizes Importantes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="flex gap-3">
                  <div className="bg-blue-400/30 p-2 rounded-xl h-fit"><Clock size={20} /></div>
                  <p className="text-sm md:text-base font-semibold leading-snug">
                    O prazo mínimo para contestação é de <span className="underline decoration-blue-300 underline-offset-4">3 dias úteis</span> após a realização da tarefa, tempo necessário para o processamento bancário dos bônus.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="bg-blue-400/30 p-2 rounded-xl h-fit"><CopyX size={20} /></div>
                  <p className="text-sm md:text-base font-semibold leading-snug">
                    Protocolos de contestações anteriores não podem ser reutilizados. Solicitações duplicadas serão <span className="text-blue-100 font-black">negadas automaticamente</span> pelo sistema.
                  </p>
                </div>
              </div>
            </div>

            <form action={handleSubmit} className="space-y-6 md:space-y-8">
              <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden">
                <div className="p-6 md:p-14 space-y-8 md:space-y-12">
                  
                  <section className="space-y-6 md:space-y-8">
                    <SectionHeader number="01" title="SUA IDENTIFICAÇÃO" subtitle="Dados básicos para localizarmos seu perfil" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                      <div className="space-y-1">
                        <InputField 
                            label="NÚMERO DO PROTOCOLO" 
                            name="protocolo" 
                            placeholder="Mínimo 12 dígitos" 
                            type="text"
                            inputMode="numeric"
                            required 
                        />
                        <p className="text-[10px] font-bold text-slate-400 italic px-2 uppercase tracking-tighter">* Proibido duplicar protocolos anteriores</p>
                      </div>
                      <InputField label="NOME COMPLETO" name="nome" placeholder="Conforme documento" required />
                      <div className="space-y-1">
                        <InputField label="TELEFONE DE CADASTRO (COM DDD)" name="telefone" value={phone} onChange={handlePhoneChange} placeholder="+55 (DDD) 99999-9999" required />
                        <p className="text-[10px] font-bold text-slate-400 italic px-2 uppercase tracking-tighter">
                          * Telefone incorreto impede a identificação no sistema e o seguimento da contestação
                        </p>
                      </div>
                      <InputField label="E-MAIL DE CADASTRO" name="email" type="email" placeholder="exemplo@zubale.com" required />
                    </div>
                  </section>

                  <section className="space-y-6 md:space-y-8 pt-8 border-t border-slate-50">
                    <SectionHeader number="02" title="DADOS DA ATUAÇÃO" subtitle="Sobre o turno em que ocorreu a divergência" />
                    <div className="space-y-6 md:space-y-8">
                      <FieldWrapper label="O QUE DESEJA CONTESTAR?" icon={<AlertCircle size={18}/>}>
                        <select name="tipoSolicitacao" required className="custom-select" onChange={(e) => setBonusSelected(e.target.value)}>
                          <option value="">Selecione o tipo de bônus...</option>
                          {BONUS_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </FieldWrapper>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                        <div className="space-y-1">
                          <InputField label="DATA DA REALIZAÇÃO" name="data_contestacao" type="date" required />
                          <p className="text-[10px] font-bold text-slate-400 italic px-2 uppercase tracking-tighter">* Respeite o prazo de 3 dias úteis</p>
                        </div>
                        <FieldWrapper label="TURNO ATUADO" icon={<Hash size={18}/>}>
                          <select name="turno" required className="custom-select">
                            <option value="">Selecione o turno...</option>
                            <option value="Manhã">Manhã</option>
                            <option value="Tarde">Tarde</option>
                            <option value="Noite">Noite</option>
                            <option value="Integral">Integral</option>
                          </select>
                        </FieldWrapper>
                      </div>

                      <FieldWrapper label="LOJA ATUADA (PESQUISE NA LISTA)" icon={<Search size={18}/>}>
                        <div className="relative" ref={dropdownRef}>
                          <div 
                            className={`relative flex items-center bg-[#f8fafc] border-2 rounded-xl transition-all ${isDropdownOpen ? 'border-blue-500 bg-white ring-4 ring-blue-50' : 'border-[#f1f5f9]'}`}
                            onClick={() => !isLoadingStores && setIsDropdownOpen(true)}
                          >
                            <input 
                              type="text"
                              placeholder={isLoadingStores ? "Carregando..." : "BUSCAR LOJA..."}
                              className="w-full p-4 bg-transparent font-bold text-slate-900 outline-none uppercase placeholder:text-slate-300 placeholder:font-medium text-sm md:text-base"
                              value={storeSearch}
                              onChange={(e) => {
                                setStoreSearch(e.target.value);
                                setIsDropdownOpen(true);
                              }}
                              autoComplete="off"
                              disabled={isLoadingStores}
                            />
                            <ChevronDown className={`mr-4 transition-transform text-slate-400 ${isDropdownOpen ? 'rotate-180' : ''}`} size={20} />
                          </div>

                          {isDropdownOpen && (
                            <div className="absolute z-[60] w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                              <div className="max-h-[250px] md:max-h-[300px] overflow-y-auto custom-scrollbar">
                                {filteredStores.length > 0 ? (
                                  filteredStores.map((loja, i) => (
                                    <div 
                                      key={i}
                                      className="px-5 py-3.5 hover:bg-blue-50 cursor-pointer text-xs md:text-sm font-bold text-slate-700 border-b border-slate-50 last:border-none transition-colors flex items-center gap-3 uppercase"
                                      onClick={() => {
                                        setStoreSearch(loja);
                                        setIsDropdownOpen(false);
                                        setLocalError(null);
                                      }}
                                    >
                                      <Building2 size={16} className="text-slate-300" />
                                      {loja}
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-8 text-center">
                                    <p className="text-sm font-bold text-slate-400">Nenhuma loja encontrada.</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </FieldWrapper>
                    </div>
                  </section>

                  {bonusSelected && (
                    <section className="space-y-6 md:space-y-8 pt-8 border-t border-slate-50">
                      <SectionHeader number="03" title="DETALHES FINANCEIROS" subtitle="Forneça valores e evidências do caso" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                        <InputField label="VALOR RECEBIDO (R$)" name="valor_recebido" type="number" step="1" placeholder="0" required />
                        <InputField label="VALOR ANUNCIADO (R$)" name="valor_anunciado" type="number" step="1" placeholder="0" required />
                      </div>
                      <FieldWrapper label="EXPLIQUE SEU CASO" icon={<FileText size={18}/>}>
                        <textarea name="detalhamento" required rows={4} className="custom-input resize-none py-4" placeholder="Descreva o ocorrido..." />
                      </FieldWrapper>

                      <FieldWrapper label={`EVIDÊNCIAS (OPCIONAL - MÁX 5)`} icon={<Paperclip size={18}/>}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 md:p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                              <span className="text-[10px] md:text-xs font-bold text-blue-700 truncate max-w-[150px]">{file.name}</span>
                              <button type="button" onClick={() => removeFile(index)} className="text-blue-600 hover:bg-blue-100 p-1 rounded-full"><X size={14} /></button>
                            </div>
                          ))}
                          {selectedFiles.length < 5 && (
                            <label className="flex items-center justify-center gap-3 p-3 md:p-4 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                              <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
                              <Plus size={18} className="text-slate-400" />
                              <span className="text-[10px] md:text-xs font-black text-slate-500 uppercase">Anexar Print</span>
                            </label>
                          )}
                        </div>
                      </FieldWrapper>
                    </section>
                  )}
                </div>

                {(state?.error || localError) && (
                  <div className="mx-6 md:mx-8 mb-6 md:mb-8 p-4 md:p-5 bg-red-50 border border-red-100 rounded-2xl md:rounded-3xl flex items-center gap-3 md:gap-4 text-red-700 text-xs md:text-sm font-bold">
                    <AlertCircle size={20} className="flex-shrink-0" />
                    {localError || state?.error}
                  </div>
                )}

                <div className="p-6 md:p-10 bg-slate-50/50 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isPending || !bonusSelected}
                    className="w-full bg-blue-600 text-white font-black py-4 md:py-6 rounded-[1.25rem] md:rounded-[2rem] hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-40 flex justify-center items-center gap-3 md:gap-4 text-lg md:text-xl shadow-lg shadow-blue-100 uppercase"
                  >
                    {isPending ? <Loader2 className="animate-spin" size={24} /> : "Enviar Contestação"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        <footer className="mt-8 md:mt-12 text-center text-slate-400 text-[10px] md:text-sm font-medium italic">
          © {new Date().getFullYear()} Zubale Brasil · Todos os direitos reservados
        </footer>
      </main>

      <style jsx global>{`
        .custom-input, .custom-select { 
          width: 100%; 
          border: 2px solid #f1f5f9; 
          padding: 1rem 1.25rem; 
          border-radius: 1.25rem; 
          background: #f8fafc; 
          font-weight: 700; 
          color: #0f172a; 
          transition: all 0.25s ease; 
          font-size: 1.1rem; 
          min-height: 3.5rem; 
          appearance: none; 
        }
        @media (max-width: 768px) {
          .custom-input, .custom-select {
            padding: 0.75rem 1rem;
            font-size: 1rem; 
          }
        }
        .custom-input:focus, .custom-select:focus { 
          outline: none; 
          border-color: #2563eb; 
          background: white; 
          box-shadow: 0 0 0 5px rgba(37, 99, 235, 0.08); 
          transform: translateY(-1px); 
        }
        .custom-input::placeholder { color: #94a3b8; font-weight: 500; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}

function SectionHeader({ number, title, subtitle }: { number: string, title: string, subtitle: string }) {
  return (
    <div className="flex items-start gap-3 md:gap-4">
      <span className="bg-slate-900 text-white text-[10px] md:text-[11px] font-black w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-lg md:rounded-xl shadow-md flex-shrink-0 mt-1">{number}</span>
      <div>
        <h2 className="text-base md:text-xl font-black text-slate-900 uppercase tracking-tight italic leading-none">{title}</h2>
        <p className="text-[10px] md:text-sm font-medium text-slate-400 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

function FieldWrapper({ label, icon, children }: { label: string, icon: any, children: React.ReactNode }) {
  return (
    <div className="space-y-2 md:space-y-3">
      <label className="flex items-center gap-2 text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">{icon} {label}</label>
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
    <div className="bg-white p-10 md:p-20 rounded-[2rem] md:rounded-[3.5rem] shadow-2xl border border-white text-center animate-in zoom-in duration-500">
      <div className="w-20 h-20 md:w-28 md:h-28 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 md:mb-10 shadow-inner">
        <CheckCircle2 size={40} className="md:w-14 md:h-14" />
      </div>
      <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-4 italic">Solicitação Recebida!</h2>
      <div className="text-slate-500 font-medium text-sm md:text-lg mb-8 md:mb-12 max-w-lg mx-auto leading-relaxed space-y-4">
        <p>Seu reporte foi registrado com sucesso. Analisaremos o caso e retornaremos via e-mail em até <strong>5 dias úteis</strong>.</p>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs md:text-sm text-left space-y-2">
          <p className="font-bold text-slate-800 uppercase tracking-tighter">Lembre-se:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Solicitações abertas antes de 3 dias úteis da tarefa serão negadas automaticamente.</li>
            <li>O uso de protocolos duplicados anula a revisão.</li>
            <li>A identificação do Zubalero depende de um número de telefone válido.</li>
          </ul>
        </div>
      </div>
      <button onClick={() => window.location.reload()} className="px-10 md:px-12 py-4 md:py-5 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black uppercase text-xs md:text-sm tracking-widest">Novo Reporte</button>
    </div>
  );
}