"use client";

import { useState } from "react";
import { 
  User, Building2, ChevronRight, ShieldAlert, IdCard, 
  Package, FileText, Users, Megaphone, Calendar, Ban, 
  Wallet, Lock, Archive, AlertTriangle
} from "lucide-react";

import Header from "./components/Header"; 
import GenericForm from "./components/GenericForm"; 
import ZubaleBonusForm from "./components/BonusForm"; 
import StoreSelect from "./components/StoreSelect"; 

export default function PortalHome() {
  const [view, setView] = useState<"home" | "menu_zubalero" | "menu_lojista">("home");
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [materialSelected, setMaterialSelected] = useState("");

  const goBack = () => {
    if (selectedForm) {
      setSelectedForm(null);
      setMaterialSelected("");
    } else {
      setView("home");
    }
  };

  const renderContent = () => {
    // =========================================================================
    // 1. TELA INICIAL
    // =========================================================================
    if (view === "home") {
      return (
        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500 pt-8">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 text-center tracking-tight italic">
            PORTAL DE <span className="text-blue-600">SOLICITAÇÕES</span>
          </h1>
          <p className="text-slate-500 font-bold text-lg mb-12 text-center max-w-lg leading-relaxed">
            Selecione seu perfil abaixo para acessar os formulários.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
            <ProfileCard 
              icon={<User size={48} />} 
              title="SOU ZUBALERO" 
              desc="Pagamentos, denúncias e materiais."
              color="blue"
              onClick={() => setView("menu_zubalero")}
            />
            <ProfileCard 
              icon={<Building2 size={48} />} 
              title="SOU LOJISTA" 
              desc="Solicitações operacionais e reportes."
              color="emerald"
              onClick={() => setView("menu_lojista")}
            />
          </div>
        </div>
      );
    }

    // =========================================================================
    // 2. CENTRAL DO PARCEIRO (ORDEM POR IMPORTÂNCIA)
    // =========================================================================
    if (view === "menu_zubalero" && !selectedForm) {
      return (
        <div className="max-w-2xl mx-auto px-4 pt-4 animate-in slide-in-from-right-8 duration-500">
          <h2 className="text-3xl font-black text-slate-900 mb-2 italic">CENTRAL DO PARCEIRO</h2>
          <p className="text-slate-500 font-bold mb-8">Selecione o tipo de solicitação:</p>
          
          <div className="space-y-4">
            {/* 1. PAGAMENTO DE BÔNUS (Mais importante) */}
            <MenuOption 
                icon={<Package className="text-white" size={24} />} 
                iconBg="bg-blue-600" 
                title="PAGAMENTO DE BÔNUS" 
                desc="Contestar valores não recebidos ou divergentes." 
                onClick={() => setSelectedForm("contestacao_bonus")} 
            />

            {/* 2. OUVIDORIA / CONDUTA */}
            <MenuOption 
                icon={<AlertTriangle className="text-white" size={24} />} 
                iconBg="bg-orange-500" 
                title="OUVIDORIA / CONDUTA" 
                desc="Denunciar fraudes, problemas em loja ou má conduta." 
                onClick={() => setSelectedForm("ouvidoria_conduta")} 
            />

            {/* 3. CONTESTAR BLOQUEIO */}
            <MenuOption 
                icon={<Lock className="text-white" size={24} />} 
                iconBg="bg-red-500" 
                title="CONTESTAR BLOQUEIO" 
                desc="Solicitar revisão de suspensão da conta." 
                onClick={() => setSelectedForm("revisao_bloqueio")} 
            />

            {/* 4. SOLICITAR SAQUE (BLOQUEIO) */}
            <MenuOption 
                icon={<Wallet className="text-white" size={24} />} 
                iconBg="bg-emerald-500" 
                title="SOLICITAR SAQUE (BLOQUEIO)" 
                desc="Resgate de saldo retido após bloqueio definitivo." 
                onClick={() => setSelectedForm("solicitacao_saque")} 
            />
            
            {/* 5. SOLICITAR MATERIAIS */}
            <MenuOption 
                icon={<Archive className="text-white" size={24} />} 
                iconBg="bg-slate-500" 
                title="SOLICITAR MATERIAIS" 
                desc="Crachás, coletes ou reposição de itens." 
                onClick={() => setSelectedForm("solicitacao_materiais")} 
            />
          </div>
        </div>
      );
    }

    // =========================================================================
    // 3. GESTÃO OPERACIONAL (LOJISTA)
    // =========================================================================
    if (view === "menu_lojista" && !selectedForm) {
      return (
        <div className="max-w-2xl mx-auto px-4 pt-4 animate-in slide-in-from-right-8 duration-500">
          <h2 className="text-3xl font-black text-slate-900 mb-2 italic">GESTÃO OPERACIONAL</h2>
          <p className="text-slate-500 font-bold mb-8">Ferramentas para lojas parceiras:</p>
          
          <div className="space-y-4">
            <MenuOption icon={<ShieldAlert className="text-white" size={24} />} iconBg="bg-red-600" title="REPORTAR CONDUTA / BLOQUEIO" desc="Solicitar bloqueio de parceiro." onClick={() => setSelectedForm("bloqueio_zubalero")} />
             <MenuOption icon={<Ban className="text-white" size={24} />} iconBg="bg-orange-500" title="REPORTAR FALTA (NO SHOW)" desc="Informar não comparecimento." onClick={() => setSelectedForm("reportar_falta_lojista")} />
            <MenuOption icon={<Users className="text-white" size={24} />} iconBg="bg-emerald-500" title="SOLICITAR REFORÇO" desc="Pedir mais Zubaleros." onClick={() => setSelectedForm("solicitacao_reforco")} />
          </div>
        </div>
      );
    }

    // =========================================================================
    // 4. FORMULÁRIOS RENDERIZADOS (Com Regras de Negócio)
    // =========================================================================
    if (selectedForm) {
      return (
        <div className="px-4 pt-4 pb-20">
          
          {/* 1. PAGAMENTO DE BÔNUS */}
          {selectedForm === "contestacao_bonus" && <ZubaleBonusForm />}
          
          {/* 2. OUVIDORIA / CONDUTA */}
          {selectedForm === "ouvidoria_conduta" && (
            <GenericForm 
                formType="ouvidoria_conduta" 
                title="OUVIDORIA / CONDUTA" 
                description="Canal seguro para denúncias e reportes graves."
                slaMessage="7 dias úteis (Investigação)"
            >
               <div className="space-y-6">
                 <StoreSelect name="loja_relacionada" label="LOJA DO OCORRIDO (OPCIONAL)" />
                 
                 <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                      <ShieldAlert size={14} className="inline mr-1 mb-0.5"/> TIPO DE DENÚNCIA
                    </label>
                    <select name="tipo_denuncia" className="custom-select h-[60px]" required>
                        <option value="">SELECIONE...</option>
                        <option>RECLAMAÇÃO DE LOJA (Tratamento/Erros)</option>
                        <option>ACESSO INDEVIDO A DADOS</option>
                        <option>ENVIO DE TAREFAS DE OUTRO ZUBALERO</option>
                        <option>INFORMAÇÕES INCONSISTENTES NOS PEDIDOS</option>
                        <option>TAREFA FINALIZADA SEM PRESENÇA FÍSICA</option>
                        <option>USO DE FAKE GPS / MANIPULAÇÃO</option>
                        <option>OUTROS</option>
                    </select>
                 </div>

                 <div>
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                     <FileText size={14} className="inline mr-1 mb-0.5"/> RELATO DETALHADO
                   </label>
                   <textarea name="detalhes" placeholder="DESCREVA O QUE ACONTECEU COM O MÁXIMO DE DETALHES (NOMES, HORÁRIOS, PROVAS)..." required className="custom-input min-h-[150px] py-4"/>
                 </div>
               </div>
            </GenericForm>
          )}

          {/* 3. CONTESTAR BLOQUEIO */}
          {selectedForm === "revisao_bloqueio" && (
            <GenericForm 
                formType="revisao_bloqueio" 
                title="CONTESTAR BLOQUEIO" 
                description="Solicite a revisão da suspensão da sua conta."
                slaMessage="5 dias úteis"
            >
               <div className="space-y-6">
                 <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                        <Calendar size={14} className="inline mr-1 mb-0.5"/> DATA DO BLOQUEIO
                    </label>
                    <input type="date" name="data_bloqueio" required className="custom-input"/>
                 </div>
                 <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                        <FileText size={14} className="inline mr-1 mb-0.5"/> JUSTIFICATIVA / DEFESA
                    </label>
                    <textarea name="justificativa" placeholder="POR QUE O BLOQUEIO FOI INDEVIDO? EXPLIQUE..." required className="custom-input min-h-[150px] py-4"/>
                 </div>
               </div>
            </GenericForm>
          )}

          {/* 4. SOLICITAR SAQUE (BLOQUEIO) */}
          {selectedForm === "solicitacao_saque" && (
            <GenericForm 
                formType="solicitacao_saque" 
                title="SOLICITAR SAQUE" 
                description="Transferência de saldo retido (Apenas para contas bloqueadas)."
                slaMessage="10 dias úteis (Processamento Financeiro)"
            >
               <div className="space-y-6">
                 <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                        <Wallet size={14} className="inline mr-1 mb-0.5"/> CHAVE PIX
                    </label>
                    <input name="chave_pix" placeholder="CPF, EMAIL OU CELULAR" required className="custom-input"/>
                 </div>
                 <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                        <User size={14} className="inline mr-1 mb-0.5"/> NOME DO TITULAR DA CONTA
                    </label>
                    <input name="titular_conta" placeholder="NOME COMPLETO (DEVE SER O MESMO DO CADASTRO)" required className="custom-input"/>
                 </div>
                 <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                        <FileText size={14} className="inline mr-1 mb-0.5"/> OBSERVAÇÕES
                    </label>
                    <textarea name="observacoes" placeholder="ALGUMA INFORMAÇÃO ADICIONAL?" className="custom-input min-h-[100px] py-4"/>
                 </div>
               </div>
            </GenericForm>
          )}

          {/* 5. SOLICITAR MATERIAIS */}
          {selectedForm === "solicitacao_materiais" && (
            <GenericForm 
                formType="solicitacao_materiais" 
                title="SOLICITAR MATERIAIS" 
                description="Reposição de itens de trabalho."
                slaMessage="5 a 10 dias úteis (Envio)"
            >
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                <Package size={14} className="inline mr-1 mb-0.5"/> ITEM NECESSÁRIO
              </label>
              
              <select 
                name="item_select" 
                className="custom-select mb-4 h-[60px]" 
                required 
                value={materialSelected}
                onChange={(e) => setMaterialSelected(e.target.value)}
              >
                  <option value="">SELECIONE...</option>
                  <option value="CRACHÁ DE ACESSO">CRACHÁ DE ACESSO</option>
                  <option value="OUTROS">OUTROS (DIGITAR)</option>
              </select>

              {materialSelected === "OUTROS" && (
                <div className="animate-in fade-in slide-in-from-top-2 mb-4">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                     DIGITE O NOME DO ITEM
                   </label>
                   <input name="item_digitado" placeholder="EX: BAG, COLETE..." required className="custom-input"/>
                </div>
              )}
              
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                <FileText size={14} className="inline mr-1 mb-0.5"/> MOTIVO DA SOLICITAÇÃO
              </label>
              <textarea name="motivo" placeholder="EX: PERDI MEU CRACHÁ..." required className="custom-input min-h-[120px] py-4" />
            </GenericForm>
          )}

          {/* === [LOJISTA] BLOQUEIO DE ZUBALERO === */}
          {selectedForm === "bloqueio_zubalero" && (
            <GenericForm formType="bloqueio_zubalero" title="SOLICITAR BLOQUEIO" description="Reporte oficial de conduta.">
               <div className="space-y-6">
                 <StoreSelect name="loja_solicitante" label="SUA LOJA" required />
                 <div><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block"><User size={14} className="inline mr-1 mb-0.5"/> NOME OU ID DO ZUBALERO</label><input name="nome_zubalero" placeholder="NOME DO PARCEIRO" required className="custom-input"/></div>
                 <div><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block"><ShieldAlert size={14} className="inline mr-1 mb-0.5"/> MOTIVO</label><select name="motivo_bloqueio" className="custom-select h-[60px]" required><option value="">SELECIONE...</option><option>COMPORTAMENTO INADEQUADO</option><option>BAIXA PRODUTIVIDADE</option><option>INSUBORDINAÇÃO</option><option>FURTO / SEGURANÇA</option><option>OUTROS</option></select></div>
                 <div><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block"><FileText size={14} className="inline mr-1 mb-0.5"/> DETALHES</label><textarea name="detalhes" placeholder="DESCREVA O OCORRIDO..." required className="custom-input min-h-[150px] py-4"/></div>
               </div>
            </GenericForm>
          )}

          {/* === [LOJISTA] REPORTAR FALTA === */}
          {selectedForm === "reportar_falta_lojista" && (
            <GenericForm formType="reportar_falta_lojista" title="REPORTAR FALTA" description="Informe o não comparecimento de um parceiro.">
               <div className="space-y-6">
                 <StoreSelect name="loja_solicitante" label="SUA LOJA" required />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block"><User size={14} className="inline mr-1 mb-0.5"/> NOME DO ZUBALERO</label><input name="nome_zubalero" placeholder="QUEM FALTOU?" required className="custom-input"/></div>
                    <div><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block"><Calendar size={14} className="inline mr-1 mb-0.5"/> DATA DA FALTA</label><input type="date" name="data_falta" required className="custom-input"/></div>
                 </div>
                 <div><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block"><Users size={14} className="inline mr-1 mb-0.5"/> TURNO</label><select name="turno" className="custom-select h-[60px]" required><option value="">SELECIONE...</option><option>MANHÃ</option><option>TARDE</option><option>NOITE</option><option>INTEGRAL</option></select></div>
               </div>
            </GenericForm>
          )}

          {/* === [LOJISTA] SOLICITAR REFORÇO === */}
          {selectedForm === "solicitacao_reforco" && (
            <GenericForm formType="solicitacao_reforco" title="SOLICITAR REFORÇO" description="Peça mais parceiros para dias de alto movimento.">
               <div className="space-y-6">
                 <StoreSelect name="loja_solicitante" label="SUA LOJA" required />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block"><Calendar size={14} className="inline mr-1 mb-0.5"/> DATA</label><input type="date" name="data_reforco" required className="custom-input"/></div>
                   <div><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block"><Users size={14} className="inline mr-1 mb-0.5"/> QTD.</label><input type="number" name="qtd_pessoas" placeholder="EX: 2" min="1" max="10" required className="custom-input"/></div>
                 </div>
                 <div><label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block"><Megaphone size={14} className="inline mr-1 mb-0.5"/> MOTIVO</label><select name="motivo_reforco" className="custom-select h-[60px]" required><option value="">SELECIONE...</option><option>AUMENTO DE DEMANDA</option><option>FALTA DE EQUIPE INTERNA</option><option>PROMOÇÃO / EVENTO</option></select></div>
               </div>
            </GenericForm>
          )}

        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Header showBack={view !== "home"} onBack={goBack} />
      <main className="max-w-5xl mx-auto">
        {renderContent()}
      </main>
    </div>
  );
}

// -----------------------------------------------------------------------------
// COMPONENTES DE VISUAL (PADRÃO ZUBALE)
// -----------------------------------------------------------------------------

function ProfileCard({ icon, title, desc, color, onClick }: any) {
  const isBlue = color === "blue";
  return (
    <button onClick={onClick} className="group relative overflow-hidden bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border-2 border-transparent hover:border-slate-200 transition-all duration-300 text-left w-full hover:-translate-y-1">
      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 shadow-lg ${isBlue ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-emerald-500 text-white shadow-emerald-200'}`}>{icon}</div>
      <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-3 italic uppercase tracking-tight">{title}</h3>
      <p className="text-slate-500 font-bold text-sm leading-relaxed mb-6">{desc}</p>
      <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-slate-50 w-fit px-4 py-2 rounded-full ${isBlue ? 'text-blue-600' : 'text-emerald-600'}`}>ACESSAR PORTAL <ChevronRight size={14} strokeWidth={4} /></div>
    </button>
  );
}

function MenuOption({ icon, title, desc, iconBg, onClick }: any) {
  return (
    <button onClick={onClick} className="w-full bg-white p-6 rounded-[2rem] shadow-lg border-2 border-transparent hover:border-blue-300 hover:shadow-xl transition-all flex items-center justify-between group text-left">
      <div className="flex items-center gap-6">
        <div className={`p-4 rounded-2xl shadow-md ${iconBg} group-hover:scale-110 transition-transform`}>{icon}</div>
        <div><h4 className="font-black text-slate-800 text-lg md:text-xl uppercase italic tracking-tight">{title}</h4><p className="text-slate-400 font-bold text-xs mt-1">{desc}</p></div>
      </div>
      <div className="bg-slate-50 p-3 rounded-full text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors"><ChevronRight size={24} strokeWidth={3} /></div>
    </button>
  );
}