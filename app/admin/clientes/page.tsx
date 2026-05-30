export default function Clientes() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Clientes</h1>

        <a
          href="/admin/clientes/novo"
          className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
        >
          + Novo Cliente
        </a>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-pink-50">
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">Telefone</th>
              <th className="text-left p-3">E-mail</th>
              <th className="text-left p-3">Cadastro</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Ações</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-b">
              <td className="p-3">Maria Silva</td>
              <td className="p-3">(53) 99999-1111</td>
              <td className="p-3">maria@email.com</td>
              <td className="p-3">10/05/2026</td>
              <td className="p-3">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-semibold">
                  Ativo
                </span>
              </td>
              <td className="p-3">
                <div className="flex items-center gap-3">
                  <a
                    href="/admin/clientes/1"
                    className="bg-pink-100 text-pink-700 px-3 py-1 rounded-lg text-sm font-semibold"
                  >
                    Ficha
                  </a>

                  <a
                    href="/admin/clientes/editar"
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
              <td className="p-3">Ana Souza</td>
              <td className="p-3">(53) 99999-2222</td>
              <td className="p-3">ana@email.com</td>
              <td className="p-3">15/05/2026</td>
              <td className="p-3">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-semibold">
                  Ativo
                </span>
              </td>
              <td className="p-3">
                <div className="flex items-center gap-3">
                  <a
                    href="/admin/clientes/1"
                    className="bg-pink-100 text-pink-700 px-3 py-1 rounded-lg text-sm font-semibold"
                  >
                    Ficha
                  </a>

                  <a
                    href="/admin/clientes/editar"
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
              <td className="p-3">Juliana Costa</td>
              <td className="p-3">(53) 99999-3333</td>
              <td className="p-3">juliana@email.com</td>
              <td className="p-3">20/05/2026</td>
              <td className="p-3">
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-sm font-semibold">
                  Inativo
                </span>
              </td>
              <td className="p-3">
                <div className="flex items-center gap-3">
                  <a
                    href="/admin/clientes/1"
                    className="bg-pink-100 text-pink-700 px-3 py-1 rounded-lg text-sm font-semibold"
                  >
                    Ficha
                  </a>

                  <a
                    href="/admin/clientes/editar"
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