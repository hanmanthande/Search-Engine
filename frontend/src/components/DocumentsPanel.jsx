import { useEffect, useState } from "react";
import API from "../services/api";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

function DocumentsPanel() {
  const [documents, setDocuments] = useState([]);

  const fetchDocuments = async () => {
    try {
      const res = await API.get("/documents");
      setDocuments(res.data.documents);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const deleteDocument = async (id) => {
    try {
      await API.delete(`/documents/${id}`);

      toast.success("Deleted");

      fetchDocuments();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 h-full p-5 overflow-y-auto">

      <h2 className="text-xl font-semibold mb-5">
        Documents
      </h2>

      <div className="space-y-4">

        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-slate-800 p-4 rounded-xl"
          >

            <div className="flex justify-between items-start">

              <div>
                <div className="font-medium">
                  {doc.filename}
                </div>

                <div className="text-sm text-slate-400 mt-1">
                  {doc.chunk_count} chunks
                </div>
              </div>

              <button
                onClick={() => deleteDocument(doc.id)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 size={18} />
              </button>

            </div>

          </div>
        ))}

      </div>
    </div>
  );
}

export default DocumentsPanel;