import { Input } from "../ui/input";
import PhoneInput from "react-phone-number-input";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";
import CurrencyInput from "react-currency-input-field";
import { PasswordInput } from "../ui/password-input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useState } from "react";

export const FormFieldType = {
  INPUT: "input",
  PASSWORDINPUT: "passwordInput",
  TEXTAREA: "textarea",
  PHONE_INPUT: "phoneInput",
  CHECKBOX: "checkbox",
  DATE_PICKER: "datePicker",
  SELECT: "select",
  SKELETON: "skeleton",
  CURRENCY: "currency",
};

const RenderInput = ({ field, className, props }) => {
  switch (props.fieldType) {
    case FormFieldType.INPUT:
      return (
        <FormControl>
          <Input
            placeholder={props.placeholder}
            {...field}
            value={field.value || ""} // Ensure the input is controlled
            className={cn(
              "textBig focus:border-primary",
              props.className,
              className
            )}
          />
        </FormControl>
      );
    case FormFieldType.NUMBER:
      return (
        <FormControl>
          <Input
            type="number"
            placeholder={props.placeholder}
            {...field}
            value={field.value || ""} // Ensure the input is controlled
            className={cn(
              "textBig focus:border-primary",
              props.className,
              className
            )}
          />
        </FormControl>
      );
    case FormFieldType.PASSWORDINPUT:
      return (
        <FormControl>
          <PasswordInput
            placeholder={props.placeholder}
            {...field}
            value={field.value || ""} // Ensure the input is controlled
            className={cn(
              "textBig focus:border-primary",
              props.className,
              className
            )}
          />
        </FormControl>
      );
    case FormFieldType.TEXTAREA:
      return (
        <FormControl>
          <Textarea
            placeholder={props.placeholder}
            {...field}
            value={field.value || ""} // Ensure the textarea is controlled
            className={cn(
              "shad-textArea focus:border-primary",
              props.className,
              className
            )}
            disabled={props.disabled}
          />
        </FormControl>
      );
    case FormFieldType.DATE_PICKER:
      return (
        <FormControl>
          <Input
            type="date"
            placeholder={props.placeholder}
            {...field}
            value={field.value || ""} // Ensure the input is controlled
            className={cn(
              "textBig focus:border-primary",
              props.className,
              className
            )}
          />
        </FormControl>
      );
    case FormFieldType.SELECT:
      return (
        <FormControl>
          <Select
            value={field.value || ""} // Ensure the select is controlled
            onValueChange={field.onChange}
          >
            <FormControl>
              <SelectTrigger
                className={cn(
                  "shad-select-trigger  border-b-2 border-border",
                  props.className,
                  className
                )}
              >
                <SelectValue placeholder={props.placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className={cn("shad-select-content z-[99999]")}>
              {props.children}
            </SelectContent>
          </Select>
        </FormControl>
      );
    case FormFieldType.PHONE_INPUT:
      return (
        <FormControl>
          <PhoneInput
            defaultCountry="UZ"
            placeholder={props.placeholder}
            international
            withCountryCallingCode
            value={field.value || ""} // Ensure the phone input is controlled
            onChange={field.onChange}
            className={cn(
              "input-phone rounded-md ",
              props.className,
              className
            )}
            style={{ borderColor: "transparent" }} // or borderColor: 'initial' to reset
          />
        </FormControl>
      );
    case FormFieldType.CURRENCY:
      return (
        <FormControl>
          <CurrencyInput
            placeholder={props.placeholder}
            className={cn(
              "w-full p-2 rounded-md custom-currency-input",
              props.className,
              className
            )}
            value={field.value || ""}
            onValueChange={(value, name) => {
              if (!value || !isNaN(value.replace(/\s/g, ""))) {
                field.onChange(value);
              } else {
                // Log and reset if invalid input occurs
                console.error("Invalid input: not a number");
                field.onChange("");
              }
            }}
            step={0.01}
            allowDecimals
            decimalSeparator="."
            groupSeparator=" "
            decimalsLimit={8} // Limit decimal points to 8
            prefix=""
            disableAbbreviations // Prevents K/M abbreviations
            onBlur={() => {
              // Ensure the field is cleared if no valid number is present
              if (isNaN(Number(field.value.replace(/\s/g, "")))) {
                field.onChange("");
              }
            }}
          />
        </FormControl>
      );

    case FormFieldType.SKELETON:
      return props.renderSkeleton ? props.renderSkeleton(field) : null;
    default:
      return null;
  }
};

const CustomFormField = (props) => {
  const { control, name, label, inputClass } = props;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex-1">
          {props.fieldType !== FormFieldType.CHECKBOX && label && (
            <FormLabel className="text-xs lg:text-base">{label}</FormLabel>
          )}
          <RenderInput
            className={cn(inputClass, "text-xs lg:text-base bg-transparent")}
            field={field}
            props={props}
          />

          <FormMessage className="shad-error" />
        </FormItem>
      )}
    />
  );
};

export default CustomFormField;
