"use client";

import { useState, useActionState, useMemo, useEffect, useRef } from "react";
import { submitContestation, type FormState } from "./actions";
import { 
  CheckCircle2, Loader2, Search, Building2, 
  Calendar, Phone, Mail, Hash, User, FileText, 
  AlertCircle, Info, Paperclip, X, Plus, ShieldCheck, ChevronDown, Clock, CopyX
} from "lucide-react";

// Lista de Feriados São Paulo 2025/2026
const SP_HOLIDAYS = [
  "2025-01-01", "2025-01-25", "2025-03-03", "2025-03-04", "2025-04-18", "2025-04-21", 
  "2025-05-01", "2025-06-19", "2025-07-09", "2025-09-07", "2025-10-12", "2025-11-02", 
  "2025-11-15", "2025-11-20", "2025-12-25",
  "2026-01-01", "2026-01-25", "2026-02-16", "2026-02-17", "2026-04-03", "2026-04-21", 
  "2026-05-01", "2026-06-04", "2026-07-09", "2026-09-07", "2026-10-12", "2026-11-02", 
  "2026-11-15", "2026-11-20", "2026-12-25"
];

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
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [storeSearch, setStoreSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [storesDatabase, setStoresDatabase] = useState<string[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Refs para Scroll de erro
  const fieldRefs: Record<string, any> = {
    protocolo: useRef<HTMLDivElement>(null),
    telefone: useRef<HTMLDivElement>(null),
    data_contestacao: useRef<HTMLDivElement>(null),
    loja: useRef<HTMLDivElement>(null),
    codigo_indicacao: useRef<HTMLDivElement>(null),
    sku_codigo: useRef<HTMLDivElement>(null),
  };

  const [state, formAction, isPending] = useActionState<FormState, FormData>(submitContestation, null);

  useEffect(() => {
    const savedNome = localStorage.getItem("zubale_nome");
    const savedEmail = localStorage.getItem("zubale_email");
    const savedPhone = localStorage.getItem("zubale_phone");
    if (savedNome) setNome(savedNome);
    if (savedEmail) setEmail(savedEmail);
    if (savedPhone) setPhone(savedPhone);

    async function loadStores() {
      try {
        const response = await fetch("/api/stores");
        const data = await response.json();
        setStoresDatabase(Array.isArray(data) ? data : []);
      } catch (err) { console.error("Erro ao carregar lojas"); } 
      finally { setIsLoadingStores(false); }
    }
    loadStores();

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const calculateLimitDate = () => {
    let date = new Date();
    let businessDaysFound = 0;
    while (businessDaysFound < 3) {
      date.setDate(date.getDate() - 1);
      const dayOfWeek = date.getDay();
      const dateString = date.toISOString().split('T')[0];
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !SP_HOLIDAYS.includes(dateString)) businessDaysFound++;
    }
    return date;
  };

  const handleSubmit = (formData: FormData) => {
    const errors: Record<string, string> = {};
    const protocolo = formData.get("protocolo")?.toString() || "";
    const telefoneLimpo = phone.replace(/\D/g, "");
    const dataTarefaStr = formData.get("data_contestacao")?.toString();

    if (protocolo.length < 12) errors.protocolo = "O protocolo deve ter pelo menos 12 dígitos.";
    if (telefoneLimpo.length !== 13) errors.telefone = "Informe o telefone completo com DDD (11 dígitos).";
    
    if (dataTarefaStr) {
      const taskDate = new Date(dataTarefaStr + "T00:00:00");
      const limitDate = calculateLimitDate();
      limitDate.setHours(0, 0, 0, 0);
      if (taskDate > limitDate) errors.data_contestacao = "A contestação só pode ser aberta após 3 dias úteis da realização da tarefa.";
    }

    if (!storesDatabase.includes(storeSearch)) errors.loja = "Selecione uma loja válida da lista oficial.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstErrorField = Object.keys(errors)[0];
      fieldRefs[firstErrorField]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    localStorage.setItem("zubale_nome", nome);
    localStorage.setItem("zubale_email", email);
    localStorage.setItem("zubale_phone", phone);

    setFieldErrors({});
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
            <ShieldCheck size={14} /> <span className="hidden xs:inline">SISTEMA PROTEGIDO</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 md:px-6 pt-10 md:pt-16">
        <div className="text-center mb-10 md:mb-12 animate-in fade-in duration-700">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 md:mb-6 tracking-tight leading-tight italic">
            Contestação de <span className="text-blue-600">Pagamentos</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Portal oficial para Zubaleros reportarem divergências de forma rápida e segura.
          </p>
        </div>

        {state?.success ? (
          <SuccessView />
        ) : (
          <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-blue-600 rounded-3xl p-7 md:p-8 text-white shadow-xl shadow-blue-200 border border-blue-500 relative overflow-hidden group">
              <div className="absolute -right-8 -top-8 text-blue-500 opacity-20 transform rotate-12 transition-transform group-hover:scale-110">
                <Info size={160} />
              </div>
              <h3 className="text-xl md:text-xl font-black mb-5 flex items-center gap-2 italic uppercase tracking-tight">
                <Info size={24} /> Diretrizes Importantes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="flex gap-4">
                  <div className="bg-blue-400/30 p-2 rounded-xl h-fit"><Clock size={22} /></div>
                  <p className="text-base font-semibold leading-snug">O prazo mínimo para contestação é de <span className="underline decoration-blue-300 underline-offset-4 font-black">3 dias úteis</span> após a tarefa.</p>
                </div>
                <div className="flex gap-4">
                  <div className="bg-blue-400/30 p-2 rounded-xl h-fit"><CopyX size={22} /></div>
                  <p className="text-base font-semibold leading-snug">Protocolos duplicados ou reutilizados serão <span className="text-blue-100 font-black">negados automaticamente</span>.</p>
                </div>
              </div>
            </div>

            <form action={handleSubmit} className="space-y-6 md:space-y-8">
              <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden p-7 md:p-14 space-y-9 md:space-y-12">
                
                {/* SEÇÃO 01 - IDENTIFICAÇÃO */}
                <section className="space-y-7 md:space-y-8">
                  <SectionHeader number="01" title="SUA IDENTIFICAÇÃO" subtitle="Dados básicos para localizarmos seu perfil" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div ref={fieldRefs.protocolo}>
                      <InputField label="NÚMERO DO PROTOCOLO" name="protocolo" placeholder="Mínimo 12 dígitos" type="text" inputMode="numeric" autoComplete="off" error={fieldErrors.protocolo} required />
                      <p className="text-[11px] font-bold text-slate-400 italic px-2 mt-2 uppercase">* Proibido duplicar protocolos anteriores</p>
                    </div>
                    <InputField label="NOME COMPLETO" name="nome" value={nome} onChange={(e:any) => setNome(e.target.value)} placeholder="Conforme documento" required />
                    <div ref={fieldRefs.telefone}>
                      <InputField label="TELEFONE (DDD + NÚMERO)" name="telefone" value={phone} onChange={(e:any) => setPhone(e.target.value.replace(/\D/g, "").substring(0, 13))} error={fieldErrors.telefone} required />
                      <p className="text-[11px] font-bold text-slate-500 italic px-2 mt-2 leading-tight">* Identificação impossível se o telefone estiver incorreto.</p>
                    </div>
                    <InputField label="E-MAIL DE CADASTRO" name="email" type="email" value={email} onChange={(e:any) => setEmail(e.target.value)} placeholder="exemplo@zubale.com" required />
                  </div>
                </section>

                {/* SEÇÃO 02 - DADOS DA ATUAÇÃO */}
                <section className="space-y-7 md:space-y-8 pt-9 border-t border-slate-50">
                  <SectionHeader number="02" title="DADOS DA ATUAÇÃO" subtitle="Sobre o turno em que ocorreu a divergência" />
                  <div className="space-y-7 md:space-y-8">
                    <FieldWrapper label="O QUE DESEJA CONTESTAR?" icon={<AlertCircle size={20}/>}>
                      <select name="tipoSolicitacao" required className="custom-select" onChange={(e) => setBonusSelected(e.target.value)}>
                        <option value="">Selecione o tipo de bônus...</option>
                        {BONUS_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </FieldWrapper>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div ref={fieldRefs.data_contestacao}>
                        <InputField label="DATA DA REALIZAÇÃO" name="data_contestacao" type="date" error={fieldErrors.data_contestacao} required />
                        <p className="text-[11px] font-bold text-slate-400 italic px-2 mt-2 uppercase">* Respeite o prazo de 3 dias úteis (SP)</p>
                      </div>
                      <FieldWrapper label="TURNO ATUADO" icon={<Hash size={20}/>}>
                        <select name="turno" required className="custom-select">
                          <option value="">Selecione o turno...</option>
                          <option value="Manhã">Manhã</option><option value="Tarde">Tarde</option><option value="Noite">Noite</option><option value="Integral">Integral</option>
                        </select>
                      </FieldWrapper>
                    </div>

                    <div ref={fieldRefs.loja}>
                      <FieldWrapper label="LOJA ATUADA (PESQUISE NA LISTA)" icon={<Search size={20}/>} error={fieldErrors.loja}>
                        <div className="relative" ref={dropdownRef}>
                          <div className={`relative flex items-center bg-[#f8fafc] border-2 rounded-xl transition-all ${isDropdownOpen ? 'border-blue-500 bg-white ring-4 ring-blue-50' : 'border-[#f1f5f9]'}`} onClick={() => !isLoadingStores && setIsDropdownOpen(true)}>
                            <input type="text" placeholder="DIGITE O NOME EXATO DA LOJA..." className="w-full p-5 bg-transparent font-bold text-slate-900 outline-none uppercase text-base md:text-lg" value={storeSearch} onChange={(e) => { setStoreSearch(e.target.value); setIsDropdownOpen(true); }} autoComplete="off" />
                            <ChevronDown className={`mr-4 transition-transform text-slate-400 ${isDropdownOpen ? 'rotate-180' : ''}`} size={22} />
                          </div>
                          {isDropdownOpen && (
                            <div className="absolute z-[60] w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
                              <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                                {storesDatabase.filter(s => s.toLowerCase().includes(storeSearch.toLowerCase())).map((loja, i) => (
                                  <div key={i} className="px-6 py-4 hover:bg-blue-50 cursor-pointer text-sm font-bold text-slate-700 border-b border-slate-50 last:border-none uppercase transition-colors flex items-center gap-3" onClick={() => { setStoreSearch(loja); setIsDropdownOpen(false); setFieldErrors(prev => ({...prev, loja: ""})); }}>
                                    <Building2 size={18} className="text-slate-300" /> {loja}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </FieldWrapper>
                    </div>
                  </div>
                </section>

                {/* SEÇÃO 03 - REINTEGRAÇÃO DOS DADOS FINANCEIROS DINÂMICOS */}
                {bonusSelected && (
                  <section className="space-y-7 md:space-y-8 pt-9 border-t border-slate-50 animate-in fade-in slide-in-from-top-4 duration-500">
                    <SectionHeader number="03" title="DETALHES DO REPORTE" subtitle="Forneça valores e evidências do caso" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      {bonusSelected === "Indicação de Novo Zubalero" ? (
                        <div className="md:col-span-2" ref={fieldRefs.codigo_indicacao}>
                          <InputField label="CÓDIGO DE INDICAÇÃO UTILIZADO" name="codigo_indicacao" icon={<Hash size={18}/>} placeholder="Digite o código utilizado" required />
                        </div>
                      ) : (
                        <>
                          {bonusSelected === "SKU / Item" && (
                            <div className="md:col-span-2" ref={fieldRefs.sku_codigo}>
                              <InputField label="CÓDIGO DO ITEM / SKU" name="sku_codigo" icon={<Hash size={18}/>} placeholder="Digite o código SKU" required />
                            </div>
                          )}
                          <InputField label="VALOR RECEBIDO (R$)" name="valor_recebido" type="number" step="1" placeholder="0" required />
                          <InputField label="VALOR ANUNCIADO (R$)" name="valor_anunciado" type="number" step="1" placeholder="0" required />
                        </>
                      )}
                    </div>

                    <FieldWrapper label="EXPLIQUE SEU CASO" icon={<FileText size={20}/>}>
                      <textarea name="detalhamento" required rows={4} className="custom-input resize-none py-5" placeholder="Descreva o ocorrido..." />
                    </FieldWrapper>

                    <FieldWrapper label="EVIDÊNCIAS (MÁX 5)" icon={<Paperclip size={20}/>}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-2xl animate-in zoom-in">
                            <span className="text-sm font-bold text-blue-700 truncate max-w-[200px]">{file.name}</span>
                            <button type="button" onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))} className="text-blue-600 hover:bg-blue-100 p-1.5 rounded-full"><X size={18} /></button>
                          </div>
                        ))}
                        {selectedFiles.length < 5 && (
                          <label className="flex items-center justify-center gap-3 p-5 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                            <input type="file" multiple accept="image/*" onChange={(e) => e.target.files && setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)].slice(0, 5))} className="hidden" />
                            <Plus size={22} className="text-slate-400" /> <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Anexar Print</span>
                          </label>
                        )}
                      </div>
                    </FieldWrapper>
                  </section>
                )}
              </div>

              <div className="p-7 md:p-12 bg-slate-50/50 border-t border-slate-100 rounded-[2.5rem]">
                <button type="submit" disabled={isPending || !bonusSelected} className="w-full bg-blue-600 text-white font-black py-5 md:py-7 rounded-[1.5rem] md:rounded-[2rem] hover:bg-blue-700 active:scale-[0.98] transition-all flex justify-center items-center gap-4 text-xl md:text-2xl shadow-xl shadow-blue-100 uppercase tracking-tight">
                  {isPending ? <Loader2 className="animate-spin" size={28} /> : "Enviar Contestação"}
                </button>
              </div>
            </form>
          </div>
        )}

        <footer className="mt-12 text-center text-slate-400 text-xs md:text-sm font-medium italic">
          © {new Date().getFullYear()} Zubale Brasil · Todos os direitos reservados
        </footer>
      </main>

      <style jsx global>{`
        .custom-input, .custom-select { 
          width: 100%; border: 2px solid #f1f5f9; padding: 1.1rem 1.4rem; border-radius: 1.25rem; 
          background: #f8fafc; font-weight: 700; color: #0f172a; transition: all 0.25s ease; 
          font-size: 1.25rem; min-height: 4.2rem; appearance: none; 
        }
        @media (max-width: 768px) {
          .custom-input, .custom-select { padding: 1.2rem; font-size: 1.15rem; min-height: 4rem; }
        }
        .custom-input:focus, .custom-select:focus { outline: none; border-color: #2563eb; background: white; box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.08); transform: translateY(-1px); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}

function SectionHeader({ number, title, subtitle }: any) {
  return (
    <div className="flex items-start gap-4">
      <span className="bg-slate-900 text-white text-[12px] font-black w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-xl shadow-md flex-shrink-0 mt-1">{number}</span>
      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight italic leading-none">{title}</h2>
        <p className="text-xs md:text-base font-medium text-slate-400 mt-1.5">{subtitle}</p>
      </div>
    </div>
  );
}

function FieldWrapper({ label, icon, error, children }: any) {
  return (
    <div className="space-y-3 relative">
      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-sm mb-2 animate-in slide-in-from-top-2">
          <AlertCircle size={18} /> {error}
        </div>
      )}
      <label className="flex items-center gap-2 text-[11px] md:text-[12px] font-black text-slate-400 uppercase tracking-widest ml-1">{icon} {label}</label>
      {children}
    </div>
  );
}

function InputField({ label, icon, error, ...props }: any) {
  return <FieldWrapper label={label} icon={icon} error={error}><input className="custom-input" {...props} /></FieldWrapper>;
}

function SuccessView() {
  return (
    <div className="bg-white p-12 md:p-24 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl border border-white text-center animate-in zoom-in duration-500">
      <CheckCircle2 size={70} className="mx-auto text-emerald-500 mb-10" />
      <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 italic">Solicitação Recebida!</h2>
      <div className="text-slate-600 font-medium text-lg md:text-xl mb-12 max-w-xl mx-auto leading-relaxed space-y-6">
        <p>Reporte registrado com sucesso. Analisaremos e retornaremos via e-mail em até <strong>5 dias úteis</strong>.</p>
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-sm md:text-base text-left space-y-3 shadow-sm">
          <p className="font-black text-slate-800 uppercase tracking-tight">Regras de Revisão:</p>
          <ul className="list-disc list-inside space-y-2 text-slate-500">
            <li>Pedidos feitos antes de 3 dias úteis da tarefa serão negados.</li>
            <li>Protocolos duplicados anulam automaticamente a contestação.</li>
            <li>A identificação depende de um telefone de cadastro válido.</li>
          </ul>
        </div>
      </div>
      <button onClick={() => window.location.reload()} className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-sm md:text-lg tracking-widest hover:bg-slate-800 transition-all shadow-xl">Novo Reporte</button>
    </div>
  );
}