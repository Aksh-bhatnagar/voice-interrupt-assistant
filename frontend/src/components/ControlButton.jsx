function ControlButton({ running, onStart, onStop }) {
  if (!running) {
    return (
      <button
        onClick={onStart}
        className="group relative flex items-center justify-center overflow-hidden rounded-full bg-white px-8 py-4 text-[15px] font-bold text-slate-900 shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all duration-300 hover:scale-105 hover:bg-slate-50 hover:shadow-[0_0_60px_rgba(255,255,255,0.25)] active:scale-95"
      >
        <span className="relative z-10 flex items-center gap-3">
          <svg className="h-5 w-5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
          Start Conversation
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onStop}
      className="group flex items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 px-8 py-4 text-[15px] font-bold text-red-400 transition-all duration-300 hover:border-red-400/50 hover:bg-red-500/20 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] active:scale-95"
    >
      <span className="flex items-center gap-3">
        <svg className="h-5 w-5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>
        Stop Assistant
      </span>
    </button>
  );
}

export default ControlButton;