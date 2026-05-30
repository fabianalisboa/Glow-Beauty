export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-100">
      <header className="bg-pink-600 text-white px-10 py-6 flex justify-between items-center shadow">
        <h1 className="text-4xl font-bold">Glow Beauty</h1>

        <a
          href="/login"
          className="bg-white text-pink-600 px-5 py-2 rounded-lg font-semibold hover:bg-pink-100"
        >
          Entrar
        </a>
      </header>

      <section className="max-w-6xl mx-auto px-10 py-20 text-center">
        <h2 className="text-6xl font-bold text-gray-800 mb-6">
          Sistema Inteligente para
          <span className="text-pink-600"> Clínicas de Estética</span>
        </h2>

        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
          Plataforma completa para gerenciamento de clientes, profissionais,
          serviços, agendamentos, estoque e financeiro.
        </p>

        <a
          href="/login"
          className="inline-block bg-pink-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-pink-700 shadow-lg"
        >
          Acessar Sistema
        </a>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold mb-3">Clientes</h3>

            <p className="text-gray-600">
              Cadastro completo, histórico de atendimentos e acompanhamento.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold mb-3">Agendamentos</h3>

            <p className="text-gray-600">
              Controle de horários, profissionais e procedimentos.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold mb-3">Financeiro</h3>

            <p className="text-gray-600">
              Controle de receitas, despesas e relatórios financeiros.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
