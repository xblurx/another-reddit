import React from 'react';
import NextLink from 'next/link';
import {
    Box,
    Button,
    Flex,
    Heading,
    Link,
    Spacer,
    Text,
} from '@chakra-ui/react';
import { useMeQuery } from '../generated/graphql';

const Navbar = () => {
    const [{ data }] = useMeQuery();
    let body = null;

    console.log(data?.me);

    if (!data?.me) {
        body = (
            <>
                <Box mr={5}>
                    <Link as={NextLink} href="/login">
                        Log in
                    </Link>
                </Box>
                <NextLink href="/register">
                    <Button colorScheme="pink" as="a" size="sm">
                        Sign Up
                    </Button>
                </NextLink>
            </>
        );
    } else {
        body = <Text>Hello, {data.me.username}</Text>;
    }

    return (
        <>
            <Flex p={6}>
                <Box p="2">
                    <Heading size="md">
                        <Link as={NextLink} href="/">
                            Re[d/d]it
                        </Link>
                    </Heading>
                </Box>
                <Spacer />
                <Flex align="baseline">{body}</Flex>
            </Flex>
        </>
    );
};

export default Navbar;
