export default function DetalheCliente() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Ficha da Cliente</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Dados Pessoais</h2>

          <p>
            <strong>Nome:</strong> Maria Silva
          </p>
          <p>
            <strong>Telefone:</strong> (53) 99999-1111
          </p>
          <p>
            <strong>E-mail:</strong> maria@email.com
          </p>
          <p>
            <strong>Status:</strong> Ativa
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Histórico</h2>

          <p>05/06/2026 - Limpeza de Pele</p>
          <p>12/06/2026 - Botox</p>
          <p>20/06/2026 - Microagulhamento</p>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Observações</h2>

        <p>
          Cliente prefere atendimentos no turno da manhã. Possui interesse em
          pacotes mensais de skincare.
        </p>
      </div>

      <a
        href="/admin/clientes"
        className="inline-block mt-6 bg-pink-600 text-white px-5 py-3 rounded-lg"
      >
        Voltar
      </a>
    </div>
  );
}
