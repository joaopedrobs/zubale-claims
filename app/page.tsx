"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import { submitContestation, type FormState } from "./actions";
import { 
  CheckCircle2, Loader2, Search, Building2, 
  AlertCircle, Info, Paperclip, X, Plus, ShieldCheck, ChevronDown, Clock, Copy, BookOpen, Hash, FileText
} from "lucide-react";

// --- DADOS ESTÁTICOS ---
const SP_HOLIDAYS = [
  "2025-01-01", "2025-01-25", "2025-03-03", "2025-03-04", "2025-04-18", "2025-04-21", 
  "2025-05-01", "2025-06-19", "2025-07-09", "2025-09-07", "2025-10-12", "2025-11-02", 
  "2025-11-15", "2025-11-20", "2025-12-25",
  "2026-01-01", "2026-01-25", "2026-02-16", "2026-02-17", "2026-04-03", "2026-04-21", 
  "2026-05-01", "2026-06-04", "2026-07-09", "2026-09-07", "2026-10-12", "2026-11-02", 
  "2026-11-15", "2026-11-20", "2026-12-25"
];

const BONUS_TYPES = ["Bônus Adicional 2 Turnos", "Bônus Data Comemorativa", "Bônus de Domingo", "Bônus de Fim de Ano", "Bônus de Treinamento", "Bônus Especial", "Bônus Ofertado por WhatsApp ou Push App", "Conectividade", "Hora Certa", "Indicação de Novo Zubalero", "Meta de Produtividade", "SKU / Item"];

