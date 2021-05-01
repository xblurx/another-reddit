import * as React from 'react';
import { Box, Button, Flex } from '@chakra-ui/react';
import { useForgotPasswordMutation } from '../generated/graphql';
import { InputField, Wrapper } from '../components';
import { useForm } from 'react-hook-form';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';

interface iEmail {
    email: string;
}

export const ForgotPassword = () => {
    const [{ fetching }, forgotPassword] = useForgotPasswordMutation();
    const {
        register: reg,
        handleSubmit,
        formState: { errors, isSubmitSuccessful },
    } = useForm<iEmail>({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    });

    const validateEmail = (value: string) => {
        if (!/^.+@.+\.com/.test(value)) {
            return 'invalid email';
        }
        return true;
    };

    const onSubmit = handleSubmit((values) => forgotPassword(values));

    return (
        <Wrapper variant="small">
            <form onSubmit={onSubmit}>
                <InputField
                    errors={errors.email}
                    register={reg('email', {
                        required: 'field is required',
                        validate: validateEmail,
                    })}
                    name="email"
                    type="email"
                    placeholder="email"
                />
                {isSubmitSuccessful && (
                    <Box mt={5} color="green.500">
                        If the email is correct, we sent to you a password reset
                        link
                    </Box>
                )}

                <Flex mt={5}>
                    <Button
                        isLoading={fetching}
                        loadingText="Submitting..."
                        colorScheme="purple"
                        variant="outline"
                        type="submit"
                        borderRadius="50px"
                        width="150px"
                    >
                        Reset password
                    </Button>
                </Flex>
            </form>
        </Wrapper>
    );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
