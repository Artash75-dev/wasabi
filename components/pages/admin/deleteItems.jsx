"use client";
import React, { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { revalidatePath } from "@/lib/revalidate";
import { deleteIcon, editIcon } from "@/public/images";
import Image from "next/image";
import Link from "next/link";

const DeleteItem = ({ payment }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const deleteItem = async (payment) => {
    try {
      await axios.delete(`/api/client`, {
        params: {
          id: payment.client_id,
        },
      });
      setOpen(false); // Close dialog after successful deletion
    } catch (error) {
      console.error(error); // Handle any errors during deletion
    }
  };
  const handleDelete = () => {
    const callFunction = deleteItem(payment);
    toast.promise(callFunction, {
      loading: "Данные удаляются...",
      success: <p>Данные успешно удалены!</p>,
      error: (
        <p>Произошла ошибка при удалении данных. Повторите попытку позже.</p>
      ),
    });
  };
  return (
    <Suspense>
      <div className="w-28 flex justify-end items-center gap-3">
        <Link href={`${pathname}/add?id=${payment.client_id}`}>
          <Button className="bg-transparent">
            <Image src={editIcon} alt="edit" />
          </Button>
        </Link>
        <Button
          onClick={() => {
            setOpen(true);
          }}
          className="bg-transparent"
        >
          <Image src={deleteIcon} alt="delete" />
        </Button>
      </div>

      <AlertDialog open={open} onOpenChange={setOpen} className="z-[9999]">
        <AlertDialogTrigger asChild>
          <Button className="hidden">Trigger</Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="z-[1000]">
          <AlertDialogHeader>
            <AlertDialogTitle>Вы абсолютно уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Это навсегда удалит вашу учетную
              запись и ваши данные с наших серверов.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpen(false)}>
              Отмена
            </AlertDialogCancel>

            <AlertDialogAction
              className="hover:bg-primary"
              onClick={handleDelete}
            >
              Продолжить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Suspense>
  );
};

export default DeleteItem;
