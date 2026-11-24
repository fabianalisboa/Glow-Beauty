import Sidebar from "../../components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1">
        <header className="bg-white shadow px-8 py-6 flex justify-between items-center">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">
              Glow Beauty
            </h1>

            <p className="text-sm text-gray-500">
              Sistema de Gestão para Clínica de Estética
            </p>
          </div>

          <div className="flex items-center gap-6 pr-4">
            <div className="text-right">
              <p className="font-semibold text-gray-800">
                Fabiana Lisboa
              </p>
            </div>

            <div className="w-14 h-14 flex-shrink-0 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
              F
            </div>
          </div>
        </header>

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}