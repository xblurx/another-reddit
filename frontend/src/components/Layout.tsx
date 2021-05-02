import * as React from 'react';
import { Wrapper, WrapperVariantT } from './Wrapper';
import Navbar from './Navbar';

interface LayoutProps {
    variant: WrapperVariantT;
    children: React.ReactNode;
}

export const Layout = (props: LayoutProps) => {
    return (
        <>
            <Navbar />
            <Wrapper variant={props.variant}>{props.children}</Wrapper>
        </>
    );
};
