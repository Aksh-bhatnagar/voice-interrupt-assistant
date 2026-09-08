function Header({ running }) {
  return (
    <header className="text-center animate-[fadeIn_0.5s_ease-out]">
      <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 shadow-sm backdrop-blur-md transition-all">
        <span
          className={`h-2 w-2 rounded-full transition-all duration-500 ${
            running ? "bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse" : "bg-slate-600"
          }`}
        />
        {running ? "Assistant Online" : "Assistant Offline"}
      </div>
      
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl drop-shadow-sm">
        A Voice You Can{" "}
        <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent drop-shadow-lg">
          Interrupt
        </span>
      </h1>
      
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400 font-light">
        Speak naturally. Change your mind anytime.
      </p>
    </header>
  );
}

export default Header;