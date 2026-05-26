function Header() {
  return (
    <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">

      <div>
        <h1 className="text-2xl font-bold">
          AI RAG Dashboard
        </h1>

        <p className="text-slate-400 text-sm mt-1">
          Upload documents and ask AI questions
        </p>
      </div>

    </div>
  );
}

export default Header;