"use client";

import { useState, useActionState, useMemo, useEffect } from "react";
import { submitContestation, FormState } from "./actions";
import { 
  CheckCircle2, Loader2, Search, Building2, 
  Calendar, Phone, Mail, Hash, User, FileText, AlertCircle, Info
} from "lucide-react";

// Lista de bônus com caracteres corrigidos
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
  
  // Estados para integração com o Google Sheets
  const [storesDatabase, setStoresDatabase] = useState<string[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(true);

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    submitContestation, 
    null
  );

  // Busca as lojas da API Route que criamos
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
  if (!storeSearch) return storesDatabase.slice(0, 0);

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
          <form action={formAction} className="space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
              <div className="p-8 md:p-12 space-y-10">
                
                {/* GRUPO 1: IDENTIFICAÇÃO */}
                <section className="space-y-6">
                  <SectionTitle number="01" title="Sua Identificação" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Protocolo Suporte" name="protocolo" icon={<Hash size={18}/>} placeholder="Ex: 20250001010101" required />
                    <InputField label="Nome Completo" name="nome" icon={<User size={18}/>} placeholder="Nome como no App" required />
                    <InputField label="Telefone" name="telefone" icon={<Phone size={18}/>} value={phone} onChange={handlePhoneChange} placeholder="+5511999999999" required />
                    <InputField label="E-mail Cadastrado" name="email" type="email" icon={<Mail size={18}/>} placeholder="exemplo@zubale.com" required />
                  </div>
                </section>

                {/* GRUPO 2: DETALHES DA OCORRÊNCIA */}
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

                {/* GRUPO 3: CAMPOS DINÂMICOS */}
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

                    <FieldWrapper label="Evidências (Link do Print)" icon={<Info size={18}/>}>
                      <input name="evidencias" type="url" required placeholder="Cole o link do Google Drive ou Print aqui" className="custom-input" />
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

// COMPONENTES AUXILIARES DE UI
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