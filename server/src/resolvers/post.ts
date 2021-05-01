import {
    Arg,
    Ctx,
    Field,
    InputType,
    Mutation,
    Query,
    Resolver,
} from 'type-graphql';
import { Post } from '../entities';
import { MyContext } from '../types';

@InputType()
class PostInput {
    @Field()
    title: string;
    @Field()
    text: string;
}

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    async posts(): Promise<Post[]> {
        return Post.find();
    }
    @Query(() => Post, { nullable: true })
    async post(@Arg('id') id: number): Promise<Post | undefined> {
        return Post.findOne(id);
    }
    @Mutation(() => Post)
    async createPost(
        @Arg('input') input: PostInput,
        @Ctx() { req }: MyContext
    ): Promise<Post> {
        if (!req.session.userId) {
            throw new Error('not authenticated');
        }
        return Post.create({ ...input, creatorId: req.session.userId }).save();
    }
    @Mutation(() => Post, { nullable: true })
    async updatePost(
        @Arg('id') id: number,
        @Arg('title', () => String, { nullable: true }) title: string
    ): Promise<Post | null> {
        const post = await Post.findOne(id);
        if (!post) {
            return null;
        }
        if (typeof title !== 'undefined') {
            post.title = title;
            await Post.update({ id }, { title });
        }
        return post;
    }
    @Mutation(() => Boolean)
    async deletePost(@Arg('id') id: number): Promise<boolean> {
        const deleted = await Post.delete(id);
        return !!deleted.affected;
    }
}
