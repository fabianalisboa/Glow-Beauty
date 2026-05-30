export default function Estoque() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Controle de Estoque</h1>

        <button className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700">
          + Novo Produto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-pink-50">
              <th className="text-left p-3">Produto</th>
              <th className="text-left p-3">Categoria</th>
              <th className="text-left p-3">Quantidade</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-b">
              <td className="p-3">Ácido Hialurônico</td>
              <td className="p-3">Injetáveis</td>
              <td className="p-3">15</td>
              <td className="p-3 text-green-600 font-semibold">Disponível</td>
            </tr>

            <tr className="border-b">
              <td className="p-3">Máscara Facial</td>
              <td className="p-3">Skincare</td>
              <td className="p-3">4</td>
              <td className="p-3 text-yellow-600 font-semibold">
                Baixo Estoque
              </td>
            </tr>

            <tr>
              <td className="p-3">Creme Pós Procedimento</td>
              <td className="p-3">Skincare</td>
              <td className="p-3">2</td>
              <td className="p-3 text-red-600 font-semibold">Crítico</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
