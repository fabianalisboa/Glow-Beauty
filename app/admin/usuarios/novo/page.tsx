export default function NovoUsuario() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        Novo Usuário
      </h1>

      <div className="bg-white rounded-xl shadow p-8 max-w-4xl">
        <form className="grid md:grid-cols-2 gap-4">
          <input className="border p-3 rounded-lg" placeholder="Nome completo" />

          <input className="border p-3 rounded-lg" placeholder="E-mail" />

          <input className="border p-3 rounded-lg" placeholder="Senha" type="password" />

          <select className="border p-3 rounded-lg">
            <option>Perfil</option>
            <option>Administrador</option>
            <option>Recepcionista</option>
            <option>Esteticista</option>
          </select>

          <select className="border p-3 rounded-lg md:col-span-2">
            <option>Status</option>
            <option>Ativo</option>
            <option>Pendente</option>
            <option>Inativo</option>
          </select>

          <div className="md:col-span-2 flex gap-3 mt-4">
            <a
              href="/admin/usuarios"
              className="border px-5 py-3 rounded-lg"
            >
              Cancelar
            </a>

            <button className="bg-pink-600 text-white px-5 py-3 rounded-lg hover:bg-pink-700">
              Salvar Usuário
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}