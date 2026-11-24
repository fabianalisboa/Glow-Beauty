export default function Relatorios() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Relatórios Gerenciais</h1>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Clientes</h2>
          <p className="text-4xl font-bold">248</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Agendamentos</h2>
          <p className="text-4xl font-bold">73</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Serviços</h2>
          <p className="text-4xl font-bold">18</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Receita</h2>
          <p className="text-4xl font-bold text-green-600">R$ 28.500</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Serviços Mais Procurados</h2>

        <table className="w-full">
          <thead>
            <tr className="border-b bg-pink-50">
              <th className="text-left p-3">Serviço</th>
              <th className="text-left p-3">Atendimentos</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-b">
              <td className="p-3">Limpeza de Pele</td>
              <td className="p-3">48</td>
            </tr>

            <tr className="border-b">
              <td className="p-3">Botox</td>
              <td className="p-3">35</td>
            </tr>

            <tr>
              <td className="p-3">Microagulhamento</td>
              <td className="p-3">22</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Profissionais Destaque</h2>

        <table className="w-full">
          <thead>
            <tr className="border-b bg-pink-50">
              <th className="text-left p-3">Profissional</th>
              <th className="text-left p-3">Atendimentos</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-b">
              <td className="p-3">Ana Martins</td>
              <td className="p-3">52</td>
            </tr>

            <tr>
              <td className="p-3">Carla Souza</td>
              <td className="p-3">41</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
