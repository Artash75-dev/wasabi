"use client";

import { branches } from "@/components/tableColumns/branches";
import { clients } from "@/components/tableColumns/clients";
import { DataTable } from "@/components/tableColumns/data-table";
import { deliver } from "@/components/tableColumns/deliver";
import { useEvent } from "@/store/event";

function Getelements({ param, data }) {
  const { searchValue } = useEvent();
  let filterData = data ? data : [];
  const searchString = searchValue?.toString().toLowerCase() || "";
  // Filtering data based on param and searchValue
  if (searchString) {
    switch (param) {
      case "branches":
        filterData = filterData.filter((item) =>
          String(item.name)
            .toLowerCase()
            .includes(searchString.toString().toLowerCase())
        );
        break;
      case "clients":
        filterData = filterData.filter((item) => {
          return (
            String(item.firstname)
              .toLowerCase()
              .includes(searchString.toString().toLowerCase()) ||
            String(item.lastname)
              .toLowerCase()
              .includes(searchString.toString().toLowerCase()) ||
            String(item.phone_number)
              .toLowerCase()
              .includes(
                searchString?.replace("+", "").toString()
              ) ||
            String(item.phone)
              .toLowerCase()
              .includes(searchString.toString().toLowerCase()) ||
            String(item.address)
              .toLowerCase()
              .includes(searchString.toString().toLowerCase())
          );
        });
        break;
      case "deliver":
        filterData = filterData.filter((data) => {
          return (
            data.name.toLowerCase().includes(searchString) ||
            data.login.toLowerCase().includes(searchString)
          );
        });
        break;
      default:
        filterData = data;
        break;
    }
  }

  const invoices = [
    {
      title: "INV001",
      phone: "Paid",
      address: "$250.00",
    },

    {
      title: "INV001",
      phone: "Paid",
      address: "$250.00",
    },

    {
      title: "INV001",
      phone: "Paid",
      address: "$250.00",
    },

    {
      title: "INV001",
      phone: "Paid",
      address: "$250.00",
    },

    {
      title: "INV001",
      phone: "Paid",
      address: "$250.00",
    },
  ];
  // const [data, setData] = useState([]);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   async function getData() {
  //     try {
  //       const res = await axios.get(`/api/${entityName}`, {
  //         next: { tags: [`${param}`] },
  //       });
  //       setTableData(res.data.data);
  //       setData(res.data.data);
  //     } catch (error) {
  //       console.log(error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //   getData();
  // }, [entityName, reflesh]);

  function getColumn(prop) {
    switch (prop) {
      case "branches":
        return branches;
      case "clients":
        return clients;
      case "deliver":
        return deliver;
      default:
        return null;
    }
  }

  return <DataTable columns={getColumn(param)} data={filterData} />;
}

export default Getelements;
