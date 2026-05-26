import { useState } from "react";
import { UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";
import API from "../services/api";
import toast from "react-hot-toast";

function UploadSection() {
  const [loading, setLoading] = useState(false);

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const res = await API.post("/upload", formData);

      toast.success(res.data.message);

    } catch (err) {
      toast.error(err.response?.data?.detail || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
    },
  });

  return (
    <div className="bg-slate-900 rounded-2xl p-5 h-full border border-slate-800">

      <h2 className="text-xl font-semibold mb-4">
        Upload Document
      </h2>

      <div
        {...getRootProps()}
        className="border-2 border-dashed border-slate-700 rounded-2xl p-10 text-center cursor-pointer hover:border-blue-500 transition"
      >
        <input {...getInputProps()} />

        <UploadCloud className="mx-auto mb-4 text-blue-500" size={50} />

        <p className="text-slate-300">
          Drag & Drop PDF/Image
        </p>

        <p className="text-sm text-slate-500 mt-2">
          PDF, PNG, JPG, WEBP
        </p>

      </div>

      {loading && (
        <div className="mt-4 text-blue-400">
          Uploading & Processing...
        </div>
      )}

    </div>
  );
}

export default UploadSection;