function HelpModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/10 bg-[#080B16] shadow-[0_20px_80px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
              Quick Guide
            </p>

            <h2 className="mt-1 text-xl font-semibold text-white">
              How to use
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Close instructions"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 px-6 py-6">
          {/* Step 1 */}
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-xs font-bold text-cyan-300">
                1
              </span>

              <h3 className="text-sm font-semibold text-white">
                Ask about the college
              </h3>
            </div>

            <p className="mt-2 pl-10 text-[13px] leading-relaxed text-slate-400">
              This assistant answers questions using the college knowledge
              base.
            </p>

            <div className="mt-3 grid gap-2 pl-10">
              {[
                "What facilities are available in the hostel?",
                "What are the hostel fees?",
                "What scholarships are available?",
                "What are the admission requirements?",
              ].map((question) => (
                <div
                  key={question}
                  className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-xs text-slate-300"
                >
                  “{question}”
                </div>
              ))}
            </div>
          </div>

          {/* Step 2 */}
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-bold text-violet-300">
                2
              </span>

              <h3 className="text-sm font-semibold text-white">
                Try interrupting
              </h3>
            </div>

            <p className="mt-2 pl-10 text-[13px] leading-relaxed text-slate-400">
              Ask a question and let the assistant start answering. While it
              is speaking, start talking with another question. The assistant
              will stop its current response and listen to you.
            </p>

            <div className="mt-3 ml-10 rounded-xl border border-violet-500/10 bg-violet-500/5 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-300">
                Try this
              </p>

              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                “What facilities are available in the hostel?”
              </p>

              <p className="mt-2 text-[11px] text-slate-500">
                Interrupt while it speaks:
              </p>

              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                “What are the hostel fees?”
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-xs font-bold text-blue-300">
                3
              </span>

              <h3 className="text-sm font-semibold text-white">
                Test grounded answers
              </h3>
            </div>

            <p className="mt-2 pl-10 text-[13px] leading-relaxed text-slate-400">
              Ask something that is not mentioned in the knowledge base.
              The assistant should tell you when the information is not
              available instead of making it up.
            </p>

            <div className="mt-3 ml-10 rounded-xl border border-blue-500/10 bg-blue-500/5 px-3 py-2 text-xs text-slate-300">
              “Does the college have a swimming pool?”
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-6 py-4">
          <p className="text-center text-[11px] tracking-wide text-slate-500">
            Speak naturally. You can change your mind and interrupt at any
            time.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HelpModal;