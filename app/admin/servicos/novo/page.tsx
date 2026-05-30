export default function NovoServico() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Novo Serviço</h1>

      <div className="bg-white rounded-xl shadow p-8 max-w-3xl">
        <form className="grid md:grid-cols-2 gap-4">
          <input
            className="border p-3 rounded-lg"
            placeholder="Nome do serviço"
          />
          <input className="border p-3 rounded-lg" placeholder="Valor" />
          <input
            className="border p-3 rounded-lg"
            placeholder="Duração em minutos"
          />

          <select className="border p-3 rounded-lg">
            <option>Categoria</option>
            <option>Facial</option>
            <option>Corporal</option>
            <option>Unhas</option>
            <option>Cabelo</option>
          </select>

          <textarea
            className="border p-3 rounded-lg md:col-span-2"
            placeholder="Descrição do serviço"
          />

          <div className="md:col-span-2 flex gap-3 mt-4">
            <a href="/admin/servicos" className="border px-5 py-3 rounded-lg">
              Cancelar
            </a>

            <button className="bg-pink-600 text-white px-5 py-3 rounded-lg hover:bg-pink-700">
              Salvar Serviço
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
