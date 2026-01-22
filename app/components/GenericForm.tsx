"use client";

import { useState, useActionState, useRef } from "react";
import { submitForm, type FormState } from "@/app/actions";
import { Loader2, AlertCircle, CheckCircle2, Paperclip, Plus, Copy } from "lucide-react";

interface GenericFormProps {
  formType: string;
  title: string;
  description: string;
  slaMessage?: string; // Prop opcional para definir o prazo de retorno
  children?: React.ReactNode;
}

export default function GenericForm({ formType, title, description, slaMessage = "5 dias úteis", children }: GenericFormProps) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(submitForm, null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)].slice(0, 5));
  };

  if (state?.success) {
    return (
      <div className="card-zubale text-center animate-in zoom-in duration-500">
        <CheckCircle2 size={70} className="mx-auto text-emerald-500 mb-8" />
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 italic">Solicitação Recebida!</h2>
        
        <div className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 mb-8 max-w-md mx-auto">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Seu Protocolo</p>
          <div className="flex items-center justify-center gap-3">
             <span className="text-xl md:text-3xl font-black text-slate-800 tracking-tight font-mono">{state.protocolo}</span>
             <button onClick={() => navigator.clipboard.writeText(state.protocolo || "")} className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 hover:text-blue-600 transition-colors">
                <Copy size={20}/>
             </button>
          </div>
        </div>

        <p className="text-slate-500 font-medium mb-8 text-lg">
            Nossa equipe analisará sua solicitação.<br/>
            Prazo estimado de retorno: <strong className="text-slate-900">{slaMessage}</strong>.
        </p>

        <button onClick={() => window.location.reload()} className="btn-zubale bg-slate-900 hover:bg-slate-800 shadow-slate-200">Voltar ao Início</button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* TÍTULO DA PÁGINA (Padronizado) */}
      <div className="text-center mb-10 px-4">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 italic uppercase tracking-tight leading-tight">
          {title}
        </h1>
        <p className="text-slate-500 font-bold text-lg max-w-2xl mx-auto">{description}</p>
      </div>

      <form action={(formData) => {
          selectedFiles.forEach(file => formData.append("evidencias_files", file));
          formData.append("form_type", formType);
          formAction(formData);
        }} className="card-zubale space-y-10">
        
        {/* 01. IDENTIFICAÇÃO */}
        <div className="space-y-6">
            <SectionHeader number="01" title="SUA IDENTIFICAÇÃO" subtitle="Dados para contato e registro" />
            <div className="space-y-4">
                <input name="nome" placeholder="NOME COMPLETO" required className="custom-input" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="telefone" placeholder="TELEFONE (ZAP)" required className="custom-input" inputMode="numeric" />
                    <input name="email" type="email" placeholder="E-MAIL DE CADASTRO" required className="custom-input" />
                </div>
            </div>
        </div>

        {/* 02. DETALHES (Campos Específicos Injetados) */}
        <div className="space-y-6 pt-8 border-t border-slate-100">
            <SectionHeader number="02" title="DADOS DA SOLICITAÇÃO" subtitle="Preencha os detalhes abaixo" />
            {children}
        </div>

        {/* 03. EVIDÊNCIAS */}
        <div className="space-y-6 pt-8 border-t border-slate-100">
            <SectionHeader number="03" title="EVIDÊNCIAS" subtitle="Anexe fotos ou documentos (Opcional)" />
            <div className="grid grid-cols-1 gap-3">
                {selectedFiles.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-2xl animate-in zoom-in">
                        <span className="text-sm font-bold text-blue-700 truncate">{file.name}</span>
                    </div>
                ))}
                <label className="flex items-center justify-center gap-3 p-5 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group">
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} ref={fileInputRef} />
                    <div className="bg-slate-100 p-2 rounded-full group-hover:bg-blue-100 text-slate-400 group-hover:text-blue-600 transition-colors"><Plus size={20}/></div> 
                    <span className="text-sm font-black text-slate-500 uppercase tracking-widest group-hover:text-blue-600">Anexar Arquivo</span>
                </label>
            </div>
        </div>

        {state?.error && (
            <div className="p-5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 font-bold animate-in slide-in-from-top-2">
                <AlertCircle size={24} /> {state.error}
            </div>
        )}

        <button type="submit" disabled={isPending} className="btn-zubale">
            {isPending ? <Loader2 className="animate-spin" size={24} /> : "ENVIAR SOLICITAÇÃO"}
        </button>
      </form>
    </div>
  );
}

// Helper para manter consistência visual (Mesmo do BonusForm)
function SectionHeader({ number, title, subtitle }: any) {
  return (
    <div className="flex items-start gap-4 mb-2">
      <span className="bg-slate-900 text-white text-[12px] font-black w-8 h-8 flex items-center justify-center rounded-xl shadow-md shrink-0 mt-1">{number}</span>
      <div>
        <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight italic leading-none">{title}</h3>
        <p className="text-sm font-bold text-slate-400 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}