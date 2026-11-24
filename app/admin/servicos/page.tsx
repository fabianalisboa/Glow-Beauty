export default function Servicos() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">
          Serviços Estéticos
        </h1>

        <a
          href="/admin/servicos/novo"
          className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
        >
          + Novo Serviço
        </a>
      </div>

      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-xl font-bold mb-4">
          Cadastro Rápido
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Nome do Serviço"
            className="border p-3 rounded-lg"
          />

          <input
            type="number"
            placeholder="Valor"
            className="border p-3 rounded-lg"
          />

          <input
            type="number"
            placeholder="Duração (minutos)"
            className="border p-3 rounded-lg"
          />
        </div>

        <button className="mt-4 bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700">
          Cadastrar Serviço
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4">
          Serviços Cadastrados
        </h2>

        <table className="w-full">
          <thead>
            <tr className="border-b bg-pink-50">
              <th className="text-left p-3">Serviço</th>
              <th className="text-left p-3">Valor</th>
              <th className="text-left p-3">Duração</th>
              <th className="text-left p-3">Ações</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-b">
              <td className="p-3">Limpeza de Pele</td>
              <td className="p-3">R$ 150,00</td>
              <td className="p-3">60 min</td>

              <td className="p-3">
                <div className="flex items-center gap-3">
                  <a
                    href="/admin/servicos/editar"
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-semibold"
                  >
                    Editar
                  </a>

                  <button className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm font-semibold">
                    Excluir
                  </button>
                </div>
              </td>
            </tr>

            <tr className="border-b">
              <td className="p-3">Botox</td>
              <td className="p-3">R$ 900,00</td>
              <td className="p-3">45 min</td>

              <td className="p-3">
                <div className="flex items-center gap-3">
                  <a
                    href="/admin/servicos/editar"
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-semibold"
                  >
                    Editar
                  </a>

                  <button className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm font-semibold">
                    Excluir
                  </button>
                </div>
              </td>
            </tr>

            <tr className="border-b">
              <td className="p-3">Microagulhamento</td>
              <td className="p-3">R$ 250,00</td>
              <td className="p-3">90 min</td>

              <td className="p-3">
                <div className="flex items-center gap-3">
                  <a
                    href="/admin/servicos/editar"
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-semibold"
                  >
                    Editar
                  </a>

                  <button className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm font-semibold">
                    Excluir
                  </button>
                </div>
              </td>
            </tr>

            <tr>
              <td className="p-3">Manicure em Gel</td>
              <td className="p-3">R$ 70,00</td>
              <td className="p-3">50 min</td>

              <td className="p-3">
                <div className="flex items-center gap-3">
                  <a
                    href="/admin/servicos/editar"
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-semibold"
                  >
                    Editar
                  </a>

                  <button className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm font-semibold">
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}