export default function Configuracoes() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        Configurações da Clínica
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">
            Dados da Clínica
          </h2>

          <div className="space-y-4">
            <input className="w-full border p-3 rounded-lg" defaultValue="Glow Beauty" />
            <input className="w-full border p-3 rounded-lg" defaultValue="12.345.678/0001-90" />
            <input className="w-full border p-3 rounded-lg" defaultValue="contato@glowbeauty.com" />
            <input className="w-full border p-3 rounded-lg" defaultValue="(53) 99999-9999" />
            <input className="w-full border p-3 rounded-lg" defaultValue="Rua Exemplo, 123 - Pelotas/RS" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">
            Horário de Funcionamento
          </h2>

          <div className="space-y-4">
            <input className="w-full border p-3 rounded-lg" defaultValue="Segunda a Sexta" />
            <input className="w-full border p-3 rounded-lg" defaultValue="08:00" />
            <input className="w-full border p-3 rounded-lg" defaultValue="18:00" />
            <input className="w-full border p-3 rounded-lg" defaultValue="Sábado das 08:00 às 12:00" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">
            Permissões
          </h2>

          <div className="space-y-3">
            <p>Administrador: acesso total</p>
            <p>Recepcionista: clientes e agendamentos</p>
            <p>Esteticista: agenda e atendimentos</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">
            Personalização
          </h2>

          <div className="space-y-4">
            <input className="w-full border p-3 rounded-lg" defaultValue="Rosa Glow" />
            <input className="w-full border p-3 rounded-lg" defaultValue="Logo Glow Beauty" />

            <button className="bg-pink-600 text-white px-5 py-3 rounded-lg hover:bg-pink-700">
              Salvar Configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}