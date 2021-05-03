import { Arg, Ctx, Field, InputType, Int, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { Post } from "../entities";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";

@InputType()
class PostInput {
    @Field()
    title: string;
    @Field()
    text: string;
}

@Resolver(Post)
export class PostResolver {
    @Query(() => [Post])
    async posts(
        @Arg('limit', () => Int) limit: number,
        @Arg('cursor', () => String, { nullable: true }) cursor: string | null
    ): Promise<Post[]> {
        const realLimit = Math.min(50, limit);
        const replacements: any[] = [realLimit];

        if (cursor) {
            replacements.push(new Date(parseInt(cursor)));
        }

        //     const posts = await getConnection().query(
        // `
        //     select p.*
        //     from post p
        //     ${cursor ? `where p."createdAt" < $2` : ''}
        //     order by p."createdAt" DESC
        //     limit $1
        //     `,
        //     replacements
        //     );

        const posts = await getConnection().query(
            `
            select p.*,
            json_build_object(
            'id', u.id,
            'username', u.username,
            'email', u.email
            ) creator
            from post p
            inner join public.user u on u.id = p."creatorId"
            ${cursor ? `where p."createdAt" < $2` : ''}
            order by p."createdAt" DESC
            limit $1
            `,
            replacements
        );

        return posts;

        //     const qb = getConnection()
        //         .getRepository(Post)
        //         .createQueryBuilder('p')
        //         .innerJoinAndSelect('p.creator', 'u', 'u.id = p."creatorId"', {
        //             isRemoved: false,
        //         })
        //         .orderBy('p."createdAt"', 'DESC')
        //         .take(realLimit);
        //
        //     if (cursor) {
        //         qb.where('p."createdAt" < :cursor', {
        //             cursor: new Date(parseInt(cursor)),
        //         });
        //     }
        //     return qb.getMany();
    }

    @Query(() => Post, { nullable: true })
    async post(@Arg('id') id: number): Promise<Post | undefined> {
        return Post.findOne(id);
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg('input') input: PostInput,
        @Ctx() { req }: MyContext
    ): Promise<Post> {
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

    @Mutation(() => Boolean)
    // @UseMiddleware(isAuth)
    async upvote(
        @Arg('postId', () => Int) postId: number,
        @Arg('value', () => Int) value: number,
        @Ctx() { req }: MyContext
    ) {
        const { userId } = req.session;
        return userId === undefined;

        const isUpvote = value !== -1;
        const realValue = isUpvote ? 1 : -1;
        // await Upvote.insert({
        //     userId,
        //     postId,
        //     value: realValue,
        // });
        await getConnection().query(
            `
        start transaction;
        insert into upvote ("userId", "postId", value)
        values(${userId}, ${postId}, ${realValue});
        update post 
        set points = points + ${realValue}
        where id = ${postId};
        commit;
        `
        );
        return true;
    }
}
