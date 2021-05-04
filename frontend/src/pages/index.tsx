import React from 'react';
import {
    Box,
    Button,
    Center,
    Heading,
    Spinner,
    VStack,
} from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { usePostsQuery } from '../generated/graphql';
import { Card, Layout } from 'components';
import { useRouter } from 'next/router';

const Index = () => {
    const router = useRouter();
    const [{ fetching, data }] = usePostsQuery({
        variables: {
            limit: 10,
        },
    });

    const posts = data
        ? data.posts.map((p) => (
              <Card key={p.title} loading={fetching} post={p} />
          ))
        : null;

    return (
        <Layout>
            <Center>
                <Heading> hello world</Heading>
                <Button onClick={() => router.push('/create-post')}>
                    Create post
                </Button>
            </Center>
            <Box p={5}>
                <VStack spacing={8}>{posts}</VStack>
            </Box>
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
