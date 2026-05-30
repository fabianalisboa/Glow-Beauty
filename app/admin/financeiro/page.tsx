export default function Financeiro() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Financeiro</h1>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500">
          <h2 className="text-gray-500">Receita Mensal</h2>
          <p className="text-3xl font-bold text-green-600">R$ 28.500</p>
          <p className="text-sm text-gray-400 mt-2">+12% em relação ao mês anterior</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-red-500">
          <h2 className="text-gray-500">Despesas</h2>
          <p className="text-3xl font-bold text-red-600">R$ 7.200</p>
          <p className="text-sm text-gray-400 mt-2">Produtos, aluguel e insumos</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500">
          <h2 className="text-gray-500">Lucro</h2>
          <p className="text-3xl font-bold text-blue-600">R$ 21.300</p>
          <p className="text-sm text-gray-400 mt-2">Lucro líquido estimado</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-purple-500">
          <h2 className="text-gray-500">A Receber</h2>
          <p className="text-3xl font-bold text-purple-600">R$ 3.400</p>
          <p className="text-sm text-gray-400 mt-2">Pagamentos pendentes</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Resumo Financeiro</h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span>Receita atingida</span>
                <span>82%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full w-[82%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Despesas do mês</span>
                <span>35%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-red-500 h-3 rounded-full w-[35%]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Meta de lucro</span>
                <span>76%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-500 h-3 rounded-full w-[76%]"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Formas de Pagamento</h2>

          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span>Pix</span>
              <span className="font-semibold">R$ 12.800</span>
            </div>

            <div className="flex justify-between border-b pb-2">
              <span>Cartão de Crédito</span>
              <span className="font-semibold">R$ 9.400</span>
            </div>

            <div className="flex justify-between border-b pb-2">
              <span>Dinheiro</span>
              <span className="font-semibold">R$ 3.100</span>
            </div>

            <div className="flex justify-between">
              <span>Débito</span>
              <span className="font-semibold">R$ 3.200</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">Últimas Movimentações</h2>

        <table className="w-full">
          <thead>
            <tr className="border-b bg-pink-50">
              <th className="text-left p-3">Data</th>
              <th className="text-left p-3">Descrição</th>
              <th className="text-left p-3">Tipo</th>
              <th className="text-left p-3">Forma</th>
              <th className="text-left p-3">Valor</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-b">
              <td className="p-3">01/06/2026</td>
              <td className="p-3">Limpeza de Pele</td>
              <td className="p-3 text-green-600 font-semibold">Receita</td>
              <td className="p-3">Pix</td>
              <td className="p-3">R$ 150,00</td>
              <td className="p-3">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-semibold">
                  Pago
                </span>
              </td>
            </tr>

            <tr className="border-b">
              <td className="p-3">02/06/2026</td>
              <td className="p-3">Compra de Produtos</td>
              <td className="p-3 text-red-600 font-semibold">Despesa</td>
              <td className="p-3">Pix</td>
              <td className="p-3">R$ 500,00</td>
              <td className="p-3">
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm font-semibold">
                  Pago
                </span>
              </td>
            </tr>

            <tr className="border-b">
              <td className="p-3">03/06/2026</td>
              <td className="p-3">Botox</td>
              <td className="p-3 text-green-600 font-semibold">Receita</td>
              <td className="p-3">Crédito</td>
              <td className="p-3">R$ 900,00</td>
              <td className="p-3">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-semibold">
                  Pago
                </span>
              </td>
            </tr>

            <tr>
              <td className="p-3">04/06/2026</td>
              <td className="p-3">Microagulhamento</td>
              <td className="p-3 text-green-600 font-semibold">Receita</td>
              <td className="p-3">Débito</td>
              <td className="p-3">R$ 250,00</td>
              <td className="p-3">
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-sm font-semibold">
                  Pendente
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}