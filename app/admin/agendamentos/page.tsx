export default function Agendamentos() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">
          Agendamentos
        </h1>

        <a
          href="/admin/agendamentos/novo"
          className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
        >
          + Novo Agendamento
        </a>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-pink-50">
              <th className="text-left p-3">Cliente</th>
              <th className="text-left p-3">Serviço</th>
              <th className="text-left p-3">Profissional</th>
              <th className="text-left p-3">Data</th>
              <th className="text-left p-3">Horário</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Ações</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-b">
              <td className="p-3">Maria Silva</td>
              <td className="p-3">Limpeza de Pele</td>
              <td className="p-3">Ana Martins</td>
              <td className="p-3">05/06/2026</td>
              <td className="p-3">09:00</td>
              <td className="p-3">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-semibold">
                  Confirmado
                </span>
              </td>
              <td className="p-3">
                <a
                  href="/admin/agendamentos/1"
                  className="bg-pink-100 text-pink-700 px-3 py-1 rounded-lg text-sm font-semibold"
                >
                  Ver Detalhes
                </a>
              </td>
            </tr>

            <tr className="border-b">
              <td className="p-3">Juliana Costa</td>
              <td className="p-3">Botox</td>
              <td className="p-3">Carla Souza</td>
              <td className="p-3">05/06/2026</td>
              <td className="p-3">14:00</td>
              <td className="p-3">
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-sm font-semibold">
                  Pendente
                </span>
              </td>
              <td className="p-3">
                <a
                  href="/admin/agendamentos/2"
                  className="bg-pink-100 text-pink-700 px-3 py-1 rounded-lg text-sm font-semibold"
                >
                  Ver Detalhes
                </a>
              </td>
            </tr>

            <tr>
              <td className="p-3">Patrícia Oliveira</td>
              <td className="p-3">Microagulhamento</td>
              <td className="p-3">Ana Martins</td>
              <td className="p-3">06/06/2026</td>
              <td className="p-3">16:30</td>
              <td className="p-3">
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm font-semibold">
                  Cancelado
                </span>
              </td>
              <td className="p-3">
                <a
                  href="/admin/agendamentos/3"
                  className="bg-pink-100 text-pink-700 px-3 py-1 rounded-lg text-sm font-semibold"
                >
                  Ver Detalhes
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}