function VoiceOrb({ status }) {
  const isListening = status === "listening";
  const isThinking = status === "thinking";
  const isSpeaking = status === "speaking";
  const isInterrupted = status === "interrupted";

  const label = isInterrupted
    ? "Interrupted"
    : isListening
      ? "Listening"
      : isThinking
        ? "Thinking"
        : isSpeaking
          ? "Speaking"
          : "Ready";

  return (
    <div className="relative flex h-[220px] items-center justify-center pt-4">
      {/* Ambient glow */}
      <div
        className={`absolute h-36 w-36 rounded-full blur-3xl transition-all duration-700 ${
          isInterrupted
            ? "bg-[#c1652f]/25"
            : isListening
              ? "bg-[#c79a4f]/25"
              : isThinking
                ? "bg-[#a8965a]/20"
                : isSpeaking
                  ? "bg-[#8c6a34]/30"
                  : "bg-[#3a4250]/15"
        }`}
      />

      {/* Outer rings */}
      <div
        className={`absolute h-40 w-40 rounded-full border border-[#f3eee1]/[0.06] ${
          isListening || isSpeaking ? "animate-ping opacity-20" : "opacity-40"
        }`}
      />
      <div
        className={`absolute h-32 w-32 rounded-full border border-[#f3eee1]/[0.1] ${
          isListening ? "animate-[pulse_1.2s_ease-in-out_infinite]" : ""
        }`}
      />

      {/* Main orb */}
      <div
        className={`relative flex h-28 w-28 items-center justify-center rounded-full border border-[#f3eee1]/20 shadow-xl transition-all duration-500 ${
          isInterrupted
            ? "bg-gradient-to-br from-[#c1652f]/70 via-[#a8562a]/45 to-[#8c4620]/30 shadow-[#c1652f]/25"
            : isListening
              ? "bg-gradient-to-br from-[#c79a4f]/70 via-[#b98a3d]/50 to-[#8c6a34]/40 shadow-[#c79a4f]/25"
              : isThinking
                ? "bg-gradient-to-br from-[#a8965a]/60 via-[#8c7a48]/45 to-[#6b5c37]/35 shadow-[#a8965a]/20"
                : isSpeaking
                  ? "bg-gradient-to-br from-[#c79a4f]/70 via-[#8c6a34]/55 to-[#6b4f27]/45 shadow-[#8c6a34]/30"
                  : "bg-gradient-to-br from-[#232b36]/70 via-[#1c232c]/40 to-[#161d26]/70"
        }`}
      >
        <div className="flex h-10 items-center gap-[3px]">
          {[2, 5, 8, 12, 16, 11, 7, 4, 2].map((height, index) => (
            <span
              key={index}
              className={`w-[3px] rounded-full bg-[#f3eee1]/90 ${
                isListening || isSpeaking
                  ? "animate-[wave_0.9s_ease-in-out_infinite]"
                  : ""
              }`}
              style={{
                height: `${height * 1.5}px`,
                animationDelay: `${index * 80}ms`,
              }}
            />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-1.5 rounded-full bg-gradient-to-br from-[#f3eee1]/[0.12] via-transparent to-transparent" />
      </div>

      <div className="absolute bottom-1 text-center">
        <div
          className={`font-serif text-[15px] ${
            isInterrupted
              ? "text-[#d98a5c]"
              : isListening
                ? "text-[#dcb571]"
                : isThinking
                  ? "text-[#c3b285]"
                  : isSpeaking
                    ? "text-[#dcb571]"
                    : "text-[#8d95a3]"
          }`}
        >
          {label}
        </div>
        <div className="mt-0.5 text-[11px] text-[#6f7684]">
          {isInterrupted
            ? "Listening to you..."
            : isListening
              ? "Speak naturally"
              : isThinking
                ? "Finding the best answer..."
                : isSpeaking
                  ? "You can interrupt me"
                  : "Ready when you are"}
        </div>
      </div>
    </div>
  );
}

export default VoiceOrb;