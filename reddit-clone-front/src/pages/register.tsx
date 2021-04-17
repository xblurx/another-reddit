import { Button, Stack, useToast, VStack } from "@chakra-ui/react";
import React from "react";
import { iRegister } from "../types";
import { useFormLogic } from "../utils/hooks";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";

interface RegisterProps {}

const Register = (props: RegisterProps) => {
  const {
    formData,
    onSubmit,
    errors,
    register,
    isSubmitting,
  } = useFormLogic<iRegister>();
  const toast = useToast();

  return (
    <Wrapper variant='small'>
      <form onSubmit={onSubmit}>
        <VStack mt={5} spacing={10}>
          <InputField
            errors={errors.username}
            register={register("username", { required: true })}
            name="username"
            placeholder="username"
          />

          <InputField
            errors={errors.password}
            register={register("password", { required: true })}
            name="password"
            placeholder="Password"
            type="password"
          />

          <Stack mt={5} direction="row" spacing={4}>
            <Button
              isLoading={isSubmitting}
              loadingText="Submitting..."
              colorScheme="purple"
              variant="outline"
              type="submit"
              borderRadius="50px"
              width='150px'
            >
              Register
            </Button>
          </Stack>
        </VStack>
      </form>
    </Wrapper>
  );
};

export default Register;
