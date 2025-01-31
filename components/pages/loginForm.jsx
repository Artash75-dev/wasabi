"use client";

import React, { useState, useEffect } from "react";
import { Form } from "../ui/form";
import CustomFormField, { FormFieldType } from "../shared/customFormField";
import SubmitButton from "../shared/submitButton";
import { useForm } from "react-hook-form";
import { LoginValidateAdmin, LoginValidateDelivery } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState("admin"); // Default role is "admin"

  // Create form with initial resolver based on default role
  const form = useForm({
    resolver: zodResolver(
      role === "admin" ? LoginValidateAdmin : LoginValidateDelivery
    ),
    defaultValues: {
      name: "",
      password: "",
    },
  });

  useEffect(() => {
    // Update the resolver dynamically when the role changes
    form.reset();
    form.setValue("name", "");
    form.setValue("password", "");
  }, [role, form]);

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      let res;
      if (role === "admin") {
        // Admin request
        res = await axios.post("/api/login?role=admin", {
          login: values.name,
          password: values.password,
        });
      } else if (role === "delivery") {
        // Delivery request
        res = await axios.post("/api/login?role=delivery", {
          login: values.name,
        });
      }

      const { role: responseRole } = res.data;

      if (responseRole === "admin") {
        Cookies.set("auth", JSON.stringify(res.data), { expires: 1 });
        Cookies.set(
          "extraTime",
          new Date(Date.now() + 86400000).toISOString(),
          { expires: 1 }
        );
        window.location.replace("/admin");
      } else if (responseRole === "delivery") {
        Cookies.set("auth", JSON.stringify(res.data), { expires: 1 });
        Cookies.set(
          "extraTime",
          new Date(Date.now() + 86400000).toISOString(),
          { expires: 1 }
        );
        window.location.replace("/delivery");
      } else {
        toast.error("Role not found.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Неправильное имя пользователя или пароль."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-[400px] max-sm:w-10/12 space-y-4 w-full bg-card rounded-md p-10"
      >
        <h1 className="text-center text-gray-700 textNormal3 font-semibold mb-5">
          Вход
        </h1>

        {/* Role Selection */}
        <div className="w-full mb-4">
          <Select onValueChange={handleRoleChange}>
            <SelectTrigger className="text-xs lg:text-base bg-transparent border-input border-2 rounded-md">
              <SelectValue placeholder="Выберите роль" />
            </SelectTrigger>
            <SelectContent className="shad-select-content z-[99999]">
              <SelectItem value="admin">Админ</SelectItem>
              <SelectItem value="delivery">Доставщик</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full space-y-6">
          {/* Login Field */}
          <CustomFormField
            fieldType={FormFieldType.INPUT}
            control={form.control}
            name="name"
            placeholder="Логин"
            inputClass="rounded-md border-2"
          />

          {/* Password Field (display only if role is admin) */}
          {role === "admin" && (
            <CustomFormField
              fieldType={FormFieldType.PASSWORDINPUT}
              control={form.control}
              name="password"
              placeholder="Пароль"
              inputClass="rounded-md border-2"
            />
          )}
        </div>

        <SubmitButton
          isLoading={isLoading}
          className="w-full bg-secondary hover:bg-secondary-foreground"
        >
          Войти
        </SubmitButton>
      </form>
    </Form>
  );
}
