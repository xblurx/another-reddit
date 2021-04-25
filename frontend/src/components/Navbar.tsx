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
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';

const Navbar = () => {
    const [{ data }] = useMeQuery({
        pause: isServer(),
    });
    const [{ fetching }, logout] = useLogoutMutation();
    let body = null;

    if (!data?.me) {
        body = (
            <>
                <Box mr={5}>
                    <Link as={NextLink} href="/login">
                        Log in
                    </Link>
                </Box>
                <NextLink href="/register">
                    <Button colorScheme="pink" variant="link">
                        Sign Up
                    </Button>
                </NextLink>
            </>
        );
    } else {
        body = (
            <Flex>
                <Text mr={5}>Hello, {data.me.username}</Text>
                <Button
                    onClick={() => logout()}
                    isLoading={fetching}
                    colorScheme="pink"
                    variant="link"
                >
                    Log out
                </Button>
            </Flex>
        );
    }

    return (
        <>
            <Flex p={6}>
                <Box p="2">
                    <Heading size="md">
                        <Link as={NextLink} href="/">
                            Re[dd]it
                        </Link>
                    </Heading>
                </Box>
                <Spacer />
                <Flex align="baseline" justify="space-between">
                    {body}
                </Flex>
            </Flex>
        </>
    );
};

export default Navbar;
