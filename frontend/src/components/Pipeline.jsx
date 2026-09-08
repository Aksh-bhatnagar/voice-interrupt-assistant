const stages = ["MIC", "VAD", "STT", "RAG", "LLM", "TTS"];

function Pipeline({ status }) {
  const activeStage =
    status === "listening" ? "VAD"
      : status === "transcribing" ? "STT"
      : status === "thinking" ? "LLM"
      : status === "speaking" ? "TTS"
      : null;

  return (
    <div className="mt-6 flex justify-center">
      <div className="inline-flex items-center gap-1 rounded-2xl border border-white/5 bg-black/40 p-1.5 shadow-inner backdrop-blur-xl">
        {stages.map((stage, index) => (
          <div key={stage} className="flex items-center">
            <span
              className={`rounded-xl px-3 py-1.5 text-[10px] font-bold tracking-widest transition-all duration-300 ${
                activeStage === stage
                  ? "bg-white/10 text-cyan-300 shadow-sm"
                  : "text-slate-500 opacity-60"
              }`}
            >
              {stage}
            </span>
            {index < stages.length - 1 && (
              <span className="mx-1 text-slate-700/50">›</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Pipeline;