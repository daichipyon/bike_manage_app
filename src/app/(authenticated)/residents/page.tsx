import { getAllResidents } from "@/lib/actions/residents";
import Link from "next/link";
import { UserPlusIcon } from "@heroicons/react/24/outline";

export default async function ResidentsPage() {
  const residents = await getAllResidents();

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">居住者管理</h1>
            <p className="mt-1 text-sm text-gray-500">
              居住者の一覧と詳細情報
            </p>
          </div>
          <Link
            href="/residents/create"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <UserPlusIcon className="mr-2 h-4 w-4" />
            新規居住者登録
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
                    氏名
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    部屋番号
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    連絡先
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    ステータス
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    駐輪枠
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">アクション</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {residents.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      居住者情報はまだ登録されていません
                    </td>
                  </tr>
                ) : (
                  residents.map((resident) => (
                    <tr key={resident.id}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {resident.name}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {resident.room_number}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {resident.contact_info}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            resident.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {resident.status === "active" ? "有効" : "無効"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {resident.bicycle_slots && resident.bicycle_slots.length > 0
                            ? resident.bicycle_slots.map((slot) => slot.slot_code).join(", ")
                            : "未割り当て"}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <Link
                          href={`/residents/${resident.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          詳細
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}