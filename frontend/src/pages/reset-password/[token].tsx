import React, { useState } from 'react';
import { NextPage } from 'next';
import { InputField, Wrapper } from 'components';
import { Alert, AlertIcon, Button, Stack, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useChangePasswordMutation } from '../../generated/graphql';
import { useForm } from 'react-hook-form';
import { toErrorMap } from '../../utils/toErrorMap';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../../utils/createUrqlClient';

interface iChangePassword {
    newPassword: string;
}

const ChangePassword = () => {
    const [tokenError, setTokenError] = useState('');
    const router = useRouter();
    const [, changePassword] = useChangePasswordMutation();
    const {
        register: reg,
        handleSubmit,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<iChangePassword>();

    const onSubmit = handleSubmit(async (formData) => {
        const response = await changePassword({
            token: (router.query.token as string) ?? '',
            newPassword: formData.newPassword,
        });
        if (response.data?.changePassword.errors) {
            const errors = response.data.changePassword.errors;
            const errorMap = toErrorMap(errors);
            if ('token' in errorMap) {
                setTokenError(errorMap.token);
            }
            errors.forEach(({ field: name, message }) => {
                setError(name as 'newPassword', { message });
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
                        errors={errors.newPassword}
                        register={reg('newPassword', { required: true })}
                        name="newPassword"
                        placeholder="new password"
                        type="password"
                    />
                    {!!tokenError && (
                        <Alert status="error">
                            <AlertIcon />
                            {tokenError}
                        </Alert>
                    )}

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
                            Reset
                        </Button>
                    </Stack>
                </VStack>
            </form>
        </Wrapper>
    );
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
