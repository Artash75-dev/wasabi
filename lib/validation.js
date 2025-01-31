import { z } from "zod";

export const ReviewsFormValidation = z.object({
  name: z
    .string()
    .min(2, "Имя должно содержать не менее 2 символов")
    .max(50, "Имя должно содержать не более 50 символов"),
  email: z.string().email("Неверный адрес электронной почты"),
  phone: z
    .string()
    .refine(
      (phone) => /^\+\d{10,15}$/.test(phone),
      "Неправильный номер телефона"
    ),
  message: z
    .string()
    .min(20, "Сообщение должно быть не менее 20 символов")
    .max(500, "Сообщение должно содержать не более 500 символов"),
});
export const TopCategory = z.object({
  name: z
    .string()
    .min(2, "Имя должно содержать не менее 2 символов")
    .max(50, "Имя должно содержать не более 30 символов"),
});
export const Category = z.object({
  name: z
    .string()
    .min(2, "Имя должно содержать не менее 2 символов")
    .max(100, "Имя должно содержать не более 100 символов"),
  topCategoryId: z.string().nonempty("Выберите одну из верхнюю категорий"),
});
export const Currency = z.object({
  sum: z.string().refine((val) => !isNaN(Number(val.replace(/\s/g, ""))), {
    message: "Неверная сумма",
  }),
});

export const Sertificate = z.object({
  name: z
    .string()
    .min(2, "Имя должно содержать не менее 2 символов")
    .max(30, "Имя должно содержать не более 30 символов"),
});
export const AdminValidate = z.object({
  name: z
    .string()
    .min(2, "Имя должно содержать не менее 2 символов")
    .max(30, "Имя должно содержать не более 30 символов"),
  password: z
    .string()
    .min(4, "Имя должно содержать не менее 2 символов")
    .max(30, "Имя должно содержать не более 30 символов"),
});

export const Product = z.object({
  name: z
    .string()
    .min(2, "Имя должно содержать не менее 2 символов")
    .max(100, "Имя должно содержать не более 100 символов"),
  categoryId: z.string().nonempty(),
  description: z
    .string()
    .min(10, "Сообщение должно быть не менее 10 символов")
    .max(500, "Сообщение должно содержать не более 500 символов"),
  feature: z.string(),
  price: z.string().min(1, "В это поле необходимо ввести информацию "),
  brand: z.string().min(1, "В это поле необходимо ввести информацию "),
});
export const Banner = z.object({
  productId: z.string().nonempty(),
});
export const LoginValidateDelivery = z.object({
  name: z
    .string()
    .min(2, "Имя не должен быть пустым")
    .max(50, "Имя должно содержать не более 50 символов"),
});
export const LoginValidateAdmin = z.object({
  name: z
    .string()
    .min(2, "Имя не должен быть пустым")
    .max(50, "Имя должно содержать не более 50 символов"),
  password: z.string().min(1, "Пароль не должен быть пустым"),
});

export const AddClientRevalidation = z.object({
  client_name: z
    .string()
    .min(2, "Клиента не должна быть пустым")
    .max(50, "Клиента должно содержать не более 50 символов"),
    birthday: z
    .string()
    .min(2, "Вы не ввели дату рождения"),
  phone: z.string().min(13, "Введите полный номер телефона"),
  client_sex:z.string().min(1, "Вы не выбрали пол"),
  client_groups_id:z.string().min(1, "Вы не выбрали пол"),
  address: z.string().min(1, "Вы не указали адрес проживания"),
  comment: z.string().min(1, "Введите букву об адресе, например, дом 3, квартира 12а..."),
  location: z.object({
    latitude: z
      .number({ invalid_type_error: "Широта должна быть числом" })
      .refine((value) => value !== null && !isNaN(value), "Широта обязательна"),
    longitude: z
      .number({ invalid_type_error: "Долгота должна быть числом" })
      .refine(
        (value) => value !== null && !isNaN(value),
        "Долгота обязательна"
      ),
  }),
});
