export default function Home() {
  return (
    <main className="min-h-screen bg-pink-50">
      <header className="bg-pink-600 text-white p-6 shadow-md">
        <h1 className="text-3xl font-bold">
          Glow Beauty
        </h1>
      </header>

      <section className="p-10">
        <h2 className="text-4xl font-bold mb-4">
          Sistema de Gestão para clínicas de Estética
        </h2>

        <p className="text-lg text-gray-700 mb-8">
          Plataforma para controle de clientes, serviços,
          profissionais e agendamentos online.
        </p>

      <a
  href="/login"
  className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg mb-8 hover:bg-pink-700 transition"
>
  Acessar Sistema
</a>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-bold text-xl mb-2">
              Clientes
            </h3>
            <p>
              Cadastro e histórico completo dos clientes.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-bold text-xl mb-2">
              Agendamentos
            </h3>
            <p>
              Controle de horários e procedimentos.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-bold text-xl mb-2">
              Financeiro
            </h3>
            <p>
              Relatórios e acompanhamento de faturamento.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}