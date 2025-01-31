import {
  customerIcon,
  dashIcon,
  deliverIcon,
  locationIcon,
  menuIcon,
  timeIcon,
} from "@/public/images";

const navLinks = [
  {
    id: 1,
    title: "Главная страница",
    link: "/admin",
    icon: dashIcon,
  },
  {
    id: 2,
    title: "Заказы",
    link: "/admin/orders",
    icon: timeIcon,
  },
  {
    id: 3,
    title: "Филиалы",
    link: "/admin/branches",
    icon: locationIcon,
  },
  {
    id: 4,
    title: "Меню",
    link: "/admin/menu",
    icon: menuIcon,
  },
  {
    id: 5,
    title: "Клиенты",
    link: "/admin/clients",
    icon: customerIcon,
  },
  {
    id: 6,
    title: "Доставщики",
    link: "/admin/deliver",
    icon: deliverIcon,
  },
];

const statusData = [
  { status: "created", title: "Созданный" },
  { status: "cooking", title: "Подготовка" },
  { status: "waiting", title: "Ожидается" },
  { status: "in-deliver", title: "В доставке" },
  { status: "finished", title: "Завершено" },
  { status: "cancelled", title: "Отменено" },
];
const orderStatusData = [
  { status: "all", title: "Все" },
  { status: "created", title: "Созданный" },
  { status: "cooking", title: "Подготовка" },
  { status: "waiting", title: "Ожидается" },
  { status: "in-deliver", title: "В доставке" },
  { status: "finished", title: "Завершено" },
  { status: "cancelled", title: "Отменено" },
];

const ordersData = [
  {
    id: 1,
    status: "expected",
    client: "Client 1",
    deliverer: "Deliverer 1",
    branch: "Branch 1",
    time: "18:30 01.01.2024",
  },
  {
    id: 2,
    status: "expected",
    client: "Client 1",
    deliverer: "Deliverer 1",
    branch: "Branch 1",
    time: "18:30 01.01.2024",
  },
  {
    id: 3,
    status: "expected",
    client: "Client 1",
    deliverer: "Deliverer 1",
    branch: "Branch 1",
    time: "18:30 01.01.2024",
  },
  {
    id: 4,
    status: "progress",
    client: "Client 2",
    deliverer: "Deliverer 2",
    branch: "Branch 2",
    time: "18:30 01.01.2024",
  },
  {
    id: 5,
    status: "delivered",
    client: "Client 3",
    deliverer: "Deliverer 3",
    branch: "Branch 3",
    time: "18:30 01.01.2024",
  },
  {
    id: 6,
    status: "completed",
    client: "Client 4",
    deliverer: "Deliverer 4",
    branch: "Branch 4",
    time: "18:30 01.01.2024",
  },
  {
    id: 7,
    status: "progress",
    client: "Client 2",
    deliverer: "Deliverer 2",
    branch: "Branch 2",
    time: "18:30 01.01.2024",
  },

  {
    id: 8,
    status: "completed",
    client: "Client 4",
    deliverer: "Deliverer 4",
    branch: "Branch 4",
    time: "18:30 01.01.2024",
  },
  {
    id: 9,
    status: "completed",
    client: "Client 4",
    deliverer: "Deliverer 4",
    branch: "Branch 4",
    time: "18:30 01.01.2024",
  },
  {
    id: 10,
    status: "completed",
    client: "Client 4",
    deliverer: "Deliverer 4",
    branch: "Branch 4",
    time: "18:30 01.01.2024",
  },
];

export { navLinks, statusData, orderStatusData, ordersData };

export const LOCATION = {
  center: [37.623082, 55.75254], // starting position [lng, lat]
  zoom: 9, // starting zoom
};

// Array containing data for markers
export const markerProps = [
  {
    coordinates: [37.623, 55.752],
    iconSrc:
      "https://yastatic.net/s3/front-maps-static/maps-front-jsapi-3/examples/images/marker-custom-icon/yellow-capybara.png",
    message: "I'm yellow capybara!",
  },
  {
    coordinates: [38.125, 55.622],
    iconSrc:
      "https://yastatic.net/s3/front-maps-static/maps-front-jsapi-3/examples/images/marker-custom-icon/purple-capybara.png",
    message: "I'm purple capybara!",
  },
  {
    coordinates: [37.295, 55.415],
    iconSrc:
      "https://yastatic.net/s3/front-maps-static/maps-front-jsapi-3/examples/images/marker-custom-icon/green-capybara.png",
    message: "I'm green capybara!",
  },
];
