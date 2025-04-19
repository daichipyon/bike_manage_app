"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { 
  EllipsisVerticalIcon, 
  PencilSquareIcon, 
  UserPlusIcon, 
  TrashIcon,
  ArrowPathIcon 
} from "@heroicons/react/24/outline";
import { releaseBicycleSlot, deleteBicycleSlot } from "@/lib/actions/bicycle-slots";

interface SlotActionsProps {
  slotId: number;
  hasResident: boolean;
}

export default function SlotActions({ slotId, hasResident }: SlotActionsProps) {
  const [isReleasing, setIsReleasing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRelease = async () => {
    if (!confirm("この駐輪枠の割り当てを解除してもよろしいですか？")) {
      return;
    }

    setIsReleasing(true);
    setError(null);

    try {
      const result = await releaseBicycleSlot(slotId);
      if (!result.success) {
        setError(result.message || "駐輪枠の割り当て解除に失敗しました。");
      }
    } catch (err) {
      setError("エラーが発生しました。");
      console.error(err);
    } finally {
      setIsReleasing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("この駐輪枠を完全に削除してもよろしいですか？")) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await deleteBicycleSlot(slotId);
      // Note: deleteBicycleSlot redirects if successful
    } catch (err) {
      setError("エラーが発生しました。");
      console.error(err);
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {error && (
        <div className="text-xs text-red-600">{error}</div>
      )}
      
      <Link
        href={`/bicycle-slots/${slotId}`}
        className="text-blue-600 hover:text-blue-900"
      >
        詳細
      </Link>

      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="inline-flex items-center rounded-full border border-gray-300 p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-500">
            <span className="sr-only">オプション</span>
            <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href={`/bicycle-slots/${slotId}/edit`}
                    className={`${
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                    } flex items-center px-4 py-2 text-sm`}
                  >
                    <PencilSquareIcon
                      className="mr-3 h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                    編集
                  </Link>
                )}
              </Menu.Item>

              {!hasResident && (
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href={`/assign?slotId=${slotId}`}
                      className={`${
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                      } flex items-center px-4 py-2 text-sm`}
                    >
                      <UserPlusIcon
                        className="mr-3 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                      利用者割り当て
                    </Link>
                  )}
                </Menu.Item>
              )}

              {hasResident && (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleRelease}
                      disabled={isReleasing}
                      className={`${
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                      } flex w-full items-center px-4 py-2 text-sm`}
                    >
                      <ArrowPathIcon
                        className="mr-3 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                      {isReleasing ? "処理中..." : "割り当て解除"}
                    </button>
                  )}
                </Menu.Item>
              )}

              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting || hasResident}
                    className={`${
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                    } flex w-full items-center px-4 py-2 text-sm ${
                      hasResident ? "cursor-not-allowed opacity-50" : ""
                    }`}
                  >
                    <TrashIcon
                      className="mr-3 h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                    {isDeleting
                      ? "削除中..."
                      : hasResident
                      ? "利用者あり - 削除不可"
                      : "削除"}
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}