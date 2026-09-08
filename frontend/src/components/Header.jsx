function Header({ running }) {
  return (
    <header className="text-center animate-[fadeIn_0.5s_ease-out]">
      <div className="inline-flex items-center gap-2.5 rounded-full border border-[#f3eee1]/[0.1] bg-[#f3eee1]/[0.03] px-4 py-1.5 text-xs font-medium text-[#c9c2ae] shadow-sm transition-all">
        <span
          className={`h-2 w-2 rounded-full transition-all duration-500 ${
            running
              ? "bg-[#83ab8f] shadow-[0_0_10px_rgba(131,171,143,0.6)] animate-pulse"
              : "bg-[#4a5262]"
          }`}
        />
        {running ? "Assistant online" : "Assistant offline"}
      </div>

      <h1 className="mt-5 font-serif text-3xl font-medium tracking-tight text-[#f3eee1] sm:text-5xl">
        A Voice You Can Interrupt
      </h1>

      <p className="mx-auto mt-3 max-w-xl text-sm text-[#8d95a3]">
        Speak naturally. Change your mind anytime.
      </p>
    </header>
  );
}

export default Header;