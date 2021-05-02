import * as React from "react";
import { InputField } from "../components";
import { Button, Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";
import { useCreatePostMutation, useMeQuery } from "../generated/graphql";
import { Layout } from "../components/Layout";
import { useIsAuth } from "../utils/hooks/useIsAuth";

interface iCreatePost {
    title: string;
    text: string;
}

const CreatePost = () => {
    const router = useRouter();
    const [, createPost] = useCreatePostMutation();
    const {
        register: reg,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<iCreatePost>({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    });
    const onSubmit = handleSubmit(async (values) => {
        console.log(values);
        await createPost({ input: values });
        router.push('/');
    });
    useIsAuth()

    return (
        <Layout variant="small">
            <form onSubmit={onSubmit}>
                <InputField
                    errors={errors.title}
                    register={reg('title', {
                        required: 'field is required',
                    })}
                    name="title"
                    placeholder="post title"
                />

                <InputField
                    errors={errors.text}
                    register={reg('text', {
                        required: 'field is required',
                    })}
                    name="text"
                    placeholder="post text"
                    textarea
                />

                <Flex mt={5} justify="space-around">
                    <Button
                        isLoading={isSubmitting}
                        loadingText="Submitting..."
                        colorScheme="purple"
                        variant="outline"
                        type="submit"
                        borderRadius="50px"
                        width="150px"
                    >
                        Create
                    </Button>
                </Flex>
            </form>
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient)(CreatePost);
