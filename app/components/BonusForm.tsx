"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import { submitForm, type FormState } from "@/app/actions";
import { 
  CheckCircle2, Loader2, Search, Building2, 
  AlertCircle, Info, Paperclip, X, Plus, ChevronDown, Clock, Hash, FileText, Copy, BookOpen
} from "lucide-react";

// DADOS ESTÁTICOS
const SP_HOLIDAYS = ["2025-01-01", "2025-01-25", "2025-03-03", "2025-03-04", "2025-04-18", "2025-04-21", "2025-05-01", "2025-06-19", "2025-07-09", "2025-09-07", "2025-10-12", "2025-11-02", "2025-11-15", "2025-11-20", "2025-12-25", "2026-01-01", "2026-01-25", "2026-02-16", "2026-02-17", "2026-04-03", "2026-04-21", "2026-05-01", "2026-06-04", "2026-07-09", "2026-09-07", "2026-10-12", "2026-11-02", "2026-11-15", "2026-11-20", "2026-12-25"];
const BONUS_TYPES = ["Bônus Adicional 2 Turnos", "Bônus Data Comemorativa", "Bônus de Domingo", "Bônus de Fim de Ano", "Bônus de Treinamento", "Bônus Especial", "Bônus Ofertado por WhatsApp ou Push App", "Conectividade", "Hora Certa", "Indicação de Novo Zubalero", "Meta de Produtividade", "SKU / Item"];

