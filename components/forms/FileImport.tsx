"use client";

type FileImportProps = {
  onFileSelect: (file: File) => void;
};

export const FileImport = ({ onFileSelect }: FileImportProps) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-panel">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-white">Importer un fichier</h2>
        <span className="text-xs text-slate-400">.pb ou .bin</span>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 px-4 py-6 text-center text-sm text-slate-300 hover:border-accent">
          <span className="text-base font-semibold text-white">Déposer un fichier</span>
          <span className="text-xs text-slate-500">
            Le flux est conservé en cache pour consultation hors ligne.
          </span>
          <input
            type="file"
            accept=".pb,.bin,application/octet-stream"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileSelect(file);
            }}
          />
        </label>
        <p className="text-xs text-slate-500">
          Aucun envoi serveur : le parsing se fait dans ton navigateur, seul le cache local est
          utilisé.
        </p>
      </div>
    </div>
  );
};

