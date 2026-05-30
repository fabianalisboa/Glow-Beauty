export default function Profissionais() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">
          Profissionais
        </h1>

        <a
          href="/admin/profissionais/novo"
          className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
        >
          + Novo Profissional
        </a>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-pink-50">
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">Especialidade</th>
              <th className="text-left p-3">Telefone</th>
              <th className="text-left p-3">E-mail</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Ações</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-b">
              <td className="p-3">Ana Martins</td>
              <td className="p-3">Limpeza de Pele</td>
              <td className="p-3">(53) 99999-4444</td>
              <td className="p-3">ana@glowbeauty.com</td>

              <td className="p-3">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-semibold">
                  Ativa
                </span>
              </td>

              <td className="p-3">
                <div className="flex items-center gap-3">
                  <a
                    href="/admin/profissionais/1"
                    className="bg-pink-100 text-pink-700 px-3 py-1 rounded-lg text-sm font-semibold"
                  >
                    Perfil
                  </a>

                  <a
                    href="/admin/profissionais/editar"
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
              <td className="p-3">Carla Souza</td>
              <td className="p-3">Botox e Harmonização</td>
              <td className="p-3">(53) 99999-5555</td>
              <td className="p-3">carla@glowbeauty.com</td>

              <td className="p-3">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-semibold">
                  Ativa
                </span>
              </td>

              <td className="p-3">
                <div className="flex items-center gap-3">
                  <a
                    href="/admin/profissionais/1"
                    className="bg-pink-100 text-pink-700 px-3 py-1 rounded-lg text-sm font-semibold"
                  >
                    Perfil
                  </a>

                  <a
                    href="/admin/profissionais/editar"
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
              <td className="p-3">Fernanda Lima</td>
              <td className="p-3">Microagulhamento</td>
              <td className="p-3">(53) 99999-6666</td>
              <td className="p-3">fernanda@glowbeauty.com</td>

              <td className="p-3">
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-sm font-semibold">
                  Indisponível
                </span>
              </td>

              <td className="p-3">
                <div className="flex items-center gap-3">
                  <a
                    href="/admin/profissionais/1"
                    className="bg-pink-100 text-pink-700 px-3 py-1 rounded-lg text-sm font-semibold"
                  >
                    Perfil
                  </a>

                  <a
                    href="/admin/profissionais/editar"
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