export default function ZubalePortal() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+55");
  
  const [bonusSelected, setBonusSelected] = useState("");
  const [dataContestacao, setDataContestacao] = useState("");
  const [turno, setTurno] = useState("");
  const [storeSearch, setStoreSearch] = useState("");
  const [valorRecebido, setValorRecebido] = useState("");
  const [valorAnunciado, setValorAnunciado] = useState("");
  const [detalhamento, setDetalhamento] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [storesDatabase, setStoresDatabase] = useState<string[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Refs para Scroll
  const fieldRefs: Record<string, any> = {
    nome: useRef<HTMLDivElement>(null),
    telefone: useRef<HTMLDivElement>(null),
    email: useRef<HTMLDivElement>(null),
    tipoSolicitacao: useRef<HTMLDivElement>(null),
    data_contestacao: useRef<HTMLDivElement>(null),
    loja: useRef<HTMLDivElement>(null),
    codigo_indicacao: useRef<HTMLDivElement>(null),
    sku_codigo: useRef<HTMLDivElement>(null),
  };

  const [state, formAction, isPending] = useActionState<FormState, FormData>(submitContestation, null);

  useEffect(() => {
    // Carregar Identidade
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

  useEffect(() => {
    if (state?.success) {
      setBonusSelected("");
      setDataContestacao("");
      setTurno("");
      setStoreSearch("");
      setValorRecebido("");
      setValorAnunciado("");
      setDetalhamento("");
      setSelectedFiles([]);
    }
  }, [state]);

  const calculateLimitDate = () => {
    let date = new Date();
    let count = 0;
    while (count < 3) {
      date.setDate(date.getDate() - 1);
      const day = date.getDay();
      const str = date.toISOString().split('T')[0];
      if (day !== 0 && day !== 6 && !SP_HOLIDAYS.includes(str)) count++;
    }
    return date;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (!val.startsWith("55")) val = "55" + val;
    const finalPhone = "+" + val.substring(0, 13);
    setPhone(finalPhone);
    localStorage.setItem("zubale_phone", finalPhone);
  };

  const handleIdentityChange = (field: 'nome' | 'email', value: string) => {
    if (field === 'nome') {
      setNome(value);
      localStorage.setItem("zubale_nome", value);
    } else {
      setEmail(value);
      localStorage.setItem("zubale_email", value);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Validação simples de tamanho no front (4.5MB Max)
      const totalSize = [...selectedFiles, ...newFiles].reduce((acc, f) => acc + f.size, 0);
      if (totalSize > 4.5 * 1024 * 1024) {
        alert("O tamanho total dos arquivos não pode exceder 4.5MB.");
        return;
      }
      setSelectedFiles(prev => [...prev, ...newFiles].slice(0, 5));
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleValidateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const errors: Record<string, string> = {};
    const telefoneLimpo = phone.replace(/\D/g, "");

    if (!nome.trim()) errors.nome = "Informe seu nome completo.";
    if (telefoneLimpo.length !== 13) errors.telefone = "Informe o telefone completo com DDD.";
    if (!email.trim()) errors.email = "E-mail de cadastro obrigatório.";
    
    if (!bonusSelected) errors.tipoSolicitacao = "Selecione o tipo de bônus.";
    if (dataContestacao) {
      const taskDate = new Date(dataContestacao + "T00:00:00");
      const limit = calculateLimitDate();
      limit.setHours(0,0,0,0);
      if (taskDate > limit) errors.data_contestacao = "A contestação só pode ser aberta após 3 dias úteis da tarefa.";
    } else {
      errors.data_contestacao = "Data obrigatória.";
    }
    if (!storesDatabase.includes(storeSearch)) errors.loja = "Selecione uma loja válida.";

    if (bonusSelected === "Indicação de Novo Zubalero") {
       const el = document.querySelector('input[name="codigo_indicacao"]') as HTMLInputElement;
       if (!el?.value.trim()) errors.codigo_indicacao = "Código de indicação obrigatório.";
    }
    if (bonusSelected === "SKU / Item") {
       const el = document.querySelector('input[name="sku_codigo"]') as HTMLInputElement;
       if (!el?.value.trim()) errors.sku_codigo = "Código SKU obrigatório.";
    }

    if (Object.keys(errors).length > 0) {
      e.preventDefault(); 
      setFieldErrors(errors);
      const first = Object.keys(errors)[0];
      fieldRefs[first]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setFieldErrors({});
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans text-slate-900">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <img src="/logo_zubale.png" alt="Zubale Logo" className="h-7 md:h-9 w-auto object-contain" />
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-[11px] font-black border border-emerald-100 shadow-sm">
            <ShieldCheck size={14} /> <span className="hidden xs:inline uppercase tracking-tighter">Ambiente Seguro</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 md:px-6 pt-10 md:pt-16">
        <div className="text-center mb-10 md:mb-12 animate-in fade-in duration-700">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight leading-tight italic">
            Portal Oficial de <span className="text-blue-600">Contestação</span>
          </h1>
          <p className="text-slate-500 font-medium text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Canal exclusivo para parceiros reportarem divergências de pagamentos com segurança e agilidade.
          </p>
        </div>

        {state?.success ? (
          <SuccessView protocolo={state.protocolo} />
        ) : (
          <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            <div className="bg-blue-600 rounded-3xl p-7 md:p-8 text-white shadow-xl shadow-blue-200 border border-blue-500 relative overflow-hidden group">
              <div className="absolute -right-8 -top-8 text-blue-500 opacity-20 transform rotate-12 transition-transform group-hover:scale-110">
                <Info size={160} />
              </div>
              <h3 className="text-xl font-black mb-5 flex items-center gap-2 italic uppercase tracking-tight">
                <Info size={24} /> Regras de Utilização
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <div className="flex gap-4">
                  <div className="bg-blue-400/30 p-2 rounded-xl h-fit"><Clock size={22} /></div>
                  <div className="flex flex-col justify-center">
                    <p className="text-sm font-bold text-blue-200 uppercase tracking-widest mb-1">Prazo de Abertura</p>
                    <p className="text-base font-semibold leading-tight">Aguarde <span className="underline font-black decoration-white">3 dias úteis</span> após a tarefa.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-blue-400/30 p-2 rounded-xl h-fit"><BookOpen size={22} /></div>
                  <div className="flex flex-col justify-center">
                    <p className="text-sm font-bold text-blue-200 uppercase tracking-widest mb-1">Dúvidas?</p>
                    <p className="text-base font-medium leading-tight mb-1">Consulte as regras oficiais.</p>
                    <a href="#" className="text-white underline font-black hover:text-blue-100 transition-colors text-sm truncate w-full block" onClick={(e) => e.preventDefault()}>[Link: Documento de Regras]</a>
                  </div>
                </div>
              </div>
            </div>

            <form 
              action={(formData) => {
                // AQUI ESTAVA O ERRO: ANTES VOCÊ TINHA formData.delete("evidencias_files")
                // AGORA NÓS ADICIONAMOS E NÃO DELETAMOS
                selectedFiles.forEach(file => formData.append("evidencias_files", file));
                formData.set("telefone", phone);
                formData.set("loja", storeSearch);
                formAction(formData);
              }} 
              className="space-y-6 md:space-y-8"
            >
              <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-white overflow-hidden p-7 md:p-14 space-y-9 md:space-y-12">
                
                <section className="space-y-7 md:space-y-8">
                  <SectionHeader number="01" title="SUA IDENTIFICAÇÃO" subtitle="Dados para localização do cadastro" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div ref={fieldRefs.nome} className="md:col-span-2">
                      <InputField label="NOME COMPLETO" name="nome" value={nome} onChange={(e:any) => handleIdentityChange('nome', e.target.value)} placeholder="Conforme documento" error={fieldErrors.nome} required />
                    </div>
                    <div ref={fieldRefs.telefone}>
                      <InputField label="TELEFONE (DDD + NÚMERO)" name="telefone" value={phone} onChange={handlePhoneChange} error={fieldErrors.telefone} inputMode="numeric" required />
                    </div>
                    <div ref={fieldRefs.email}>
                      <InputField label="E-MAIL DE CADASTRO" name="email" type="email" value={email} onChange={(e:any) => handleIdentityChange('email', e.target.value)} placeholder="exemplo@zubale.com" error={fieldErrors.email} required />
                    </div>
                  </div>
                </section>

                <section className="space-y-7 md:space-y-8 pt-9 border-t border-slate-50">
                  <SectionHeader number="02" title="DADOS DA ATUAÇÃO" subtitle="Sobre o turno em que ocorreu a divergência" />
                  <div className="space-y-7 md:space-y-8">
                    <div ref={fieldRefs.tipoSolicitacao}>
                      <FieldWrapper label="O QUE DESEJA CONTESTAR?" icon={<AlertCircle size={20}/>} error={fieldErrors.tipoSolicitacao}>
                        <select name="tipoSolicitacao" className="custom-select" value={bonusSelected} onChange={(e) => setBonusSelected(e.target.value)} required>
                          <option value="">Selecione o tipo de bônus...</option>
                          {BONUS_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </FieldWrapper>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div ref={fieldRefs.data_contestacao}>
                        {/* INPUT NATIVO - O formato visual é controlado pelo navegador (pt-BR se o sistema estiver em PT) */}
                        <InputField label="DATA DA REALIZAÇÃO" name="data_contestacao" type="date" value={dataContestacao} onChange={(e:any) => setDataContestacao(e.target.value)} error={fieldErrors.data_contestacao} required />
                        <p className="text-[11px] font-bold text-slate-400 italic px-2 mt-2 uppercase tracking-tighter">* Respeite o prazo de 3 dias úteis</p>
                      </div>
                      <FieldWrapper label="TURNO ATUADO" icon={<Hash size={20}/>}>
                        <select name="turno" className="custom-select" value={turno} onChange={(e) => setTurno(e.target.value)} required>
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

                <section className="space-y-7 md:space-y-8 pt-9 border-t border-slate-50 animate-in fade-in slide-in-from-top-4 duration-500">
                  <SectionHeader number="03" title="DETALHES DO REPORTE" subtitle="Valores e justificativas" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {bonusSelected === "Indicação de Novo Zubalero" ? (
                      <div className="md:col-span-2" ref={fieldRefs.codigo_indicacao}>
                        <InputField label="CÓDIGO DE INDICAÇÃO" name="codigo_indicacao" icon={<Hash size={18}/>} placeholder="Código utilizado" required />
                      </div>
                    ) : (
                      <>
                        {bonusSelected === "SKU / Item" && (
                          <div className="md:col-span-2" ref={fieldRefs.sku_codigo}>
                            <InputField label="CÓDIGO SKU" name="sku_codigo" icon={<Hash size={18}/>} placeholder="Digite o código SKU" required />
                          </div>
                        )}
                        <InputField label="VALOR RECEBIDO (R$)" name="valor_recebido" value={valorRecebido} onChange={(e:any) => setValorRecebido(e.target.value)} type="number" step="1" placeholder="0" required />
                        <InputField label="VALOR ANUNCIADO (R$)" name="valor_anunciado" value={valorAnunciado} onChange={(e:any) => setValorAnunciado(e.target.value)} type="number" step="1" placeholder="0" required />
                      </>
                    )}
                  </div>
                  <FieldWrapper label="EXPLIQUE SEU CASO (OPCIONAL)" icon={<FileText size={20}/>}>
                    <textarea name="detalhamento" value={detalhamento} onChange={(e) => setDetalhamento(e.target.value)} rows={4} className="custom-input resize-none py-5" placeholder="Descreva o ocorrido (opcional)..." />
                  </FieldWrapper>
                  <FieldWrapper label="EVIDÊNCIAS (OPCIONAL - MÁX 5)" icon={<Paperclip size={20}/>}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-2xl animate-in zoom-in">
                          <span className="text-sm font-bold text-blue-700 truncate max-w-[200px]">{file.name}</span>
                          <button type="button" onClick={() => removeFile(index)} className="text-blue-600 hover:bg-blue-100 p-1.5 rounded-full"><X size={18} /></button>
                        </div>
                      ))}
                      {selectedFiles.length < 5 && (
                        <label className="flex items-center justify-center gap-3 p-5 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                          <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
                          <Plus size={22} className="text-slate-400" /> <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Anexar Print</span>
                        </label>
                      )}
                    </div>
                  </FieldWrapper>
                </section>
              </div>

              {state?.error && (
                <div className="mx-6 md:mx-8 mb-8 p-6 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 text-red-700 text-sm md:text-base font-bold animate-in slide-in-from-top-2">
                  <AlertCircle size={24} className="flex-shrink-0" />
                  {state.error}
                </div>
              )}

              <div className="p-7 md:p-12 bg-slate-50/50 border-t border-slate-100 rounded-[2.5rem]">
                <button 
                  type="submit" 
                  onClick={handleValidateClick}
                  disabled={isPending || !bonusSelected} 
                  className="w-full bg-blue-600 text-white font-black py-5 md:py-7 rounded-[1.5rem] md:rounded-[2rem] hover:bg-blue-700 active:scale-[0.98] transition-all flex justify-center items-center gap-4 text-xl md:text-2xl shadow-xl shadow-blue-100 uppercase tracking-tight"
                >
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
        .custom-input, .custom-select { width: 100%; border: 2px solid #f1f5f9; padding: 1.1rem 1.4rem; border-radius: 1.25rem; background: #f8fafc; font-weight: 700; color: #0f172a; transition: all 0.25s ease; font-size: 1.25rem; min-height: 4.2rem; appearance: none; }
        @media (max-width: 768px) { .custom-input, .custom-select { padding: 1rem 1.2rem; font-size: 1.1rem; min-height: 4rem; } }
        .custom-input:focus, .custom-select:focus { outline: none; border-color: #2563eb; background: white; box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.08); transform: translateY(-1px); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        
        /* Ajuste para input de data */
        input[type="date"] {
          position: relative;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          background: transparent;
          bottom: 0;
          color: transparent;
          cursor: pointer;
          height: auto;
          left: 0;
          position: absolute;
          right: 0;
          top: 0;
          width: auto;
        }
      `}</style>
    </div>
  );
}

function SectionHeader({ number, title, subtitle }: any) {
  return (
    <div className="flex items-start gap-4">
      <span className="bg-slate-900 text-white text-[12px] font-black w-8 h-8 flex items-center justify-center rounded-xl shadow-md shrink-0 mt-1">{number}</span>
      <div><h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight italic leading-none">{title}</h2><p className="text-xs md:text-base font-medium text-slate-400 mt-1.5">{subtitle}</p></div>
    </div>
  );
}

function FieldWrapper({ label, icon, error, children }: any) {
  return (
    <div className="space-y-3 relative">
      {error && <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-sm mb-2 animate-in slide-in-from-top-2"><AlertCircle size={18} /> {error}</div>}
      <label className="flex items-center gap-2 text-[11px] md:text-[12px] font-black text-slate-400 uppercase tracking-widest ml-1">{icon} {label}</label>
      {children}
    </div>
  );
}

function InputField({ label, icon, error, ...props }: any) {
  return <FieldWrapper label={label} icon={icon} error={error}><input className="custom-input" {...props} /></FieldWrapper>;
}

// SUCCESS VIEW AGORA RECEBE E MOSTRA O PROTOCOLO
function SuccessView({ protocolo }: { protocolo?: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (protocolo) {
      navigator.clipboard.writeText(protocolo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white p-10 md:p-20 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl border border-white text-center animate-in zoom-in duration-500">
      <CheckCircle2 size={70} className="mx-auto text-emerald-500 mb-8" />
      <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 italic">Solicitação Recebida!</h2>
      
      {protocolo && (
        <div className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 mb-8 max-w-md mx-auto">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Seu Protocolo de Atendimento</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-xl md:text-3xl font-black text-slate-800 tracking-tight font-mono">{protocolo}</span>
            <button onClick={copyToClipboard} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500">
              {copied ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Copy size={20} />}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-medium italic">Salve este número para acompanhar seu caso</p>
        </div>
      )}

      <div className="text-slate-600 font-medium text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed space-y-6">
        <p>Sua contestação foi registrada com sucesso. Nossa equipe analisará os dados e retornará via e-mail em até <strong>5 dias úteis</strong>.</p>
      </div>
      <button onClick={() => window.location.reload()} className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-sm md:text-lg tracking-widest hover:bg-slate-800 transition-all shadow-xl">Novo Reporte</button>
    </div>
  );
}