export default function ZubaleBonusForm() {
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
  
  const fieldRefs: Record<string, any> = {
    nome: useRef<HTMLDivElement>(null), telefone: useRef<HTMLDivElement>(null), email: useRef<HTMLDivElement>(null), tiposolicitacao: useRef<HTMLDivElement>(null),
    data_contestacao: useRef<HTMLDivElement>(null), loja: useRef<HTMLDivElement>(null), codigo_indicacao: useRef<HTMLDivElement>(null), sku_codigo: useRef<HTMLDivElement>(null), detalhamento: useRef<HTMLDivElement>(null)
  };

  const [state, formAction, isPending] = useActionState<FormState, FormData>(submitForm, null);

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

  useEffect(() => {
    if (state?.success) {
      setBonusSelected(""); setDataContestacao(""); setTurno(""); setStoreSearch(""); setValorRecebido(""); setValorAnunciado(""); setDetalhamento(""); setSelectedFiles([]);
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
    setPhone("+" + val.substring(0, 13));
    localStorage.setItem("zubale_phone", "+" + val.substring(0, 13));
  };

  const handleIdentityChange = (field: 'nome' | 'email', value: string) => {
    if (field === 'nome') { setNome(value); localStorage.setItem("zubale_nome", value); } 
    else { setEmail(value); localStorage.setItem("zubale_email", value); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)].slice(0, 5));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => setSelectedFiles(prev => prev.filter((_, i) => i !== index));

  const handleValidateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const errors: Record<string, string> = {};
    const telefoneLimpo = phone.replace(/\D/g, "");

    if (!nome.trim()) errors.nome = "Informe seu nome completo.";
    if (telefoneLimpo.length !== 13) errors.telefone = "Informe o telefone completo com DDD.";
    if (!email.trim()) errors.email = "E-mail obrigatório.";
    
    if (!bonusSelected) errors.tiposolicitacao = "Selecione o bônus.";
    if (dataContestacao) {
      const taskDate = new Date(dataContestacao + "T00:00:00");
      const limit = calculateLimitDate();
      limit.setHours(0,0,0,0);
      if (taskDate > limit) errors.data_contestacao = "Aguarde 3 dias úteis.";
    } else {
      errors.data_contestacao = "Data obrigatória.";
    }
    if (!storesDatabase.includes(storeSearch)) errors.loja = "Loja inválida.";
    if (!detalhamento.trim()) errors.detalhamento = "Explique o caso.";

    if (bonusSelected === "Indicação de Novo Zubalero") {
       const el = document.querySelector('input[name="codigo_indicacao"]') as HTMLInputElement;
       if (!el?.value.trim()) errors.codigo_indicacao = "Código obrigatório.";
    }
    if (bonusSelected === "SKU / Item") {
       const el = document.querySelector('input[name="sku_codigo"]') as HTMLInputElement;
       if (!el?.value.trim()) errors.sku_codigo = "SKU obrigatório.";
    }

    if (Object.keys(errors).length > 0) {
      e.preventDefault(); 
      setFieldErrors(errors);
      const first = Object.keys(errors)[0].toLowerCase();
      // Ajuste simples para encontrar a ref correta (lowercase)
      const ref = Object.keys(fieldRefs).find(k => k.toLowerCase() === first);
      if (ref) fieldRefs[ref]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setFieldErrors({});
    }
  };

  if (state?.success) {
    return <SuccessView protocolo={state.protocolo} />;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* CARD DIRETRIZES */}
        <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200 border border-blue-500 relative overflow-hidden mb-8">
            <div className="absolute -right-8 -top-8 text-blue-500 opacity-20 transform rotate-12"><Info size={160} /></div>
            <h3 className="text-xl font-black mb-5 flex items-center gap-2 italic uppercase tracking-tight"><Info size={24} /> Regras de Utilização</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="flex gap-4">
                <div className="bg-blue-400/30 p-2 rounded-xl h-fit"><Clock size={22} /></div>
                <div><p className="text-sm font-bold text-blue-200 uppercase tracking-widest mb-1">Prazo</p><p className="text-base font-semibold">Aguarde <span className="underline font-black decoration-white">3 dias úteis</span> após a tarefa.</p></div>
            </div>
            <div className="flex gap-4">
                <div className="bg-blue-400/30 p-2 rounded-xl h-fit"><BookOpen size={22} /></div>
                <div><p className="text-sm font-bold text-blue-200 uppercase tracking-widest mb-1">Dúvidas?</p><a href="#" className="text-white underline font-black hover:text-blue-100 transition-colors text-sm">[Link: Regras de Pagamento]</a></div>
            </div>
            </div>
        </div>

        {/* FORMULÁRIO */}
        <form action={(formData) => {
            selectedFiles.forEach(file => formData.append("evidencias_files", file));
            formData.set("telefone", phone);
            formData.set("loja", storeSearch);
            formData.append("form_type", "contestacao_bonus");
            formAction(formData);
        }} className="card-zubale space-y-8">
            
            {/* 01. IDENTIFICAÇÃO */}
            <section className="space-y-6">
                <SectionHeader number="01" title="SUA IDENTIFICAÇÃO" subtitle="Dados para localização" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div ref={fieldRefs.nome} className="md:col-span-2"><InputField label="NOME COMPLETO" name="nome" value={nome} onChange={(e:any) => handleIdentityChange('nome', e.target.value)} placeholder="Conforme documento" error={fieldErrors.nome} required /></div>
                <div ref={fieldRefs.telefone}><InputField label="TELEFONE (DDD + NÚMERO)" name="telefone" value={phone} onChange={handlePhoneChange} error={fieldErrors.telefone} inputMode="numeric" required /></div>
                <div ref={fieldRefs.email}><InputField label="E-MAIL DE CADASTRO" name="email" type="email" value={email} onChange={(e:any) => handleIdentityChange('email', e.target.value)} placeholder="exemplo@zubale.com" error={fieldErrors.email} required /></div>
                </div>
            </section>

            {/* 02. ATUAÇÃO */}
            <section className="space-y-6 pt-8 border-t border-slate-100">
                <SectionHeader number="02" title="DADOS DA ATUAÇÃO" subtitle="Detalhes da divergência" />
                <div className="space-y-6">
                <div ref={fieldRefs.tiposolicitacao}>
                    <FieldWrapper label="O QUE DESEJA CONTESTAR?" icon={<AlertCircle size={20}/>} error={fieldErrors.tiposolicitacao}>
                    <select name="tipoSolicitacao" className="custom-select" value={bonusSelected} onChange={(e) => setBonusSelected(e.target.value)} required>
                        <option value="">Selecione o bônus...</option>
                        {BONUS_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    </FieldWrapper>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div ref={fieldRefs.data_contestacao}><InputField label="DATA DA REALIZAÇÃO" name="data_contestacao" type="date" value={dataContestacao} onChange={(e:any) => setDataContestacao(e.target.value)} error={fieldErrors.data_contestacao} required /></div>
                    <FieldWrapper label="TURNO ATUADO" icon={<Hash size={20}/>}>
                    <select name="turno" className="custom-select" value={turno} onChange={(e) => setTurno(e.target.value)} required>
                        <option value="">Selecione...</option><option value="Manhã">Manhã</option><option value="Tarde">Tarde</option><option value="Noite">Noite</option><option value="Integral">Integral</option>
                    </select>
                    </FieldWrapper>
                </div>
                <div ref={fieldRefs.loja}>
                    <FieldWrapper label="LOJA ATUADA (PESQUISE)" icon={<Search size={20}/>} error={fieldErrors.loja}>
                    <div className="relative" ref={dropdownRef}>
                        <div className="relative flex items-center" onClick={() => !isLoadingStores && setIsDropdownOpen(true)}>
                        <input type="text" placeholder="BUSCAR LOJA..." className="custom-input uppercase" value={storeSearch} onChange={(e) => { setStoreSearch(e.target.value); setIsDropdownOpen(true); }} autoComplete="off" />
                        <ChevronDown className={`absolute right-4 transition-transform text-slate-400 ${isDropdownOpen ? 'rotate-180' : ''}`} size={22} />
                        </div>
                        {isDropdownOpen && (
                        <div className="absolute z-[60] w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl max-h-[300px] overflow-y-auto custom-scrollbar">
                            {storesDatabase.filter(s => s.toLowerCase().includes(storeSearch.toLowerCase())).map((loja, i) => (
                            <div key={i} className="px-6 py-4 hover:bg-blue-50 cursor-pointer text-sm font-bold text-slate-700 border-b border-slate-50 last:border-none uppercase flex items-center gap-3" onClick={() => { setStoreSearch(loja); setIsDropdownOpen(false); setFieldErrors(prev => ({...prev, loja: ""})); }}>
                                <Building2 size={18} className="text-slate-300" /> {loja}
                            </div>
                            ))}
                        </div>
                        )}
                    </div>
                    </FieldWrapper>
                </div>
                </div>
            </section>

            {/* 03. DETALHES */}
            {bonusSelected && (
                <section className="space-y-6 pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-top-4">
                <SectionHeader number="03" title="DETALHES E PROVAS" subtitle="Justificativa" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {bonusSelected === "Indicação de Novo Zubalero" ? (
                    <div className="md:col-span-2" ref={fieldRefs.codigo_indicacao}><InputField label="CÓDIGO DE INDICAÇÃO" name="codigo_indicacao" icon={<Hash size={18}/>} placeholder="Código utilizado" required /></div>
                    ) : (
                    <>
                        {bonusSelected === "SKU / Item" && (
                        <div className="md:col-span-2" ref={fieldRefs.sku_codigo}><InputField label="CÓDIGO SKU" name="sku_codigo" icon={<Hash size={18}/>} placeholder="Código SKU" required /></div>
                        )}
                        <InputField label="VALOR RECEBIDO (R$)" name="valor_recebido" value={valorRecebido} onChange={(e:any) => setValorRecebido(e.target.value)} type="number" step="1" placeholder="0" required />
                        <InputField label="VALOR ANUNCIADO (R$)" name="valor_anunciado" value={valorAnunciado} onChange={(e:any) => setValorAnunciado(e.target.value)} type="number" step="1" placeholder="0" required />
                    </>
                    )}
                </div>
                <div ref={fieldRefs.detalhamento}>
                    <FieldWrapper label="EXPLIQUE SEU CASO (OBRIGATÓRIO)" icon={<FileText size={20}/>} error={fieldErrors.detalhamento}>
                    <textarea name="detalhamento" value={detalhamento} onChange={(e) => setDetalhamento(e.target.value)} rows={4} className="custom-input resize-none py-5" placeholder="Descreva o ocorrido..." required />
                    </FieldWrapper>
                </div>
                <FieldWrapper label="EVIDÊNCIAS (OPCIONAL - MÁX 5)" icon={<Paperclip size={20}/>}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                        <span className="text-sm font-bold text-blue-700 truncate max-w-[200px]">{file.name}</span>
                        <button type="button" onClick={() => removeFile(index)} className="text-blue-600 hover:bg-blue-100 p-1.5 rounded-full"><X size={18} /></button>
                        </div>
                    ))}
                    {selectedFiles.length < 5 && (
                        <label className="flex items-center justify-center gap-3 p-5 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                        <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
                        <Plus size={22} className="text-slate-400" /> <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Anexar</span>
                        </label>
                    )}
                    </div>
                </FieldWrapper>
                </section>
            )}

            {state?.error && <div className="p-6 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-700 font-bold"><AlertCircle size={24} /> {state.error}</div>}

            <div className="pt-4">
                <button type="submit" onClick={handleValidateClick} disabled={isPending || !bonusSelected} className="btn-zubale">
                {isPending ? <Loader2 className="animate-spin" size={28} /> : "ENVIAR CONTESTAÇÃO"}
                </button>
            </div>
        </form>
    </div>
  );
}

