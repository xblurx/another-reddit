import React from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { Button, Stack, VStack } from '@chakra-ui/react';
import { iRegister } from '../types';
import { Wrapper, InputField } from 'components';
import { useRegisterMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';

const Register = () => {
    const router = useRouter();
    const [, register] = useRegisterMutation();
    const {
        register: reg,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<iRegister>();

    const onSubmit = handleSubmit(async (formData) => {
        const response = await register({ options: formData });
        if (response.data?.register.errors) {
            const errors = response.data.register.errors;
            errors.forEach(({ field: name, message }) => {
                setError(name as 'username' | 'password', { message });
            });
            return;
        }
        router.push('/');
    });

    return (
        <Wrapper variant="small">
            <form onSubmit={onSubmit}>
                <VStack mt={5} spacing={10}>
                    <InputField
                        errors={errors.username}
                        register={reg('username', { required: true })}
                        name="username"
                        placeholder="username"
                    />

                    <InputField
                        errors={errors.email}
                        register={reg('email', {
                            required: 'required',
                            pattern: {
                                value: /\S+@\S+.\S+/,
                                message:
                                    'Entered value does not match email format',
                            },
                        })}
                        name="email"
                        placeholder="email"
                        type="email"
                    />

                    <InputField
                        errors={errors.password}
                        register={reg('password', { required: true })}
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
                            width="150px"
                        >
                            Register
                        </Button>
                    </Stack>
                </VStack>
            </form>
        </Wrapper>
    );
};

export default withUrqlClient(createUrqlClient)(Register);
