export default function Dashboard() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Dashboard Glow Beauty</h1>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-pink-500">
          <h2 className="text-gray-500">Clientes</h2>
          <p className="text-4xl font-bold">248</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500">
          <h2 className="text-gray-500">Agendamentos</h2>
          <p className="text-4xl font-bold">73</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500">
          <h2 className="text-gray-500">Receita Mensal</h2>
          <p className="text-4xl font-bold text-green-600">R$ 28.500</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-purple-500">
          <h2 className="text-gray-500">Profissionais</h2>
          <p className="text-4xl font-bold">12</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Próximos Agendamentos</h2>

          <div className="space-y-3">
            <div className="border-b pb-2">
              <strong>09:00</strong> - Maria Silva
              <br />
              Limpeza de Pele
            </div>

            <div className="border-b pb-2">
              <strong>14:00</strong> - Juliana Costa
              <br />
              Botox
            </div>

            <div>
              <strong>16:30</strong> - Patrícia Oliveira
              <br />
              Microagulhamento
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Estoque Baixo</h2>

          <div className="space-y-3">
            <div className="border-b pb-2">
              Sérum Facial
              <span className="float-right text-red-600"> 3 un.</span>
            </div>

            <div className="border-b pb-2">
              Máscara Facial
              <span className="float-right text-red-600"> 4 un.</span>
            </div>

            <div>
              Creme Pós Procedimento
              <span className="float-right text-red-600"> 2 un.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Últimos Clientes</h2>

          <ul className="space-y-2">
            <li>Marina Santos</li>
            <li>Ana Luisa Souto</li>
            <li>Juliany Cardoso</li>
            <li>Fernanda Dias</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Serviços Mais Procurados</h2>

          <ul className="space-y-2">
            <li>Limpeza de Pele (48)</li>
            <li>Botox (35)</li>
            <li>Microagulhamento (22)</li>
            <li>Manicure em Gel (18)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
