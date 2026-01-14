"use client";

import { useState, useActionState, useMemo, useEffect, useRef, startTransition } from "react";
import { submitContestation, type FormState } from "./actions";
import { 
  CheckCircle2, Loader2, Search, Building2, 
  AlertCircle, Info, Paperclip, X, Plus, ShieldCheck, ChevronDown, Clock, CopyX, Hash, FileText
} from "lucide-react";

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
  const [isMounted, setIsMounted] = useState(false);
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
  const fieldRefs: Record<string, any> = {
    protocolo: useRef<HTMLDivElement>(null),
    telefone: useRef<HTMLDivElement>(null),
    data_contestacao: useRef<HTMLDivElement>(null),
    loja: useRef<HTMLDivElement>(null),
  };

  const [state, formAction, isPending] = useActionState<FormState, FormData>(submitContestation, null);

  useEffect(() => {
    setIsMounted(true);
    // Cache Permanente
    setNome(localStorage.getItem("zubale_nome") || "");
    setEmail(localStorage.getItem("zubale_email") || "");
    setPhone(localStorage.getItem("zubale_phone") || "+55");
    // Cache Temporário
    setBonusSelected(localStorage.getItem("temp_bonus") || "");
    setDataContestacao(localStorage.getItem("temp_data") || "");
    setTurno(localStorage.getItem("temp_turno") || "");
    setStoreSearch(localStorage.getItem("temp_store") || "");
    setValorRecebido(localStorage.getItem("temp_v_rec") || "");
    setValorAnunciado(localStorage.getItem("temp_v_anu") || "");
    setDetalhamento(localStorage.getItem("temp_det") || "");

    fetch("/api/stores").then(res => res.json()).then(data => {
      setStoresDatabase(data);
      setIsLoadingStores(false);
    });

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    const final = "+" + val.substring(0, 13);
    setPhone(final);
    localStorage.setItem("zubale_phone", final);
  };

  const validateAndSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const errors: Record<string, string> = {};
    const protocolo = formData.get("protocolo")?.toString() || "";
    const telefoneLimpo = phone.replace(/\D/g, "");

    if (protocolo.length < 12) errors.protocolo = "O protocolo deve ter pelo menos 12 dígitos.";
    if (telefoneLimpo.length !== 13) errors.telefone = "Informe o telefone completo com DDD.";
    
    if (dataContestacao) {
      const taskDate = new Date(dataContestacao + "T00:00:00");
      const limit = calculateLimitDate();
      limit.setHours(0,0,0,0);
      if (taskDate > limit) errors.data_contestacao = "Abertura permitida apenas após 3 dias úteis.";
    }

    if (!storesDatabase.includes(storeSearch)) errors.loja = "Selecione uma loja oficial da lista.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const first = Object.keys(errors)[0];
      fieldRefs[first]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Cache Permanente
    localStorage.setItem("zubale_nome", nome);
    localStorage.setItem("zubale_email", email);

    setFieldErrors({});
    formData.set("loja", storeSearch);
    selectedFiles.forEach(file => formData.append("evidencias_files", file));
    
    // FIX: startTransition resolve o erro de transition do React
    startTransition(() => {
      formAction(formData);
    });
  };

  useEffect(() => {
    if (state?.success) {
      const temp = ["temp_bonus", "temp_data", "temp_turno", "temp_store", "temp_v_rec", "temp_v_anu", "temp_det"];
      temp.forEach(k => localStorage.removeItem(k));
    }
  }, [state]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans text-slate-900">
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <img src="/logo_zubale.png" alt="Zubale" className="h-7 w-auto" />
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-[11px] font-black border border-emerald-100 shadow-sm">
            <ShieldCheck size={14} /> <span>SISTEMA PROTEGIDO</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 pt-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 italic">Contestação de <span className="text-blue-600">Pagamentos</span></h1>
          <p className="text-blue-500 font-bold text-lg md:text-xl italic mb-4 max-w-2xl mx-auto">"Nossa prioridade é garantir que você receba exatamente o que conquistou."</p>
        </div>

        {state?.success ? <SuccessView /> : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
              <h3 className="text-xl font-black mb-5 flex items-center gap-2 uppercase tracking-tight"><Info /> Diretrizes Importantes</h3>
              <div className="grid md:grid-cols-2 gap-6 relative z-10">
                <div className="flex gap-4"><Clock size={22} /><p className="font-semibold leading-tight">Mínimo de <span className="underline font-black">3 dias úteis</span> após a tarefa.</p></div>
                <div className="flex gap-4"><CopyX size={22} /><p className="font-semibold leading-tight">Protocolos duplicados são <span className="font-black text-blue-100">negados automaticamente</span>.</p></div>
              </div>
            </div>

            <form onSubmit={validateAndSubmit} className="space-y-8">
              <div className="bg-white rounded-[2rem] shadow-2xl border p-8 md:p-14 space-y-12">
                <section className="space-y-7">
                  <SectionHeader number="01" title="SUA IDENTIFICAÇÃO" />
                  <div className="grid md:grid-cols-2 gap-8">
                    <div ref={fieldRefs.protocolo}>
                      <InputField label="NÚMERO DO PROTOCOLO" name="protocolo" placeholder="Mínimo 12 dígitos" type="text" inputMode="numeric" autoComplete="off" error={fieldErrors.protocolo} required />
                      <p className="text-[11px] font-bold text-slate-400 italic mt-2 uppercase tracking-tighter">* Não reutilize protocolos anteriores</p>
                    </div>
                    <InputField label="NOME COMPLETO" name="nome" value={nome} onChange={(e:any) => setNome(e.target.value)} required />
                    <div ref={fieldRefs.telefone}>
                      <InputField label="TELEFONE (DDD + NÚMERO)" name="telefone" value={phone} onChange={handlePhoneChange} error={fieldErrors.telefone} inputMode="numeric" required />
                      <p className="text-[11px] font-bold text-slate-500 italic mt-2 leading-tight">* Se o telefone estiver incorreto, não será possível identificá-lo no sistema.</p>
                    </div>
                    <InputField label="E-MAIL DE CADASTRO" name="email" type="email" value={email} onChange={(e:any) => setEmail(e.target.value)} required />
                  </div>
                </section>

                <section className="space-y-7 pt-9 border-t">
                  <SectionHeader number="02" title="DADOS DA ATUAÇÃO" />
                  <div className="space-y-8">
                    <FieldWrapper label="O QUE DESEJA CONTESTAR?" error={fieldErrors.tipoSolicitacao}>
                      <select name="tipoSolicitacao" value={bonusSelected} className="custom-select" onChange={(e) => {setBonusSelected(e.target.value); localStorage.setItem("temp_bonus", e.target.value)}} required>
                        <option value="">Selecione o bônus...</option>
                        {BONUS_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </FieldWrapper>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div ref={fieldRefs.data_contestacao}>
                        <InputField label="DATA DA REALIZAÇÃO" name="data_contestacao" type="date" value={dataContestacao} onChange={(e:any) => {setDataContestacao(e.target.value); localStorage.setItem("temp_data", e.target.value)}} error={fieldErrors.data_contestacao} required />
                        <p className="text-[11px] font-bold text-slate-400 italic mt-2 uppercase">* Respeite o prazo de 3 dias úteis (SP)</p>
                      </div>
                      <FieldWrapper label="TURNO ATUADO">
                        <select name="turno" value={turno} className="custom-select" onChange={(e) => {setTurno(e.target.value); localStorage.setItem("temp_turno", e.target.value)}} required>
                          <option value="">Selecione...</option><option value="Manhã">Manhã</option><option value="Tarde">Tarde</option><option value="Noite">Noite</option><option value="Integral">Integral</option>
                        </select>
                      </FieldWrapper>
                    </div>

                    <div ref={fieldRefs.loja}>
                      <FieldWrapper label="LOJA ATUADA (LISTA)" error={fieldErrors.loja}>
                        <div className="relative" ref={dropdownRef}>
                          <div className={`relative flex items-center bg-[#f8fafc] border-2 rounded-xl transition-all ${isDropdownOpen ? 'border-blue-500 bg-white ring-4 ring-blue-50' : 'border-[#f1f5f9]'}`} onClick={() => !isLoadingStores && setIsDropdownOpen(true)}>
                            <input type="text" className="w-full p-5 bg-transparent font-bold outline-none uppercase text-lg" value={storeSearch} onChange={(e) => { setStoreSearch(e.target.value); setIsDropdownOpen(true); }} autoComplete="off" />
                            <ChevronDown className={`mr-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                          </div>
                          {isDropdownOpen && (
                            <div className="absolute z-[60] w-full mt-2 bg-white border rounded-2xl shadow-2xl overflow-hidden">
                              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {storesDatabase.filter(s => s.toLowerCase().includes(storeSearch.toLowerCase())).map((loja, i) => (
                                  <div key={i} className="px-6 py-4 hover:bg-blue-50 cursor-pointer font-bold text-slate-700 border-b last:border-none uppercase flex items-center gap-3" onClick={() => { setStoreSearch(loja); localStorage.setItem("temp_store", loja); setIsDropdownOpen(false); setFieldErrors(prev => ({...prev, loja: ""})); }}>
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

                {bonusSelected && (
                  <section className="space-y-7 pt-9 border-t animate-in fade-in">
                    <SectionHeader number="03" title="DETALHES DO REPORTE" />
                    <div className="grid md:grid-cols-2 gap-8">
                      {bonusSelected === "Indicação de Novo Zubalero" ? (
                        <div className="md:col-span-2"><InputField label="CÓDIGO DE INDICAÇÃO" name="codigo_indicacao" required /></div>
                      ) : (
                        <>
                          {bonusSelected === "SKU / Item" && <div className="md:col-span-2"><InputField label="CÓDIGO SKU" name="sku_codigo" required /></div>}
                          <InputField label="VALOR RECEBIDO" name="valor_recebido" value={valorRecebido} onChange={(e:any) => {setValorRecebido(e.target.value); localStorage.setItem("temp_v_rec", e.target.value)}} type="number" step="1" required />
                          <InputField label="VALOR ANUNCIADO" name="valor_anunciado" value={valorAnunciado} onChange={(e:any) => {setValorAnunciado(e.target.value); localStorage.setItem("temp_v_anu", e.target.value)}} type="number" step="1" required />
                        </>
                      )}
                    </div>
                    <FieldWrapper label="EXPLIQUE SEU CASO (OPCIONAL)"><textarea name="detalhamento" value={detalhamento} onChange={(e) => {setDetalhamento(e.target.value); localStorage.setItem("temp_det", e.target.value)}} rows={4} className="custom-input py-5" /></FieldWrapper>
                    <FieldWrapper label="EVIDÊNCIAS (OPCIONAL)">
                      <div className="grid md:grid-cols-2 gap-4">
                        {selectedFiles.map((f, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-blue-50 border rounded-2xl animate-in zoom-in">
                            <span className="text-sm font-bold text-blue-700 truncate">{f.name}</span>
                            <button type="button" onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-blue-600 hover:bg-blue-100 p-1 rounded-full"><X size={16} /></button>
                          </div>
                        ))}
                        {selectedFiles.length < 5 && (
                          <label className="flex items-center justify-center gap-3 p-5 border-2 border-dashed rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                            <input type="file" multiple accept="image/*" onChange={(e) => e.target.files && setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)].slice(0, 5))} className="hidden" />
                            <Plus size={22} className="text-slate-400" /> <span className="text-sm font-black uppercase tracking-widest">Anexar Print</span>
                          </label>
                        )}
                      </div>
                    </FieldWrapper>
                  </section>
                )}
              </div>

              <div className="p-10 bg-slate-50/50 border-t rounded-[2.5rem]">
                <button type="submit" disabled={isPending || !bonusSelected} className="w-full bg-blue-600 text-white font-black py-7 rounded-[2rem] hover:bg-blue-700 active:scale-[0.98] transition-all flex justify-center items-center gap-4 text-2xl shadow-xl uppercase">
                  {isPending ? <Loader2 className="animate-spin" /> : "Confirmar e Enviar Contestação"}
                </button>
              </div>
            </form>
          </div>
        )}
        <footer className="mt-12 text-center text-slate-400 text-xs md:text-sm font-medium italic">© 2026 Zubale Brasil · Todos os direitos reservados</footer>
      </main>

      <style jsx global>{`
        .custom-input, .custom-select { width: 100%; border: 2px solid #f1f5f9; padding: 1.1rem 1.4rem; border-radius: 1.25rem; background: #f8fafc; font-weight: 700; color: #0f172a; transition: all 0.25s ease; font-size: 1.25rem; min-height: 4.2rem; appearance: none; }
        .custom-input:focus, .custom-select:focus { outline: none; border-color: #2563eb; background: white; box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.08); transform: translateY(-1px); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
}

function SectionHeader({ number, title }: any) {
  return (
    <div className="flex items-start gap-4">
      <span className="bg-slate-900 text-white text-[12px] font-black w-8 h-8 flex items-center justify-center rounded-xl shadow-md shrink-0 mt-1">{number}</span>
      <h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight italic leading-none">{title}</h2>
    </div>
  );
}

function FieldWrapper({ label, error, children }: any) {
  return (
    <div className="space-y-3 relative">
      {error && <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-sm mb-2 animate-in slide-in-from-top-2"><AlertCircle size={18} /> {error}</div>}
      <label className="flex items-center gap-2 text-[11px] md:text-[12px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      {children}
    </div>
  );
}

function InputField({ label, error, ...props }: any) {
  return <FieldWrapper label={label} error={error}><input className="custom-input" {...props} /></FieldWrapper>;
}

function SuccessView() {
  return (
    <div className="bg-white p-12 md:p-24 rounded-[3rem] shadow-2xl text-center animate-in zoom-in">
      <CheckCircle2 size={80} className="mx-auto text-emerald-500 mb-8" />
      <h2 className="text-5xl font-black text-slate-900 mb-6 italic">Solicitação Recebida!</h2>
      <div className="text-slate-600 font-medium text-lg md:text-xl mb-12 max-w-xl mx-auto space-y-6 leading-relaxed">
        <p>Reporte registrado com sucesso. Analisaremos e retornaremos via e-mail em até <strong>5 dias úteis</strong>.</p>
        <div className="bg-slate-50 p-8 rounded-3xl text-sm border text-left space-y-3 shadow-sm">
          <p className="font-black text-slate-800 uppercase tracking-tight">Regras de Revisão:</p>
          <ul className="list-disc list-inside space-y-2 text-slate-500">
            <li>Pedidos feitos antes de 3 dias úteis são negados.</li>
            <li>O uso de protocolos duplicados anula a revisão.</li>
            <li>Verifique seu e-mail cadastrado regularmente.</li>
          </ul>
        </div>
      </div>
      <button onClick={() => window.location.reload()} className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-lg shadow-xl tracking-widest">Novo Reporte</button>
    </div>
  );
}