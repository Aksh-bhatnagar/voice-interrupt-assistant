function TechBadges() {
  const technologies = [
    "Silero VAD",
    "Groq Whisper",
    "Groq LLM",
    "RAG",
    "Barge-in",
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2.5">
      {technologies.map((item) => (
        <span
          key={item}
          className="cursor-default rounded-lg border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium tracking-wide text-slate-400 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-slate-200"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default TechBadges;  