import Link from "next/link";
import { getBicycleSlotStatistics } from "@/lib/actions/bicycle-slots";
import { getResidentStatistics } from "@/lib/actions/residents";
import { getViolationStatistics } from "@/lib/actions/violations";
import { getPaymentStatistics } from "@/lib/actions/payments";
import {
  HomeIcon,
  UserGroupIcon,
  TicketIcon,
  ExclamationTriangleIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

export default async function DashboardPage() {
  // Fetch statistics for the dashboard
  const [bicycleStats, residentStats, violationStats, paymentStats] = await Promise.all([
    getBicycleSlotStatistics(),
    getResidentStatistics(),
    getViolationStatistics(),
    getPaymentStatistics(),
  ]);
  console.log(
    "🚀 ~ file: page.tsx:10 ~ DashboardPage ~ paymentStats:",
    paymentStats
    );

  const stats = [
    {
      name: "総駐輪枠数",
      value: bicycleStats.total,
      desc: `空き: ${bicycleStats.available}、使用中: ${bicycleStats.occupied}、メンテナンス中: ${bicycleStats.maintenance}`,
      icon: HomeIcon,
      color: "bg-blue-100 text-blue-800",
      link: "/dashboard/slots",
    },
    {
      name: "登録居住者",
      value: residentStats.total,
      desc: `有効: ${residentStats.active}、無効: ${residentStats.inactive}`,
      icon: UserGroupIcon,
      color: "bg-green-100 text-green-800",
      link: "/residents",
    },
    {
      name: "不正利用記録",
      value: violationStats.total,
      desc: `直近30日: ${violationStats.recent}件`,
      icon: ExclamationTriangleIcon,
      color: "bg-red-100 text-red-800",
      link: "/violations",
    },
    {
      name: "入金状況",
      value: `${paymentStats.unpaid}/${paymentStats.total}`,
      desc: `未入金: ${paymentStats.unpaid}件、今月分: ${paymentStats.currentMonth}件`,
      icon: CreditCardIcon,
      color: "bg-yellow-100 text-yellow-800",
      link: "/payments",
    },
  ];

  return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="mt-1 text-sm text-gray-500">
            駐輪場管理システムの概要をご確認ください
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link
              key={stat.name}
              href={stat.link}
              className="transform overflow-hidden rounded-lg bg-white shadow transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.color}`}
                  >
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">
                      {stat.name}
                    </p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-600">{stat.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">
                クイックアクション
              </h3>
              <div className="mt-6 space-y-4">
                <Link
                  href="/assign"
                  className="flex items-center rounded-md bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-100"
                >
                  <TicketIcon className="mr-3 h-5 w-5 text-blue-500" />
                  新規駐輪枠割り当て・ステッカー発行
                </Link>
                <Link
                  href="/residents/create"
                  className="flex items-center rounded-md bg-green-50 px-4 py-3 text-sm font-medium text-green-700 hover:bg-green-100"
                >
                  <UserGroupIcon className="mr-3 h-5 w-5 text-green-500" />
                  新規居住者登録
                </Link>
                <Link
                  href="/violations/create"
                  className="flex items-center rounded-md bg-red-50 px-4 py-3 text-sm font-medium text-red-700 hover:bg-red-100"
                >
                  <ExclamationTriangleIcon className="mr-3 h-5 w-5 text-red-500" />
                  不正利用記録の追加
                </Link>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">
                システム情報
              </h3>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-sm text-gray-500">最終データ更新</span>
                  <span className="text-sm font-medium">
                    {new Date().toLocaleDateString("ja-JP")}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-sm text-gray-500">バージョン</span>
                  <span className="text-sm font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-sm text-gray-500">
                    サポート連絡先
                  </span>
                  <span className="text-sm font-medium">
                    support@bike-manager.example.com
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}