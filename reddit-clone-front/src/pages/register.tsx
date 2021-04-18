import React from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { Button, Stack, VStack } from '@chakra-ui/react';
import { iRegister } from '../types';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { useRegisterMutation } from '../generated/graphql';

interface RegisterProps {}

const Register = (props: RegisterProps) => {
    const router = useRouter();
    const [, register] = useRegisterMutation();
    const {
        register: reg,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<iRegister>();

    const onSubmit = handleSubmit(async (formData) => {
        const response = await register(formData);
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

export default Register;
