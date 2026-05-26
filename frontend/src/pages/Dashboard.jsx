import Sidebar from "../components/Sidebar";
import UploadSection from "../components/UploadSection";
import RagChat from "../components/RagChat";
import DocumentsPanel from "../components/DocumentsPanel";
import Header from "../components/Header";

function Dashboard() {
  return (
    <div className="flex h-screen bg-slate-950 text-white">

      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">

        <Header />

        <div className="grid grid-cols-12 gap-4 p-4 flex-1 overflow-hidden">

          <div className="col-span-3">
            <UploadSection />
          </div>

          <div className="col-span-6">
            <RagChat />
          </div>

          <div className="col-span-3">
            <DocumentsPanel />
          </div>

        </div>

      </div>
    </div>
  );
}

export default Dashboard;