import React from 'react';
import { useMutation } from 'urql';
import { Button, Stack, VStack } from '@chakra-ui/react';
import { iRegister } from '../types';
import { Wrapper } from '../components/Wrapper';
import { InputField } from '../components/InputField';
import { REGISTER_MUT } from '../graphql/mutations';
import { useForm } from 'react-hook-form';

interface RegisterProps {}

const Register = (props: RegisterProps) => {
    const [, register] = useMutation(REGISTER_MUT);
    const {
        register: reg,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<iRegister>();

    const onSubmit = handleSubmit((data) => {
        console.log(data);
        register(data);
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
