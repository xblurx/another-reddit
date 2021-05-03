import * as React from 'react';
import { Wrapper, WrapperVariantT } from './Wrapper';
import Navbar from './Navbar';

interface LayoutProps {
    variant?: WrapperVariantT;
    children: React.ReactNode;
}

export const Layout = ({ variant, children, ...rest }: LayoutProps) => {
    return (
        <>
            <Navbar />
            <Wrapper variant={variant} {...rest}>
                {children}
            </Wrapper>
        </>
    );
};
