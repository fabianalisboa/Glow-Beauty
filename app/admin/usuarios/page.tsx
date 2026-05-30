export default function Usuarios() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">
          Usuários do Sistema
        </h1>

        <a
          href="/admin/usuarios/novo"
          className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
        >
          + Novo Usuário
        </a>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-pink-50">
              <th className="text-left p-3">Nome</th>
              <th className="text-left p-3">E-mail</th>
              <th className="text-left p-3">Perfil</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Ações</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-b">
              <td className="p-3">Fabiana Lisboa</td>
              <td className="p-3">admin@glowbeauty.com</td>
              <td className="p-3">Administrador</td>
              <td className="p-3 text-green-600 font-semibold">
                Ativo
              </td>
              <td className="p-3">
                <div className="flex gap-4">
                  <button className="text-blue-600 font-semibold hover:underline">
                    Editar
                  </button>

                  <button className="text-red-600 font-semibold hover:underline">
                    Excluir
                  </button>
                </div>
              </td>
            </tr>

            <tr className="border-b">
              <td className="p-3">Ana Martins</td>
              <td className="p-3">ana@glowbeauty.com</td>
              <td className="p-3">Esteticista</td>
              <td className="p-3 text-green-600 font-semibold">
                Ativo
              </td>
              <td className="p-3">
                <div className="flex gap-4">
                  <button className="text-blue-600 font-semibold hover:underline">
                    Editar
                  </button>

                  <button className="text-red-600 font-semibold hover:underline">
                    Excluir
                  </button>
                </div>
              </td>
            </tr>

            <tr>
              <td className="p-3">Mariana Costa</td>
              <td className="p-3">recepcao@glowbeauty.com</td>
              <td className="p-3">Recepcionista</td>
              <td className="p-3 text-yellow-600 font-semibold">
                Pendente
              </td>
              <td className="p-3">
                <div className="flex gap-4">
                  <button className="text-blue-600 font-semibold hover:underline">
                    Editar
                  </button>

                  <button className="text-red-600 font-semibold hover:underline">
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