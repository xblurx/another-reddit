import * as React from "react";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import { usePostQuery } from "../../generated/graphql";
import { Layout } from "../../components";
import { Box, Center, Flex, Heading, Spinner, Text } from "@chakra-ui/react";

export const Post = () => {
    const router = useRouter();
    const postId =
        typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;
    const [{ data, fetching, error }] = usePostQuery({
        pause: postId === -1,
        variables: {
            id: postId,
        },
    });

    if (fetching) {
        return (
            <Layout>
                <Spinner />
            </Layout>
        );
    }

    if (!data?.post) {
        return (
            <Layout>
                <Box>Post does not exists</Box>
            </Layout>
        );
    }

    return (
        <Layout>
            <Center>
                <Flex direction='column' justify='center' align='center'>
                    <Heading mt={10}>{data.post.title}</Heading>
                    <Text mt={10}>{data.post.text}</Text>
                </Flex>
            </Center>
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
