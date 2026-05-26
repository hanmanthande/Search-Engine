import { FileText, MessageSquareText } from "lucide-react";

function Sidebar() {
  return (
    <div className="w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 gap-6">

      <div className="text-2xl font-bold text-blue-500">
        AI
      </div>

      <button className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700">
        <FileText />
      </button>

      <button className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500">
        <MessageSquareText />
      </button>

    </div>
  );
}

export default Sidebar;