import { useState, useRef } from "react";
import { Upload, FileText, X, CheckCircle, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { api, ProcessResult, UploadResult } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const UploadBills = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [processResult, setProcessResult] = useState<ProcessResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { mutate: upload, isPending } = useMutation({
    mutationFn: async () => {
      const uploadRes = await api.uploadBills(files);
      const processRes = await api.processBills();
      return { uploadRes, processRes };
    },
    onSuccess: async ({ uploadRes, processRes }) => {
      setUploadResult(uploadRes);
      setProcessResult(processRes);
      setFiles([]);
      await queryClient.invalidateQueries({ refetchType: "all" });
      toast({
        title: "Bills uploaded successfully",
        description: uploadRes.catalogMode === "full"
          ? `Parsed ${uploadRes.parsedRows} rows. Uploaded catalog is now active across analytics, stock, and billing pages.`
          : `Parsed ${uploadRes.parsedRows} rows. Analytics are active, but stock and billing remain in limited mode because product inventory columns were not present.`,
      });
    },
    onError: (err: Error) => {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    },
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <DashboardLayout>
      <DashboardHeader userName="Distributor" />

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-2">Upload Your Bills</h1>
        <p className="text-muted-foreground mb-2">Compatible file types: CSV, XLSX, XLS, TXT</p>
        <p className="text-sm text-muted-foreground mb-8">
          For full website support, use the enriched CSV header with Product ID, Product Name, Supplier, Unit Sale Price, Cost Price, Current Stock Qty, and Reorder Level.
        </p>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-16 flex flex-col items-center justify-center transition-colors cursor-pointer ${
            isDragging ? "border-primary bg-primary/5" : "border-border"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={48} className="text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">Drag file here</p>
          <p className="text-muted-foreground mb-4">or</p>
          <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            Browse
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".csv,.xlsx,.xls,.txt"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {files.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Uploaded Files</h3>
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-card rounded-lg p-3 border border-border">
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-primary" />
                  <div>
                    <p className="text-sm text-card-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button onClick={() => removeFile(index)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={() => upload()}
              disabled={isPending}
              className="mt-2 w-full flex items-center justify-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {isPending ? <><Loader2 size={16} className="animate-spin" /> Uploading…</> : "Upload & Analyze"}
            </button>
          </div>
        )}

        {uploadResult && (
          <div className="mt-6 flex items-start gap-3 bg-card rounded-xl p-4 border border-border">
            <CheckCircle size={20} className="text-green-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-card-foreground">Analysis complete</p>
              <p className="text-xs text-muted-foreground">
                {uploadResult.uploadedFiles} file(s) · {uploadResult.parsedRows} parsed rows · {uploadResult.totalRows} active analytics rows.
                {" "}
                {uploadResult.catalogMode === "full"
                  ? `Loaded ${uploadResult.catalogProducts} uploaded catalog products for stock and bill generation.`
                  : "This dataset is running in analytics-only mode for stock and bill generation."}
              </p>
              {processResult && (
                <p className="text-xs text-muted-foreground mt-2">
                  Categories detected: {processResult.categories.join(", ")}. Forecast rows generated: {processResult.forecastCount}. Damaged products detected: {uploadResult.damagedProducts}.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UploadBills;
