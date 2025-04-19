import { getAllBicycleSlots } from "@/lib/actions/bicycle-slots";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import Link from "next/link";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import SlotActions from "@/components/slots/SlotActions";

export default async function BicycleSlotsPage() {
  const slots = await getAllBicycleSlots();

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">駐輪枠管理</h1>
            <p className="mt-1 text-sm text-gray-500">
              駐輪枠の一覧と割り当て状況
            </p>
          </div>
          <Link
            href="/bicycle-slots/create"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            新規駐輪枠追加
          </Link>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    スロットコード
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    場所
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    状態
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    利用者
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">アクション</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {slots.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      駐輪枠はまだ登録されていません
                    </td>
                  </tr>
                ) : (
                  slots.map((slot) => (
                    <tr key={slot.id}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {slot.slot_code}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {slot.location}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            slot.status === "available"
                              ? "bg-green-100 text-green-800"
                              : slot.status === "occupied"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {slot.status === "available"
                            ? "空き"
                            : slot.status === "occupied"
                            ? "使用中"
                            : "メンテナンス中"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {slot.residents
                            ? slot.residents.name
                            : "未割り当て"}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <SlotActions
                          slotId={slot.id}
                          hasResident={Boolean(slot.residents)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}