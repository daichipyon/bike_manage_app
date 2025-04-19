import { User } from "@supabase/supabase-js";
import Image from "next/image";
import { logout } from "@/app/(authenticated)/actions";

export default function Header({ user }: { user: User }) {
  return (
    <header className="border-b bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-2">
          <Image
            src="/assets/logo.svg"
            alt="Bike Manager Logo"
            width={32}
            height={32}
          />
          <h1 className="text-xl font-bold text-gray-900">駐輪場管理システム</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {user?.email || 'ログイン中'}
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="rounded px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              ログアウト
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}