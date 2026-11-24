export default function EditarProfissional() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        Editar Profissional
      </h1>

      <div className="bg-white rounded-xl shadow p-8 max-w-4xl">
        <form className="grid md:grid-cols-2 gap-4">

          <input
            defaultValue="Ana Martins"
            className="border p-3 rounded-lg"
          />

          <input
            defaultValue="123.456.789-00"
            className="border p-3 rounded-lg"
          />

          <input
            defaultValue="(53) 99999-4444"
            className="border p-3 rounded-lg"
          />

          <input
            defaultValue="ana@glowbeauty.com"
            className="border p-3 rounded-lg"
          />

          <input
            defaultValue="Limpeza de Pele"
            className="border p-3 rounded-lg"
          />

          <select className="border p-3 rounded-lg">
            <option>Ativa</option>
            <option>Indisponível</option>
            <option>Inativa</option>
          </select>

          <textarea
            className="border p-3 rounded-lg md:col-span-2"
            rows={5}
            defaultValue="Profissional responsável pelos procedimentos faciais."
          />

          <div className="md:col-span-2 flex gap-3">
            <a
              href="/admin/profissionais"
              className="border px-5 py-3 rounded-lg"
            >
              Cancelar
            </a>

            <button
              className="bg-pink-600 text-white px-5 py-3 rounded-lg"
            >
              Salvar Alterações
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}