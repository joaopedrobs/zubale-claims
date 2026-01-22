import { ArrowLeft, ShieldCheck } from "lucide-react";

interface HeaderProps {
  onBack?: () => void;
  showBack?: boolean;
}

export default function Header({ onBack, showBack }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60 supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        
        <div className="flex items-center gap-4">
          {showBack && (
            <button 
              onClick={onBack} 
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <img src="/logo_zubale.png" alt="Zubale" className="h-6 w-auto" />
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">Ambiente Seguro</span>
        </div>

      </div>
    </header>
  );
}