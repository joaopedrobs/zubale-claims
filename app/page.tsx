"use client";

import { useState, useActionState, useMemo, useEffect, useRef } from "react";
import { submitContestation, type FormState } from "./actions";
import { 
  CheckCircle2, Loader2, Search, Building2, 
  Calendar, Phone, Mail, Hash, User, FileText, 
  AlertCircle, Info, Paperclip, X, Plus, ShieldCheck 
} from "lucide-react";

// Lista de bônus corrigida para evitar erros de encoding
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const [storesDatabase, setStoresDatabase] = useState<string[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(true);

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    submitContestation, 
    null
  );

  // Carrega a lista completa de lojas do Google Sheets via API Route
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

  // Filtra as sugestões para o datalist (limite de 100 para performance do navegador)
  const filteredStores = useMemo(() => {
    if (!storeSearch) return [];
    const searchLower = storeSearch.toLowerCase();
    return storesDatabase
      .filter(s => s.toLowerCase().includes(searchLower))
      .slice(0, 100); 
  }, [storeSearch, storesDatabase]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (!val.startsWith("55")) val = "55" + val;
    setPhone("+" + val.substring(0, 13)); 
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => {
        const totalFiles = [...prev, ...newFiles];
        return totalFiles.slice(0, 5);
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (formData: FormData) => {
    setLocalError(null);
    const lojaDigitada = formData.get("loja")?.toString();

    // VALIDAÇÃO RÍGIDA: Impede o envio se a loja não estiver na lista oficial
    if (!storesDatabase.includes(lojaDigitada || "")) {
      setLocalError("Loja inválida. Por favor, selecione uma opção da lista oficial.");
      return;
    }

    formData.delete("evidencias_files");
    selectedFiles.forEach(file => {
      formData.append("evidencias_files", file);
    });
    formAction(formData);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 font-sans">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="/logo_zubale.png" 
              alt="Zubale Logo"
              className="h-7 md:h-9 w-auto object-contain"
            />
          </div>
          
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-[11px] font-black border border-emerald-100 shadow-sm">
            <ShieldCheck size={14} />
            SISTEMA PROTEGIDO
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-16">
        <div className="text-center mb-16 animate-in fade-in duration-700">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight italic">
            Contestação de <span className="text-blue-600">Pagamentos</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Portal oficial para Zubaleros reportarem divergências em bônus, metas ou itens não pagos de forma rápida e segura.
          </p>
        </div>

        {state?.success ? (
          <SuccessView />
        ) : (
          <form action={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white overflow-hidden">
              <div className="p-8 md:p-14 space-y-12">
                
                <section className="space-y-8">
                  <SectionHeader number="01" title="SUA IDENTIFICAÇÃO" subtitle="Dados básicos para localizarmos seu perfil" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <InputField label="NÚMERO DO PROTOCOLO" name="protocolo" icon={<Hash size={18}/>} placeholder="Ex: 20250001..." required />
                    <InputField label="NOME COMPLETO" name="nome" icon={<User size={18}/>} placeholder="Conforme documento" required />
                    <InputField label="TELEFONE DE CADASTRO" name="telefone" icon={<Phone size={18}/>} value={phone} onChange={handlePhoneChange} placeholder="+55..." required />
                    <InputField label="E-MAIL DE CADASTRO" name="email" type="email" icon={<Mail size={18}/>} placeholder="exemplo@zubale.com" required />
                  </div>
                </section>

                <section className="space-y-8 pt-8 border-t border-slate-50">
                  <SectionHeader number="02" title="DADOS DA ATUAÇÃO" subtitle="Sobre o turno em que ocorreu a divergência" />
                  <div className="space-y-8">
                    <FieldWrapper label="O QUE DESEJA CONTESTAR?" icon={<AlertCircle size={18}/>}>
                      <select 
                        name="tipoSolicitacao" 
                        required 
                        className="custom-select"
                        onChange={(e) => setBonusSelected(e.target.value)}
                      >
                        <option value="">Selecione o tipo de bônus...</option>
                        {BONUS_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </FieldWrapper>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <InputField label="DATA DA CONTESTAÇÃO" name="data_contestacao" type="date" icon={<Calendar size={18}/>} required />
                      <FieldWrapper label="TURNO ATUADO" icon={<Hash size={18}/>}>
                        <select name="turno" required className="custom-select">
                          <option value="">Selecione...</option>
                          <option value="Manhã">Manhã</option>
                          <option value="Tarde">Tarde</option>
                          <option value="Noite">Noite</option>
                          <option value="Integral">Integral</option>
                        </select>
                      </FieldWrapper>
                    </div>

                    <FieldWrapper label="LOJA ATUADA (Pesquise na lista)" icon={<Search size={18}/>}>
                      <div className="relative group">
                        <input 
                          list="stores-list" 
                          placeholder={isLoadingStores ? "Carregando lista oficial..." : "Digite o nome exato da loja..."}
                          className="custom-input pl-4 uppercase"
                          onChange={(e) => setStoreSearch(e.target.value)}
                          name="loja"
                          required
                          autoComplete="off"
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
                  <section className="space-y-8 pt-8 border-t border-slate-50 animate-in fade-in slide-in-from-top-4 duration-500">
                    <SectionHeader number="03" title="DETALHES FINANCEIROS" subtitle="Forneça valores e evidências do caso" />
                    
                    {bonusSelected === "Indicação de Novo Zubalero" ? (
                      <InputField label="CÓDIGO DE INDICAÇÃO" name="codigo_indicacao" icon={<Hash size={18}/>} required />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {bonusSelected === "SKU / Item" && (
                          <div className="md:col-span-2">
                            <InputField label="CÓDIGO DO ITEM / SKU" name="sku_codigo" icon={<Hash size={18}/>} required />
                          </div>
                        )}
                        <InputField label="VALOR RECEBIDO (R$)" name="valor_recebido" type="number" step="0.01" icon={<Hash size={18}/>} placeholder="0,00" required />
                        <InputField label="VALOR ANUNCIADO (R$)" name="valor_anunciado" type="number" step="0.01" icon={<Hash size={18}/>} placeholder="0,00" required />
                      </div>
                    )}

                    <FieldWrapper label="EXPLIQUE SEU CASO" icon={<FileText size={18}/>}>
                      <textarea name="detalhamento" required rows={4} className="custom-input resize-none py-4" placeholder="Conte-nos o que aconteceu em detalhes..."></textarea>
                    </FieldWrapper>

                    <FieldWrapper label={`EVIDÊNCIAS (OPCIONAL - MÁX 5)`} icon={<Paperclip size={18}/>}>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-blue-50/50 border border-blue-100 rounded-2xl animate-in fade-in zoom-in duration-200">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <FileText size={16} className="text-blue-600 flex-shrink-0" />
                                <span className="text-xs font-bold text-blue-900 truncate">{file.name}</span>
                              </div>
                              <button type="button" onClick={() => removeFile(index)} className="p-1.5 hover:bg-blue-200/50 rounded-full text-blue-600 transition-colors">
                                <X size={14} />
                              </button>
                            </div>
                          ))}

                          {selectedFiles.length < 5 && (
                            <label className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group">
                              <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} />
                              <Plus size={18} className="text-slate-400 group-hover:text-blue-500" />
                              <span className="text-xs font-black text-slate-500 uppercase tracking-wider group-hover:text-blue-600">Adicionar Print</span>
                            </label>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">PNG ou JPG até 5MB cada.</p>
                      </div>
                    </FieldWrapper>
                  </section>
                )}
              </div>

              {(state?.error || localError) && (
                <div className="mx-8 mb-8 p-5 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 text-red-700 text-sm font-bold animate-pulse">
                  <AlertCircle size={24} className="flex-shrink-0" />
                  {localError || state?.error}
                </div>
              )}

              <div className="p-10 bg-slate-50/50 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isPending || !bonusSelected}
                  className="w-full bg-blue-600 text-white font-black py-6 rounded-[2rem] hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-40 flex justify-center items-center gap-4 text-xl shadow-lg shadow-blue-100 uppercase tracking-tight"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      Enviando Solicitação...
                    </>
                  ) : "Confirmar e Enviar Contestação"}
                </button>
              </div>
            </div>
          </form>
        )}

        <footer className="mt-12 text-center text-slate-400 text-sm font-medium">
          © {new Date().getFullYear()} Zubale Brasil · Todos os direitos reservados
        </footer>
      </main>

      <style jsx global>{`
        .custom-input, .custom-select {
          width: 100%;
          border: 2px solid #f1f5f9;
          padding: 1.25rem 1.5rem;
          border-radius: 1.25rem;
          background: #f8fafc;
          font-weight: 700;
          color: #0f172a;
          transition: all 0.25s ease;
          font-size: 0.95rem;
        }
        .custom-input:focus, .custom-select:focus {
          outline: none;
          border-color: #2563eb;
          background: white;
          box-shadow: 0 0 0 5px rgba(37, 99, 235, 0.08);
          transform: translateY(-1px);
        }
        .custom-input::placeholder { color: #94a3b8; font-weight: 500; }
        select.custom-select { cursor: pointer; }
      `}</style>
    </div>
  );
}

// COMPONENTES AUXILIARES
function SectionHeader({ number, title, subtitle }: { number: string, title: string, subtitle: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="bg-slate-900 text-white text-[11px] font-black w-7 h-7 flex items-center justify-center rounded-xl shadow-md flex-shrink-0 mt-1">
        {number}
      </span>
      <div>
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight italic leading-none">{title}</h2>
        <p className="text-sm font-medium text-slate-400 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

function FieldWrapper({ label, icon, children }: { label: string, icon: any, children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">
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
    <div className="bg-white p-12 md:p-20 rounded-[3.5rem] shadow-2xl shadow-blue-100 border border-white text-center animate-in zoom-in duration-500">
      <div className="w-28 h-28 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
        <CheckCircle2 size={56} />
      </div>
      <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight italic">Solicitação Recebida!</h2>
      <p className="text-slate-500 font-medium text-lg mb-12 max-w-sm mx-auto leading-relaxed">
        Seu reporte foi registrado com sucesso. Nossa equipe de operações analisará o caso e retornará via e-mail.
      </p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 hover:shadow-xl transition-all active:scale-95 uppercase text-sm tracking-widest"
      >
        Novo Reporte
      </button>
    </div>
  );
}