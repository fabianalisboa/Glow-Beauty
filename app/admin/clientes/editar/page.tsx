export default function EditarCliente() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Editar Cliente</h1>

      <div className="bg-white rounded-xl shadow p-8 max-w-4xl">
        <form className="grid md:grid-cols-2 gap-4">
          <input className="border p-3 rounded-lg" defaultValue="Maria Silva" />

          <input
            className="border p-3 rounded-lg"
            defaultValue="123.456.789-00"
          />

          <input
            className="border p-3 rounded-lg"
            defaultValue="(53) 99999-1111"
          />

          <input
            className="border p-3 rounded-lg"
            defaultValue="maria@email.com"
          />

          <input className="border p-3 rounded-lg" defaultValue="10/05/2026" />

          <select className="border p-3 rounded-lg">
            <option>Ativo</option>
            <option>Inativo</option>
          </select>

          <textarea
            className="border p-3 rounded-lg md:col-span-2"
            rows={5}
            defaultValue="Cliente prefere atendimentos no turno da manhã."
          />

          <div className="md:col-span-2 flex gap-3 mt-4">
            <a href="/admin/clientes" className="border px-5 py-3 rounded-lg">
              Cancelar
            </a>

            <button className="bg-pink-600 text-white px-5 py-3 rounded-lg hover:bg-pink-700">
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
