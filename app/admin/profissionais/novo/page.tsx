export default function NovoProfissional() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Novo Profissional</h1>

      <div className="bg-white rounded-xl shadow p-8 max-w-4xl">
        <form className="grid md:grid-cols-2 gap-4">
          <input
            className="border p-3 rounded-lg"
            placeholder="Nome completo"
          />
          <input className="border p-3 rounded-lg" placeholder="CPF" />
          <input className="border p-3 rounded-lg" placeholder="Telefone" />
          <input className="border p-3 rounded-lg" placeholder="E-mail" />
          <input
            className="border p-3 rounded-lg"
            placeholder="Especialidade"
          />

          <select className="border p-3 rounded-lg">
            <option>Status</option>
            <option>Ativa</option>
            <option>Indisponível</option>
            <option>Inativa</option>
          </select>

          <textarea
            className="border p-3 rounded-lg md:col-span-2"
            placeholder="Observações"
          />

          <div className="md:col-span-2 flex gap-3 mt-4">
            <a
              href="/admin/profissionais"
              className="border px-5 py-3 rounded-lg"
            >
              Cancelar
            </a>

            <button className="bg-pink-600 text-white px-5 py-3 rounded-lg hover:bg-pink-700">
              Salvar Profissional
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
