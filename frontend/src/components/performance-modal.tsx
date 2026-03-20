"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type PerformanceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  newTierName: string;
};

export function PerformanceTierModal({ isOpen, onClose, newTierName }: PerformanceModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
    } else {
      const timer = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !show) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative overflow-hidden rounded-3xl bg-slate-900/95 p-8 text-center text-white shadow-2xl backdrop-blur-xl border border-white/10 ring-1 ring-white/10 w-full max-w-sm mx-auto transition-transform duration-300 ${isOpen ? "scale-100" : "scale-95"}`}>
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-fuchsia-500 blur-[100px] opacity-40 rounded-full mix-blend-screen pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-cyan-500 blur-[100px] opacity-40 rounded-full mix-blend-screen pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="relative h-32 w-32 drop-shadow-2xl">
            <Image
              src="/honey%20badger%20transparent.png"
              alt="Mascot celebrating"
              fill
              className="object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]"
            />
          </div>

          <div className="grid gap-2">
            <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
              축하합니다!
            </h2>
            <p className="text-sm font-medium text-slate-300">
              새로운 실적 구간을 달성하셨습니다.
            </p>
          </div>

          <div className="w-full rounded-2xl bg-white/5 border border-white/10 p-5 mt-2 backdrop-blur-md">
            <p className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-1">
              New Tier
            </p>
            <p className="text-2xl font-black tracking-tight text-white drop-shadow-md">
              {newTierName}
            </p>
          </div>

          <button
            onClick={onClose}
            className="mt-4 w-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 py-3.5 text-sm font-bold text-white shadow-[0_0_40px_rgba(6,182,212,0.5)] transition hover:shadow-[0_0_60px_rgba(99,102,241,0.6)] hover:scale-[1.02] active:scale-95 ring-1 ring-white/20 outline-none"
          >
            새로운 혜택 확인하러 가기
          </button>
        </div>
      </div>
    </div>
  );
}
