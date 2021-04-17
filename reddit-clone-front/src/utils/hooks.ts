import { useForm } from "react-hook-form";
import { useState } from "react";
import { iRegister } from "../types";

export const useFormLogic = <T extends Record<string, any>>() => {
  const [formData, setFormData] = useState<T | {}>({});
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    register,
    reset,
  } = useForm<T>({
    mode: "onBlur",
    reValidateMode: "onChange",
  });
  const onSubmit = handleSubmit((data) => {
    setFormData(data);
  });

  return {
    formData,
    onSubmit,
    errors,
    register,
    reset,
    isSubmitting,
  };
};
