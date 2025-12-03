export default function Test() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-zinc-900 text-white p-12">
      <h1 className="text-4xl font-bold text-blue-400 mb-4">Tailwind Test</h1>
      <div className="bg-blue-500/30 p-6 rounded-xl border border-blue-500/50 backdrop-blur">
        If you can see this styled nicely with blue colors and blur effects, Tailwind is working!
      </div>
      <div className="mt-8 relative">
        <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl" />
        <div className="relative bg-slate-800 p-6 rounded-2xl border border-blue-500/30">
          This should have a glowing effect
        </div>
      </div>
    </div>
  );
}