// HELPERS VISUAIS (Padronizados)
function SectionHeader({ number, title, subtitle }: any) {
  return (
    <div className="flex items-start gap-4">
      <span className="bg-slate-900 text-white text-[12px] font-black w-8 h-8 flex items-center justify-center rounded-xl shadow-md shrink-0 mt-1">{number}</span>
      <div><h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic leading-none">{title}</h2><p className="text-sm font-medium text-slate-400 mt-1">{subtitle}</p></div>
    </div>
  );
}

function FieldWrapper({ label, icon, error, children }: any) {
  return (
    <div className="space-y-2 relative">
      {error && <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-2 text-red-600 font-bold text-xs mb-2 animate-in slide-in-from-top-2"><AlertCircle size={16} /> {error}</div>}
      <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{icon} {label}</label>
      {children}
    </div>
  );
}

function InputField({ label, icon, error, ...props }: any) {
  return <FieldWrapper label={label} icon={icon} error={error}><input className="custom-input" {...props} /></FieldWrapper>;
}

function SuccessView({ protocolo }: { protocolo?: string }) {
  const [copied, setCopied] = useState(false);
  const copyToClipboard = () => { if (protocolo) { navigator.clipboard.writeText(protocolo); setCopied(true); setTimeout(() => setCopied(false), 2000); }};

  return (
    <div className="card-zubale text-center animate-in zoom-in duration-500">
      <CheckCircle2 size={70} className="mx-auto text-emerald-500 mb-8" />
      <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 italic">Solicitação Recebida!</h2>
      <div className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 mb-8 max-w-md mx-auto">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Seu Protocolo</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-xl md:text-3xl font-black text-slate-800 tracking-tight font-mono">{protocolo}</span>
          <button onClick={copyToClipboard} className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-500"><Copy size={20} /></button>
        </div>
      </div>
      <button onClick={() => window.location.reload()} className="btn-zubale bg-slate-900 hover:bg-slate-800">Novo Reporte</button>
    </div>
  );
}