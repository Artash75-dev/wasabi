import React, { useState, useEffect } from "react";
import Loader from "@/components/shared/loader";
import { Input } from "@/components/ui/input";
import { searchIcon } from "@/public/images";
import { orderCreateInfo, useEvent } from "@/store/event";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const ITEMS_PER_PAGE = 20; // Sahifadagi elementlar soni

const Client = ({ loading }) => {
  const searchParams = useSearchParams();
  const client_id = searchParams.get("client");
  const { orderData } = orderCreateInfo();
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Joriy sahifa
  const { searchClientValue, clients } = useEvent();

  const handleSearch = (e) => {
    setSearchText(e.target.value.toLowerCase());
    setCurrentPage(1); // Qidiruvda sahifani boshidan boshlash
  };

  const filteredData = clients
    ? clients?.filter((c) => {
        const phone = String(c?.phone)?.toLowerCase() || "";
        const phoneNumber = String(c.phone_number)?.toLowerCase();
        const firstName = c?.firstname?.toLowerCase() || "";
        const lastName = c?.lastname?.toLowerCase() || "";
        const searchValue =
          searchText?.replace("+", "") || searchClientValue?.replace("+", "");

        return (
          phone.includes(searchText) ||
          phoneNumber.includes(searchValue) ||
          firstName.includes(searchText) ||
          lastName.includes(searchText)
        );
      })
    : [];

  // Hozirgi sahifadagi ma'lumotlarni hisoblash
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setSearchText(String(searchClientValue));
  }, [searchClientValue]);

  // Jami sahifalar sonini hisoblash
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  return (
    <main className="space-y-2">
      {loading ? (
        <div className="flex gap-2 mx-auto w-11/12 z-10 justify-center items-center mt-24 mb-40">
          <Loader />
          <h1 className="textNormal1 text-thin font-bold">Загрузка...</h1>
        </div>
      ) : (
        <div className="w-full h-full relative">
          {/* Qidiruv qutisi */}
          <div className="px-2 py-1 rounded-md sticky top-0 left-0 bg-white w-full flex justify-between items-center gap-2">
            <div className="w-full flex justify-start items-center gap-1 border-2 border-input rounded-lg shadow-sm bg-white">
              <div className="ml-2">
                <Image src={searchIcon} alt="search" className="w-8 h-8" />
              </div>
              <Input
                type="text"
                placeholder="Найти клиента"
                onChange={handleSearch}
                value={searchText}
                className="font-medium text-thin border-0 p-0 bg-transparent pr-2"
              />
            </div>
            <Link href={"/admin/add-order?newClient=true"}>
              <Plus size={32} className="text-primary cursor-pointer" />
            </Link>
          </div>

          {/* Klientlar roʻyxati */}
          <div className="space-y-1 px-2">
            {paginatedData.map((item, idx) => (
              <Link
                href={`/admin/add-order?client=${item?.client_id}`}
                key={idx}
                className={`${
                  orderData?.client?.client?.client_id == item?.client_id
                    ? "bg-primary text-white rounded-md"
                    : client_id == item?.client_id
                      ? "bg-white text-thin shadow-custom rounded-md"
                      : "text-thin"
                } border-b border-gray-200 px-4 py-2 flex justify-between items-center gap-2`}
              >
                <h1 className="textSmall2 font-bold">
                  {item?.firstname + " " + item?.lastname}
                </h1>
                <p className="textSmall2">{item?.phone}</p>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center mt-4 space-x-2 pb-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Предыдущая
            </button>
            <p className="textSmall2">
              Страница {currentPage} из {totalPages}
            </p>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Следующая
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Client;
