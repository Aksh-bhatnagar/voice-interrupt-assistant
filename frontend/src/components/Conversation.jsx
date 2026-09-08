import { useEffect, useRef, useState } from "react";

function Conversation({
  transcript,
  answer,
  answerDuration = null,
  revealAnswer = false,
}) {
  const [displayedAnswer, setDisplayedAnswer] = useState("");
  const intervalRef = useRef(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!answer) {
      setDisplayedAnswer("");
      return;
    }

    /*
     * If revealAnswer is false, keep the answer hidden.
     * This happens while TTS is still being generated.
     */
    if (!revealAnswer) {
      setDisplayedAnswer("");
      return;
    }

    let i = 0;

    /*
     * Match the typewriter speed approximately to the
     * actual generated TTS duration.
     */
    const duration =
      answerDuration && answerDuration > 0
        ? answerDuration * 1000
        : Math.max(answer.length * 30, 1000);

    const typingSpeed =
      Math.max(15, duration / answer.length);

    setDisplayedAnswer("");

    intervalRef.current = setInterval(() => {
      i += 1;

      setDisplayedAnswer(answer.slice(0, i));

      if (i >= answer.length) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, typingSpeed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [answer, answerDuration, revealAnswer]);

  if (!transcript && !answer) {
    return (
      <div className="flex min-h-[100px] items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.01] transition-all hover:bg-white/[0.02]">
        <div className="text-center">
          <p className="text-[13px] font-medium tracking-wide text-slate-500">
            Ask me anything about the college
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* User Message */}
      {transcript && (
        <div className="rounded-[1.5rem] rounded-tr-sm border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur-sm transition-all animate-[slideIn_0.3s_ease-out]">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            You
          </div>

          <p className="text-[14px] leading-relaxed text-slate-100">
            {transcript}
          </p>
        </div>
      )}

      {/* Assistant Message */}
      {answer && (
        <div className="rounded-[1.5rem] rounded-tl-sm border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-violet-500/10 p-4 shadow-[0_4px_24px_-8px_rgba(59,130,246,0.2)] backdrop-blur-sm transition-all animate-[slideIn_0.4s_ease-out]">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-300">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
            Assistant
          </div>

          <p className="whitespace-pre-line text-[14px] leading-relaxed text-slate-100">
            {displayedAnswer}

            {revealAnswer &&
              displayedAnswer.length < answer.length && (
                <span className="ml-1 inline-block h-3.5 w-1.5 animate-pulse bg-blue-400 align-middle opacity-80" />
              )}
          </p>
        </div>
      )}
    </div>
  );
}

export default Conversation;