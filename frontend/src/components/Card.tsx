import * as React from 'react';
import {
    Box,
    Heading,
    HStack,
    Skeleton,
    Stack,
    Tag,
    Text,
} from '@chakra-ui/react';

interface CardProps {
    loading: boolean;
    title: string | null;
    text: string;
    author: string;
    key: string | number;
    onClick?: () => void;
}

export const Card = (props: CardProps) => {
    const { title, text, author, loading, onClick } = props;

    return (
        <Skeleton
            key={title}
            isLoaded={!loading}
            style={{
                borderRadius: '15px',
                width: '600px',
            }}
        >
            <Box
                role={'group'}
                p={6}
                boxShadow={'md'}
                rounded={'lg'}
                pos={'relative'}
                onClick={onClick}
                _hover={{
                    transition: 'all .3s ease',
                    cursor: 'pointer',
                    color: 'pink.500',
                    boxShadow: 'xl',
                }}
            >
                <HStack>
                    <Heading
                        fontSize={'xl'}
                        fontFamily={'body'}
                        fontWeight={700}
                    >
                        {title}
                    </Heading>
                    <Tag
                        size="sm"
                        variant="solid"
                        borderRadius="full"
                        colorScheme="pink"
                    >
                        {author}
                    </Tag>
                </HStack>
                <Text mt={3} noOfLines={2}>
                    {text}
                </Text>
            </Box>
        </Skeleton>
    );
};
