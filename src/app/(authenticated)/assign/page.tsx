"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AssignmentFormValues, assignmentSchema } from "@/lib/validators/schemas";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { getAllResidents } from "@/lib/actions/residents";
import { getAvailableBicycleSlots, updateBicycleSlot } from "@/lib/actions/bicycle-slots";
import { createResidentAndReturnId } from "@/lib/actions/residents";
import { format } from "date-fns";

export default function AssignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [residents, setResidents] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isNewResident, setIsNewResident] = useState(false);
  
  const slotIdParam = searchParams.get("slotId");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      issued_date: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const residentIdWatch = watch("resident_id");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [residentsData, slotsData] = await Promise.all([
          getAllResidents(),
          getAvailableBicycleSlots(),
        ]);
        setResidents(residentsData);
        setAvailableSlots(slotsData);
        
        // Set slot ID from query params if provided
        if (slotIdParam) {
          const slotId = parseInt(slotIdParam, 10);
          if (!isNaN(slotId) && slotsData.some(slot => slot.id === slotId)) {
            setValue("slot_id", slotId);
          }
        }
      } catch (error) {
        setError("データの取得中にエラーが発生しました。");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setValue, slotIdParam]);

  const onSubmit = async (data: AssignmentFormValues) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      let residentId = data.resident_id;

      // If it's a new resident, create them first
      if (isNewResident && data.resident) {
        const result = await createResidentAndReturnId({
          name: data.resident.name,
          room_number: data.resident.room_number,
          contact_info: data.resident.contact_info,
        });

        if (!result.success) {
          setError(result.message || "居住者の作成に失敗しました。");
          setSubmitting(false);
          return;
        }

        residentId = result.id;
      }

      // Update the bicycle slot with the resident assignment
      const result = await updateBicycleSlot(data.slot_id, {
        id: data.slot_id,
        resident_id: residentId,
        status: "occupied",
        slot_code: "", // These will be filled by the server based on the slot ID
        location: "",
      });

      if (!result.success) {
        setError(result.message || "駐輪枠の割り当てに失敗しました。");
        setSubmitting(false);
        return;
      }

      setSuccess("駐輪枠の割り当てとステッカー発行が完了しました。");
      reset();
      
      // Redirect to the bicycle slot details page
      setTimeout(() => {
        router.push(`/bicycle-slots/${data.slot_id}`);
      }, 1500);
    } catch (err) {
      setError("エラーが発生しました。");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            駐輪枠割り当て・ステッカー発行
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            居住者に駐輪枠を割り当て、ステッカーを発行します
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    利用者情報
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    駐輪枠を割り当てる居住者を選択または新規登録してください
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      id="existing-resident"
                      type="radio"
                      name="resident-type"
                      checked={!isNewResident}
                      onChange={() => setIsNewResident(false)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label
                      htmlFor="existing-resident"
                      className="ml-2 block text-sm font-medium text-gray-700"
                    >
                      既存の居住者
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="new-resident"
                      type="radio"
                      name="resident-type"
                      checked={isNewResident}
                      onChange={() => setIsNewResident(true)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label
                      htmlFor="new-resident"
                      className="ml-2 block text-sm font-medium text-gray-700"
                    >
                      新規居住者
                    </label>
                  </div>
                </div>

                {!isNewResident ? (
                  <div>
                    <label
                      htmlFor="resident_id"
                      className="block text-sm font-medium text-gray-700"
                    >
                      居住者
                    </label>
                    <select
                      id="resident_id"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      {...register("resident_id")}
                      disabled={isNewResident || submitting}
                    >
                      <option value="">居住者を選択してください</option>
                      {residents.map((resident) => (
                        <option key={resident.id} value={resident.id}>
                          {resident.name} ({resident.room_number})
                        </option>
                      ))}
                    </select>
                    {errors.resident_id && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.resident_id.message}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="resident.name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        名前
                      </label>
                      <input
                        type="text"
                        id="resident.name"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        {...register("resident.name")}
                        disabled={!isNewResident || submitting}
                      />
                      {errors.resident?.name && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.resident.name.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="resident.room_number"
                        className="block text-sm font-medium text-gray-700"
                      >
                        部屋番号
                      </label>
                      <input
                        type="text"
                        id="resident.room_number"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        {...register("resident.room_number")}
                        disabled={!isNewResident || submitting}
                      />
                      {errors.resident?.room_number && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.resident.room_number.message}
                        </p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="resident.contact_info"
                        className="block text-sm font-medium text-gray-700"
                      >
                        連絡先
                      </label>
                      <input
                        type="text"
                        id="resident.contact_info"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        {...register("resident.contact_info")}
                        disabled={!isNewResident || submitting}
                      />
                      {errors.resident?.contact_info && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.resident.contact_info.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    駐輪枠とステッカー情報
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    割り当てる駐輪枠とステッカー情報を入力してください
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="slot_id"
                    className="block text-sm font-medium text-gray-700"
                  >
                    駐輪枠
                  </label>
                  <select
                    id="slot_id"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    {...register("slot_id")}
                    disabled={submitting}
                  >
                    <option value="">駐輪枠を選択してください</option>
                    {availableSlots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {slot.slot_code} ({slot.location})
                      </option>
                    ))}
                  </select>
                  {errors.slot_id && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.slot_id.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="sticker_number"
                      className="block text-sm font-medium text-gray-700"
                    >
                      ステッカー番号
                    </label>
                    <input
                      type="text"
                      id="sticker_number"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      {...register("sticker_number")}
                      disabled={submitting}
                    />
                    {errors.sticker_number && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.sticker_number.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="issued_date"
                      className="block text-sm font-medium text-gray-700"
                    >
                      発行日
                    </label>
                    <input
                      type="date"
                      id="issued_date"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      {...register("issued_date")}
                      disabled={submitting}
                    />
                    {errors.issued_date && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.issued_date.message}
                      </p>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="text-sm text-red-700">{error}</div>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="rounded-md bg-green-50 p-4">
                    <div className="flex">
                      <div className="text-sm text-green-700">{success}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70"
                >
                  {submitting ? "処理中..." : "割り当てとステッカー発行"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}