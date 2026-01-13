"use client";

import { useState, useActionState, useMemo } from "react";
import { submitContestation } from "./actions";
import { 
  CheckCircle2, Loader2, Search, Building2, 
  Calendar, Phone, Mail, Hash, User, FileText 
} from "lucide-react";

// Lista de Bônus conforme solicitado
const BONUS_TYPES = [
  "Indicação de Novo Zubalero", "Meta de Produtividade", "Bônus de Domingo",
  "Bônus de Fim de Ano", "Bônus Adicional 2 Turnos", "Conectividade",
  "Hora Certa", "Bônus Ofertado por Whatsapp ou Push App",
  "Bônus Data Comemorativa", "Bônus de Treinamento", "Bônus Especial", "SKU / Item"
];

// Exemplo de lista de lojas (que futuramente virá do Google Sheets)
const STORES_DATABASE = ["Carrefour - São Paulo", "Big - Curitiba", "Sam's Club - Rio", "Pão de Açúcar - BH"];

export default function ContestacaoPortal() {
  const [bonusSelected, setBonusSelected] = useState("");
  const [storeSearch, setStoreSearch] = useState("");
  const [phone, setPhone] = useState("+55");
  const [state, formAction, isPending] = useActionState(submitContestation, null);

  // Filtro de Lojas dinâmico
  const filteredStores = useMemo(() => 
    STORES_DATABASE.filter(s => s.toLowerCase().includes(storeSearch.toLowerCase())),
    [storeSearch]
  );

  // Validador/Máscara de Telefone (+5511955515313)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (!val.startsWith("55")) val = "55" + val;
    setPhone("+" + val.substring(0, 13)); // Limita ao formato E.164 Brasil
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      {/* HEADER COM LOGO */}
      <header className="max-w-4xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">Z</span>
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tight">Zubale <span className="text-blue-600">Ops</span></span>
        </div>
        <div className="hidden md:block px-4 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
          AMBIENTE SEGURO
        </div>
      </header>

      <main className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-2 italic">Contestação de Pagamentos</h1>
          <p className="text-slate-500">Portal oficial para reporte de divergências em bônus e metas.</p>
        </div>

        {state?.success ? (
          <div className="bg-white p-12 rounded-3xl shadow-xl border border-slate-100 text-center animate-in fade-in zoom-in duration-300">
             <CheckCircle2 className="mx-auto text-green-500 mb-6" size={80} />
             <h2 className="text-2xl font-bold text-slate-900">Solicitação Enviada!</h2>
             <p className="text-slate-600 mt-2">O número do seu protocolo é o informado no formulário. <br/> Verifique seu e-mail em breve.</p>
             <button onClick={() => window.location.reload()} className="mt-8 px-6 py-2 bg-slate-900 text-white rounded-full font-bold">Novo Reporte</button>
          </div>
        ) : (
          <form action={formAction} className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-blue-600 p-6 text-white flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl"><FileText /></div>
              <div>
                <h3 className="font-bold text-lg">Novo Reporte</h3>
                <p className="text-blue-100 text-sm">Preencha todos os campos obrigatórios.</p>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* SEÇÃO 1: DADOS BÁSICOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Protocolo Suporte" icon={<Hash size={18}/>}>
                  <input name="protocolo" required placeholder="Ex: 20250001010101" className="input-style" />
                </Field>
                <Field label="Nome Completo" icon={<User size={18}/>}>
                  <input name="nome" required placeholder="Como no cadastro" className="input-style" />
                </Field>
                <Field label="Telefone (WhatsApp)" icon={<Phone size={18}/>}>
                  <input name="telefone" required value={phone} onChange={handlePhoneChange} placeholder="+5511999999999" className="input-style" />
                </Field>
                <Field label="E-mail" icon={<Mail size={18}/>}>
                  <input name="email" type="email" required placeholder="seu@email.com" className="input-style" />
                </Field>
              </div>

              {/* SEÇÃO 2: CONTESTAÇÃO */}
              <div className="space-y-6 pt-6 border-t border-slate-100">
                <Field label="O que deseja contestar?" icon={<FileText size={18}/>}>
                  <select 
                    name="tipoSolicitacao" 
                    required 
                    className="input-style appearance-none"
                    onChange={(e) => setBonusSelected(e.target.value)}
                  >
                    <option value="">Selecione o bônus</option>
                    {BONUS_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Data da Contestação" icon={<Calendar size={18}/>}>
                    <input name="data_contestacao" type="date" required className="input-style" />
                  </Field>
                  <Field label="Turno da Ocorrência" icon={<Hash size={18}/>}>
                    <select name="turno" required className="input-style">
                      <option value="">Selecione</option>
                      <option value="Manhã">Manhã</option>
                      <option value="Tarde">Tarde</option>
                      <option value="Noite">Noite</option>
                      <option value="Integral">Integral</option>
                    </select>
                  </Field>
                </div>

                <Field label="Loja Atuada" icon={<Building2 size={18}/>}>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input 
                      list="stores-list" 
                      placeholder="Pesquisar loja..." 
                      className="input-style pl-10"
                      onChange={(e) => setStoreSearch(e.target.value)}
                      name="loja"
                      required
                    />
                    <datalist id="stores-list">
                      {filteredStores.map(s => <option key={s} value={s} />)}
                    </datalist>
                  </div>
                </Field>
              </div>

              {/* SEÇÃO 3: CAMPOS DINÂMICOS */}
              <div className="pt-6 border-t border-slate-100 animate-in slide-in-from-top-4 duration-500">
                {bonusSelected === "Indicação de Novo Zubalero" && (
                  <div className="space-y-6">
                    <Field label="Código de indicação utilizado" icon={<Hash size={18}/>}>
                      <input name="codigo_indicacao" required className="input-style" />
                    </Field>
                  </div>
                )}

                {bonusSelected === "SKU / Item" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Field label="Código do Item" icon={<Hash size={18}/>}>
                      <input name="sku_codigo" required className="input-style" />
                    </Field>
                  </div>
                )}

                {/* Campos comuns para valores */}
                {bonusSelected && bonusSelected !== "Indicação de Novo Zubalero" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Field label="Valor Recebido (R$)" icon={<Hash size={18}/>}>
                      <input name="valor_recebido" type="number" step="0.01" required placeholder="0,00" className="input-style" />
                    </Field>
                    <Field label="Valor Anunciado/Esperado (R$)" icon={<Hash size={18}/>}>
                      <input name="valor_anunciado" type="number" step="0.01" required placeholder="0,00" className="input-style" />
                    </Field>
                  </div>
                )}

                {bonusSelected && (
                  <div className="space-y-6">
                    <Field label="Explique melhor o seu caso" icon={<FileText size={18}/>}>
                      <textarea name="detalhamento" required rows={4} className="input-style resize-none" placeholder="Dê detalhes sobre o que aconteceu..."></textarea>
                    </Field>
                    <Field label="Evidências (Links de Prints/Drive)" icon={<FileText size={18}/>}>
                      <input name="evidencias" required type="url" placeholder="https://link-da-imagem.com" className="input-style" />
                    </Field>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending || !bonusSelected}
                className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 transition disabled:opacity-50 flex justify-center items-center gap-3 text-lg shadow-xl shadow-blue-200"
              >
                {isPending ? <><Loader2 className="animate-spin" /> PROCESSANDO...</> : "ENVIAR SOLICITAÇÃO"}
              </button>
            </div>
          </form>
        )}
      </main>

      <style jsx global>{`
        .input-style {
          width: 100%;
          border: 1px solid #e2e8f0;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          background: #fcfcfd;
          transition: all 0.2s;
        }
        .input-style:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }
      `}</style>
    </div>
  );
}

// Componente Auxiliar para Labels
function Field({ label, icon, children }: { label: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
        {icon} {label}
      </label>
      {children}
    </div>
  );
}