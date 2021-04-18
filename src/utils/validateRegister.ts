import { FieldError, UsernamePasswordInput } from '../resolvers';

export const validateRegister = (
    options: UsernamePasswordInput
): FieldError[] | null => {

    if (options.username.trim().length <= 2) {
        return [
            {
                field: 'username',
                message: 'length must be greater than 2',
            },
        ];
    }

    if (options.username.includes('@')) {
        return [
            {
                field: 'username',
                message: 'cannot include an @',
            },
        ];
    }

    if (options.password.trim().length <= 2) {
        return [
            {
                field: 'password',
                message: 'length must be greater than 2',
            },
        ];
    }
    return null;
};
