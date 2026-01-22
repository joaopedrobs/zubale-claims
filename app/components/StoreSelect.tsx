"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, Building2, Loader2 } from "lucide-react";

interface StoreSelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export default function StoreSelect({ name, label = "LOJA", placeholder = "BUSCAR LOJA...", required = false }: StoreSelectProps) {
  const [stores, setStores] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchStores() {
      try {
        const res = await fetch("/api/stores");
        if (res.ok) {
          const data = await res.json();
          setStores(Array.isArray(data) ? data : []);
        }
      } catch (error) { console.error(error); } finally { setLoading(false); }
    }
    fetchStores();
    
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-full relative" ref={dropdownRef}>
      <div 
        className="relative flex items-center cursor-pointer"
        onClick={() => !loading && setIsOpen(true)}
      >
        <input 
          type="text" 
          name={name}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
          placeholder={loading ? "CARREGANDO..." : placeholder}
          className="custom-input uppercase pr-12 cursor-pointer"
          autoComplete="off"
          required={required}
        />
        <div className="absolute right-4 text-slate-400 pointer-events-none">
          {loading ? <Loader2 size={24} className="animate-spin"/> : <ChevronDown size={24} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />}
        </div>
      </div>

      {isOpen && stores.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-slate-100 rounded-2xl shadow-2xl max-h-[300px] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
          {stores.filter(s => s.toLowerCase().includes(search.toLowerCase())).map((loja, i) => (
            <div 
              key={i} 
              className="px-6 py-4 hover:bg-blue-50 cursor-pointer text-sm font-bold text-slate-700 border-b border-slate-50 last:border-none uppercase flex items-center gap-3 transition-colors"
              onClick={() => { setSearch(loja); setIsOpen(false); }}
            >
              <Building2 size={18} className="text-slate-300" /> {loja}
            </div>
          ))}
          {stores.filter(s => s.toLowerCase().includes(search.toLowerCase())).length === 0 && (
            <div className="p-4 text-center text-xs font-bold text-slate-400 uppercase">Nenhuma loja encontrada</div>
          )}
        </div>
      )}
    </div>
  );
}