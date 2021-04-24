import React from 'react';
import Navbar from '../components/Navbar';
import { Box, Center, Heading, Spinner, Text } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { usePostsQuery } from '../generated/graphql';

const Index = () => {
    const [{ fetching, data }] = usePostsQuery();
    const posts = data
        ? data.posts.map((p) => <Text key={p.id}>{p.title}</Text>)
        : null;

    return (
        <>
            <Navbar />
            <Center mt="30vh">
                <Heading> hello world</Heading>
            </Center>
            <Box p={5}>{fetching ? <Spinner /> : posts}</Box>
        </>
    );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
