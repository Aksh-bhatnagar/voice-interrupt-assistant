function VoiceOrb({ status }) {
  const isListening = status === "listening";
  const isThinking = status === "thinking";
  const isSpeaking = status === "speaking";
  const isInterrupted = status === "interrupted";

  const label = isInterrupted ? "Interrupted"
    : isListening ? "Listening"
    : isThinking ? "Thinking"
    : isSpeaking ? "Speaking"
    : "Ready";

  return (
    <div className="relative flex h-[220px] items-center justify-center pt-4">
      {/* Ambient glow - Shrunk to prevent bleed */}
      <div
        className={`absolute h-36 w-36 rounded-full blur-3xl transition-all duration-700 ${
          isInterrupted ? "bg-red-500/25"
            : isListening ? "bg-cyan-400/25"
            : isThinking ? "bg-violet-400/20"
            : isSpeaking ? "bg-blue-500/25"
            : "bg-indigo-500/10"
        }`}
      />

      {/* Outer rings - Tighter diameter */}
      <div
        className={`absolute h-40 w-40 rounded-full border border-white/5 ${
          isListening || isSpeaking ? "animate-ping opacity-20" : "opacity-40"
        }`}
      />
      <div
        className={`absolute h-32 w-32 rounded-full border border-white/10 ${
          isListening ? "animate-[pulse_1.2s_ease-in-out_infinite]" : ""
        }`}
      />

      {/* Main orb - Reduced from 36 (144px) to 28 (112px) */}
      <div
        className={`relative flex h-28 w-28 items-center justify-center rounded-full border border-white/20 shadow-xl transition-all duration-500 ${
          isInterrupted ? "bg-gradient-to-br from-red-500/70 via-rose-500/40 to-orange-400/30 shadow-red-500/30"
            : isListening ? "bg-gradient-to-br from-cyan-400/70 via-blue-500/50 to-violet-500/50 shadow-cyan-400/30"
            : isThinking ? "bg-gradient-to-br from-violet-500/60 via-indigo-500/50 to-blue-500/40 shadow-violet-500/30"
            : isSpeaking ? "bg-gradient-to-br from-blue-400/70 via-violet-500/60 to-fuchsia-500/40 shadow-blue-500/40"
            : "bg-gradient-to-br from-slate-700/60 via-indigo-500/20 to-slate-800/60"
        }`}
      >
        <div className="flex h-10 items-center gap-[3px]">
          {[2, 5, 8, 12, 16, 11, 7, 4, 2].map((height, index) => (
            <span
              key={index}
              className={`w-[3px] rounded-full bg-white/90 ${
                isListening || isSpeaking ? "animate-[wave_0.9s_ease-in-out_infinite]" : ""
              }`}
              style={{
                height: `${height * 1.5}px`,
                animationDelay: `${index * 80}ms`,
              }}
            />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-1.5 rounded-full bg-gradient-to-br from-white/15 via-transparent to-transparent" />
      </div>

      <div className="absolute bottom-1 text-center">
        <div
          className={`text-[13px] font-medium ${
            isInterrupted ? "text-red-300"
              : isListening ? "text-cyan-300"
              : isThinking ? "text-violet-300"
              : isSpeaking ? "text-blue-300"
              : "text-slate-400"
          }`}
        >
          {label}
        </div>
        <div className="mt-0.5 text-[11px] text-slate-500">
          {isInterrupted ? "Listening to you..."
            : isListening ? "Speak naturally"
            : isThinking ? "Finding the best answer..."
            : isSpeaking ? "You can interrupt me"
            : "Ready when you are"}
        </div>
      </div>
    </div>
  );
}

export default VoiceOrb;