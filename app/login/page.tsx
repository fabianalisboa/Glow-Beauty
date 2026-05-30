export default function Login() {
  return (
    <div className="min-h-screen flex bg-[#FAF7F2]">
      <div className="hidden md:flex md:w-1/2 bg-pink-700 text-white items-center justify-center p-10">
        <div className="max-w-md">
          <p className="uppercase tracking-widest text-pink-200 mb-4">
            Glow Beauty
          </p>

          <h1 className="text-5xl font-bold mb-6">
            Gestão inteligente para clínicas de estética
          </h1>

          <p className="text-lg text-pink-100">
            Controle clientes, agendamentos, profissionais, serviços, financeiro
            e estoque em um único sistema.
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-[#FAF7F2]">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-3xl font-bold text-pink-600 mb-4">
              Glow Beauty
            </div>

            <h2 className="text-3xl font-bold text-gray-800">
              Bem-vinda
            </h2>

            <p className="text-gray-500 mt-2">
              Acesse sua conta para continuar
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                E-mail
              </label>

              <input
                type="email"
                placeholder="admin@glowbeauty.com"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Senha
              </label>

              <input
                type="password"
                placeholder="Digite sua senha"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <a
              href="/admin/dashboard"
              className="flex justify-center items-center w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition"
            >
              Entrar
            </a>

            <button
              type="button"
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Entrar com Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
