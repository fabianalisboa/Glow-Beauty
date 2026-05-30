export default function NovoAgendamento() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Novo Agendamento</h1>

      <div className="bg-white rounded-xl shadow p-8 max-w-4xl">
        <form className="grid md:grid-cols-2 gap-4">
          <select className="border p-3 rounded-lg">
            <option>Selecione o cliente</option>
            <option>Maria Silva</option>
            <option>Ana Souza</option>
            <option>Juliana Costa</option>
          </select>

          <select className="border p-3 rounded-lg">
            <option>Selecione o profissional</option>
            <option>Ana Martins</option>
            <option>Carla Souza</option>
            <option>Fernanda Lima</option>
          </select>

          <select className="border p-3 rounded-lg">
            <option>Selecione o serviço</option>
            <option>Limpeza de Pele</option>
            <option>Botox</option>
            <option>Microagulhamento</option>
            <option>Manicure em Gel</option>
          </select>

          <input type="date" className="border p-3 rounded-lg" />

          <input type="time" className="border p-3 rounded-lg" />

          <select className="border p-3 rounded-lg">
            <option>Status</option>
            <option>Confirmado</option>
            <option>Pendente</option>
            <option>Cancelado</option>
          </select>

          <div className="md:col-span-2 flex gap-3 mt-4">
            <a
              href="/admin/agendamentos"
              className="border px-5 py-3 rounded-lg"
            >
              Cancelar
            </a>

            <button className="bg-pink-600 text-white px-5 py-3 rounded-lg hover:bg-pink-700">
              Salvar Agendamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
