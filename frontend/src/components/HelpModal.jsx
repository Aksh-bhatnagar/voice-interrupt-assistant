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
      <div className="w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-[#f3eee1]/[0.1] bg-[#161d26] shadow-[0_20px_80px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#f3eee1]/[0.08] px-6 py-5">
          <h2 className="font-serif text-xl font-medium text-[#f3eee1]">
            How to use
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#f3eee1]/[0.1] text-lg text-[#8d95a3] transition hover:border-[#c79a4f]/40 hover:text-[#f3eee1]"
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
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#c79a4f]/[0.12] text-xs font-semibold text-[#dcb571]">
                1
              </span>

              <h3 className="text-sm font-semibold text-[#f3eee1]">
                Ask about the college
              </h3>
            </div>

            <p className="mt-2 pl-10 text-[13px] leading-relaxed text-[#8d95a3]">
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
                  className="rounded-xl border border-[#f3eee1]/[0.06] bg-[#f3eee1]/[0.02] px-3 py-2 text-xs text-[#c9c2ae]"
                >
                  "{question}"
                </div>
              ))}
            </div>
          </div>

          {/* Step 2 */}
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#c79a4f]/[0.12] text-xs font-semibold text-[#dcb571]">
                2
              </span>

              <h3 className="text-sm font-semibold text-[#f3eee1]">
                Try interrupting
              </h3>
            </div>

            <p className="mt-2 pl-10 text-[13px] leading-relaxed text-[#8d95a3]">
              Ask a question and let the assistant start answering. While it
              is speaking, start talking with another question. The assistant
              will stop its current response and listen to you.
            </p>

            <div className="mt-3 ml-10 rounded-xl border border-[#c79a4f]/20 bg-[#c79a4f]/[0.05] p-3">
              <p className="text-[11px] font-semibold text-[#dcb571]">
                Try this
              </p>

              <p className="mt-2 text-xs leading-relaxed text-[#c9c2ae]">
                "What facilities are available in the hostel?"
              </p>

              <p className="mt-2 text-[11px] text-[#6f7684]">
                Interrupt while it speaks:
              </p>

              <p className="mt-1 text-xs leading-relaxed text-[#c9c2ae]">
                "What are the hostel fees?"
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#c79a4f]/[0.12] text-xs font-semibold text-[#dcb571]">
                3
              </span>

              <h3 className="text-sm font-semibold text-[#f3eee1]">
                Test grounded answers
              </h3>
            </div>

            <p className="mt-2 pl-10 text-[13px] leading-relaxed text-[#8d95a3]">
              Ask something that is not mentioned in the knowledge base. The
              assistant should tell you when the information is not available
              instead of making it up.
            </p>

            <div className="mt-3 ml-10 rounded-xl border border-[#c1652f]/20 bg-[#c1652f]/[0.06] px-3 py-2 text-xs text-[#c9c2ae]">
              "Does the college have a swimming pool?"
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#f3eee1]/[0.08] px-6 py-4">
          <p className="text-center text-[11px] text-[#6f7684]">
            Speak naturally. You can change your mind and interrupt at any
            time.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HelpModal;