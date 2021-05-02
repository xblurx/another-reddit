import React, { InputHTMLAttributes } from 'react';
import {
    FormControl,
    FormErrorMessage,
    Input,
    Textarea,
} from '@chakra-ui/react';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    errors: any;
    register: any;
    name: string;
    placeholder: string;
    textarea?: boolean;
};

export const InputField = (props: InputFieldProps) => {
    const { errors, register, name, placeholder, textarea, ...rest } = props;
    const ComponentVariant = textarea ? Textarea : Input;

    return (
        <FormControl mt={6} isInvalid={!!errors}>
            <ComponentVariant
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
