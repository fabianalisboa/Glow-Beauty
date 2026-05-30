export default function Agenda() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">
        Agenda do Dia
      </h1>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="space-y-4">

          <div className="flex justify-between border-b pb-3">
            <span className="font-semibold">08:00</span>
            <span className="text-green-600">Livre</span>
          </div>

          <div className="flex justify-between border-b pb-3">
            <span className="font-semibold">09:00</span>
            <span>Maria Silva - Limpeza de Pele</span>
          </div>

          <div className="flex justify-between border-b pb-3">
            <span className="font-semibold">10:00</span>
            <span className="text-green-600">Livre</span>
          </div>

          <div className="flex justify-between border-b pb-3">
            <span className="font-semibold">11:00</span>
            <span>Ana Souza - Botox</span>
          </div>

          <div className="flex justify-between border-b pb-3">
            <span className="font-semibold">14:00</span>
            <span>Juliana Costa - Microagulhamento</span>
          </div>

          <div className="flex justify-between border-b pb-3">
            <span className="font-semibold">15:00</span>
            <span className="text-green-600">Livre</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">16:30</span>
            <span>Patrícia Oliveira - Manicure em Gel</span>
          </div>

        </div>
      </div>
    </div>
  );
}