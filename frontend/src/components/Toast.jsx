import { useApp } from "../store/AppContext.jsx";

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200]">
      <div className="bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 max-w-md">
        <span>✨</span>
        <p className="text-sm font-medium">{toast}</p>
      </div>
    </div>
  );
}
