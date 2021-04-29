import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { Button, Checkbox, Flex } from "@chakra-ui/react";
import { InputField, Wrapper } from "components";
import { useForgotPasswordMutation, useLoginMutation } from "../generated/graphql";
import { iLogin } from "types";
import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";

const Login = () => {
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const router = useRouter();
    const [, login] = useLoginMutation();
    const [, forgotPassword] = useForgotPasswordMutation();
    const {
        trigger,
        getValues,
        register: reg,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<iLogin>({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    });

    const validateEmail = (value: string) => {
        if (!/^.+@.+\.com/.test(value)) {
            return 'email invalid';
        }
        return true;
    };

    const onSubmit = handleSubmit(async (formData) => {
        const response = await login(formData);
        if (response.data?.login.errors) {
            const errors = response.data.login.errors;
            errors.forEach(({ field: name, message }) => {
                setError(name as 'usernameOrEmail' | 'password', { message });
            });
            return;
        }
        await router.push('/');
    });

    const handleCheckboxChange = () => {
        trigger('usernameOrEmail');
        setIsForgotPassword(!isForgotPassword);
    };

    useEffect(() => {
        console.log(`isforgotpass: ${isForgotPassword}`);
    }, [isForgotPassword]);

    return (
        <Wrapper variant="small">
            <form onSubmit={onSubmit}>
                <InputField
                    errors={errors.usernameOrEmail}
                    register={reg(
                        'usernameOrEmail',
                        isForgotPassword
                            ? {
                                  validate: validateEmail,
                              }
                            : { required: 'field is required'}
                    )}
                    name="usernameOrEmail"
                    placeholder="username or email"
                />

                <InputField
                    errors={errors.password}
                    register={reg('password', {
                        required: 'the field is required',
                    })}
                    name="password"
                    placeholder="password"
                    type="password"
                />

                <Flex mt={4}>
                    <Checkbox
                        isChecked={isForgotPassword}
                        onChange={handleCheckboxChange}
                        colorScheme="red"
                    >
                        Forgot password?
                    </Checkbox>
                </Flex>

                <Flex mt={5} justify="space-around">
                    <Button
                        isLoading={isSubmitting}
                        loadingText="Submitting..."
                        colorScheme="purple"
                        variant="outline"
                        type="submit"
                        borderRadius="50px"
                        width="150px"
                    >
                        Log in
                    </Button>
                    {isForgotPassword && (
                        <Button
                            colorScheme="red"
                            variant="outline"
                            borderRadius="50px"
                            width="150px"
                            onClick={() => {
                                !errors.usernameOrEmail
                                    ? forgotPassword({
                                          email: getValues('usernameOrEmail'),
                                      })
                                    : undefined;
                            }}
                        >
                            Reset password
                        </Button>
                    )}
                </Flex>
            </form>
        </Wrapper>
    );
};

export default withUrqlClient(createUrqlClient)(Login);
