import React from 'react';
import Navbar from '../components/Navbar';
import { Center, Heading } from '@chakra-ui/react';

const Index = () => {
    return (
        <>
            <Navbar />
            <Center mt='30vh'>
                <Heading> hello world</Heading>
            </Center>
        </>
    );
};

export default Index;
