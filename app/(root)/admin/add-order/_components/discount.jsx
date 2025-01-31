import Loader from "@/components/shared/loader";
import useProductStore from "@/store/event";
import { Minus, Plus } from "lucide-react";
import React, { useEffect } from "react";

const Discount = ({ loading }) => {
  const { discounts, discountProducts, incrementDiscount, decrementDiscount } =
    useProductStore();

  const handleAddDiscount = (discount) => {
    incrementDiscount(discount);
  };

  const handleRemoveDiscount = (discount) => {
    decrementDiscount(discount);
  };

  return (
    <main className="p-3">
      {loading ? (
        <div className="flex gap-2 mx-auto w-11/12 z-10 justify-center items-center mt-24 mb-40 ">
          <Loader />
          <h1 className="textNormal1 text-thin font-bold">Загрузка...</h1>
        </div>
      ) : (
        <>
          {discounts?.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {discounts?.map((item, i) => {
                const activeCount = discountProducts?.find(
                  (d) => +d?.discount?.promotion_id == item?.promotion_id
                );
                return (
                  <div
                    key={i}
                    className={`relative flex justify-between flex-col gap-2 shadow-custom rounded-md p-2 min-h-24`}
                  >
                    {!item?.active && (
                      <div className="z-10 absolute top-0 left-0 w-full h-full rounded-md bg-white/50" />
                    )}
                    <h1 className="textSmall2">{item?.name}</h1>
                    <div className="flex justify-between rounded-md px-2 py-1 items-center gap-4">
                      <button
                        onClick={() => handleAddDiscount(item)}
                        className="w-full flex justify-center items-center p-1 text-primary hover:bg-border rounded-md shadow-md 
              active:bg-gray-100 transition-all ease-linear duration-100"
                      >
                        <Plus size={18} />
                      </button>
                      <h1 className="min-w-4">
                        {activeCount?.discount?.active ? 1 : 0}
                      </h1>
                      <button
                        onClick={() => handleRemoveDiscount(item)}
                        className="w-full flex justify-center items-center p-1 text-primary hover:bg-border rounded-md shadow-md 
              active:bg-gray-100 transition-all ease-linear duration-100"
                      >
                        <Minus size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center w-full font-bold textNormal1">
              Акция недоступна
            </div>
          )}
        </>
      )}
    </main>
  );
};

export default Discount;
