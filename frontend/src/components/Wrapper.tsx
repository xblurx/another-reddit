import React, { ReactNode } from 'react';
import { Box } from '@chakra-ui/react';

export type WrapperVariantT = 'regular' | 'small';

interface WrapperProps {
    variant?: WrapperVariantT;
    children: ReactNode;
}

export const Wrapper = ({
    variant = 'regular',
    children,
    ...rest
}: WrapperProps) => {
    return (
        <Box
            mx="auto"
            maxW={variant === 'regular' ? '700px' : '400px'}
            w="100%"
            {...rest}
        >
            {children}
        </Box>
    );
};
