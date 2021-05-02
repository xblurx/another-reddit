import React from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import { Button, Flex, Link } from '@chakra-ui/react';
import { InputField, Wrapper } from 'components';
import { useLoginMutation } from '../generated/graphql';
import { iLogin } from 'types';
import { createUrqlClient } from '../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';

const Login = () => {
    const router = useRouter();
    const [, login] = useLoginMutation();
    const {
        register: reg,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<iLogin>({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    });

    const onSubmit = handleSubmit(async (formData) => {
        const response = await login(formData);
        if (response.data?.login.errors) {
            const errors = response.data.login.errors;
            errors.forEach(({ field: name, message }) => {
                setError(name as 'usernameOrEmail' | 'password', { message });
            });
            return;
        }
        await router.push((router.query.next as string) ?? '/');
    });

    return (
        <Wrapper variant="small">
            <form onSubmit={onSubmit}>
                <InputField
                    errors={errors.usernameOrEmail}
                    register={reg('usernameOrEmail', {
                        required: 'field is required',
                    })}
                    name="usernameOrEmail"
                    placeholder="username or email"
                />

                <InputField
                    errors={errors.password}
                    register={reg('password', {
                        required: 'field is required',
                    })}
                    name="password"
                    placeholder="password"
                    type="password"
                />

                <Flex mt={4}>
                    <NextLink href="/forgot-password">
                        <Link
                            _hover={{
                                background: 'white',
                                color: 'purple.500',
                            }}
                        >
                            Forgot password?
                        </Link>
                    </NextLink>
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
                </Flex>
            </form>
        </Wrapper>
    );
};

export default withUrqlClient(createUrqlClient)(Login);
