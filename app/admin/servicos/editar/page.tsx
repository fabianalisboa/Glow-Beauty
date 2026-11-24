export default function EditarServico() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        Editar Serviço
      </h1>

      <div className="bg-white rounded-xl shadow p-8 max-w-4xl">
        <form className="grid md:grid-cols-2 gap-4">
          <input
            className="border p-3 rounded-lg"
            defaultValue="Limpeza de Pele"
          />

          <input
            className="border p-3 rounded-lg"
            defaultValue="150.00"
          />

          <input
            className="border p-3 rounded-lg"
            defaultValue="60"
          />

          <select className="border p-3 rounded-lg">
            <option>Facial</option>
            <option>Corporal</option>
            <option>Unhas</option>
            <option>Cabelo</option>
          </select>

          <select className="border p-3 rounded-lg md:col-span-2">
            <option>Ativo</option>
            <option>Inativo</option>
          </select>

          <textarea
            className="border p-3 rounded-lg md:col-span-2"
            rows={5}
            defaultValue="Procedimento indicado para higienização profunda da pele, remoção de impurezas e melhora da aparência facial."
          />

          <div className="md:col-span-2 flex gap-3 mt-4">
            <a
              href="/admin/servicos"
              className="border px-5 py-3 rounded-lg"
            >
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