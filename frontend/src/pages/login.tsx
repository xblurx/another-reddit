import React from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { Button, Stack, VStack } from '@chakra-ui/react';
import { InputField, Wrapper } from 'components';
import { useLoginMutation } from '../generated/graphql';
import { iLogin } from 'types';
import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";

const Login = () => {
    const router = useRouter();
    const [, login] = useLoginMutation();
    const {
        register: reg,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<iLogin>();

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

    return (
        <Wrapper variant="small">
            <form onSubmit={onSubmit}>
                <VStack mt={5} spacing={10}>
                    <InputField
                        errors={errors.usernameOrEmail}
                        register={reg('usernameOrEmail', { required: true })}
                        name="usernameOrEmail"
                        placeholder="username or email"
                    />

                    <InputField
                        errors={errors.password}
                        register={reg('password', { required: true })}
                        name="password"
                        placeholder="password"
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
                            width="150px"
                        >
                            Log in
                        </Button>
                    </Stack>
                </VStack>
            </form>
        </Wrapper>
    );
};

export default withUrqlClient(createUrqlClient)( Login)
