export default function PerfilProfissional() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        Perfil da Profissional
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Dados Profissionais</h2>

          <p><strong>Nome:</strong> Ana Martins</p>
          <p><strong>Especialidade:</strong> Limpeza de Pele</p>
          <p><strong>Telefone:</strong> (53) 99999-4444</p>
          <p><strong>E-mail:</strong> ana@glowbeauty.com</p>
          <p><strong>Status:</strong> Ativa</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Indicadores</h2>

          <p><strong>Atendimentos no mês:</strong> 52</p>
          <p><strong>Serviço mais realizado:</strong> Limpeza de Pele</p>
          <p><strong>Avaliação média:</strong> 4.9/5</p>
          <p><strong>Comissão estimada:</strong> R$ 3.200,00</p>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Agenda de Hoje</h2>

        <table className="w-full">
          <thead>
            <tr className="border-b bg-pink-50">
              <th className="text-left p-3">Horário</th>
              <th className="text-left p-3">Cliente</th>
              <th className="text-left p-3">Serviço</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-b">
              <td className="p-3">09:00</td>
              <td className="p-3">Maria Silva</td>
              <td className="p-3">Limpeza de Pele</td>
            </tr>

            <tr>
              <td className="p-3">16:30</td>
              <td className="p-3">Patrícia Oliveira</td>
              <td className="p-3">Microagulhamento</td>
            </tr>
          </tbody>
        </table>
      </div>

      <a
        href="/admin/profissionais"
        className="inline-block mt-6 bg-pink-600 text-white px-5 py-3 rounded-lg"
      >
        Voltar
      </a>
    </div>
  );
}