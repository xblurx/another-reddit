import React, { InputHTMLAttributes } from 'react';
import { FormControl, FormErrorMessage, Input } from '@chakra-ui/react';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    errors: any;
    register: any;
    name: string;
    placeholder: string;
};

export const InputField = (props: InputFieldProps) => {
    const { errors, register, name, placeholder, ...rest } = props;
    return (
        <FormControl mt={6} isInvalid={!!errors}>
            <Input
                name={name}
                placeholder={placeholder}
                focusBorderColor="#B794F4"
                {...register}
                {...rest}
            />
            <FormErrorMessage>{errors && errors.message}</FormErrorMessage>
        </FormControl>
    );
};
