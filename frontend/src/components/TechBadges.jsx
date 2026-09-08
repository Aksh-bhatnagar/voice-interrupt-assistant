function TechBadges() {
  return (
    <p className="mx-auto max-w-md text-center text-[13px] leading-relaxed text-[#6f7684]">
      Speech is picked up with <span className="text-[#8d95a3]">Silero VAD</span> and
      transcribed by <span className="text-[#8d95a3]">Groq Whisper</span>. Answers
      come from <span className="text-[#8d95a3]">Groq</span>, grounded in the
      college's own catalog through retrieval, and can be interrupted mid-reply.
    </p>
  );
}

export default TechBadges;