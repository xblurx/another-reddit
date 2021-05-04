import * as React from 'react';
import {
    Flex,
    Heading,
    IconButton,
    Skeleton,
    Tag,
    Text,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { RegularPostFragment, useVoteMutation } from '../generated/graphql';
import NextLink from 'next/link';

interface CardProps {
    loading: boolean;
    post: RegularPostFragment;
}

export const Card = (props: CardProps) => {
    const { loading } = props;
    const { id, title, text, points: rating, creator: author } = props.post;
    const [, upvote] = useVoteMutation();

    return (
        <Skeleton
            isLoaded={!loading}
            style={{
                borderRadius: '15px',
                width: '600px',
            }}
        >
            <NextLink href="/post/[id]" as={`/post/${id}`}>
                <Flex
                    role={'group'}
                    p={6}
                    boxShadow={'md'}
                    rounded={'lg'}
                    pos={'relative'}
                    _hover={{
                        transition: 'all .3s ease',
                        cursor: 'pointer',
                        color: 'pink.500',
                        boxShadow: 'xl',
                    }}
                >
                    <Flex direction="column" align="center">
                        <IconButton
                            variant="ghost"
                            colorScheme="cyan"
                            fontSize="30px"
                            aria-label="Send email"
                            icon={<ChevronUpIcon />}
                            onClick={() => upvote({ postId: id, value: 1 })}
                        />
                        <Text fontSize="xl">{rating}</Text>
                        <IconButton
                            variant="ghost"
                            colorScheme="cyan"
                            fontSize="30px"
                            aria-label="Send email"
                            icon={<ChevronDownIcon />}
                            onClick={() => upvote({ postId: id, value: -1 })}
                        />
                    </Flex>
                    <Flex direction="column" ml={3}>
                        <Heading
                            fontSize={'xl'}
                            fontFamily={'body'}
                            fontWeight={700}
                        >
                            {title}
                            <Tag
                                ml={3}
                                size="sm"
                                variant="solid"
                                borderRadius="full"
                                colorScheme="pink"
                            >
                                {author.username}
                            </Tag>
                        </Heading>
                        <Text mt={3} noOfLines={2}>
                            {text}
                        </Text>
                    </Flex>
                </Flex>
            </NextLink>
        </Skeleton>
    );
};
