export default function DetalheAgendamento3() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        Detalhes do Agendamento
      </h1>

      <div className="bg-white rounded-xl shadow p-8 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-6">
          <p><strong>Cliente:</strong> Patrícia Oliveira</p>
          <p><strong>Profissional:</strong> Ana Martins</p>
          <p><strong>Serviço:</strong> Microagulhamento</p>
          <p><strong>Valor:</strong> R$ 250,00</p>
          <p><strong>Data:</strong> 06/06/2026</p>
          <p><strong>Horário:</strong> 16:30</p>
          <p><strong>Status:</strong> Cancelado</p>
          <p><strong>Pagamento:</strong> Não realizado</p>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-3">
            Observações
          </h2>

          <p>
            Agendamento cancelado pela cliente.
          </p>
        </div>

        <div className="flex gap-3 mt-8">
          <button className="bg-green-600 text-white px-5 py-3 rounded-lg">
            Confirmar
          </button>

          <button className="bg-yellow-500 text-white px-5 py-3 rounded-lg">
            Reagendar
          </button>

          <button className="bg-red-600 text-white px-5 py-3 rounded-lg">
            Cancelar
          </button>

          <a
            href="/admin/agendamentos"
            className="border px-5 py-3 rounded-lg"
          >
            Voltar
          </a>
        </div>
      </div>
    </div>
  );
}