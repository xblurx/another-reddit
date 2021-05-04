import { Arg, Ctx, Field, InputType, Int, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { Post } from "../entities";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";
import { Upvote } from "../entities/Upvote";

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
    async post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
        return Post.findOne(id, { relations: ['creator'] });
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
    @UseMiddleware(isAuth)
    async updatePost(
        @Arg('id') id: number,
        @Arg('title') title: string,
        @Arg('text') text: string,
        @Ctx() { req }: MyContext
    ): Promise<Post | null> {
        const result = await getConnection()
            .createQueryBuilder()
            .update(Post)
            .set({ title, text })
            .where('id = :id and "creatorId" = :creatorId', {
                id,
                creatorId: req.session.userId,
            })
            .returning('*')
            .execute();

        return result.raw[0];
    }

    @Mutation(() => Boolean)
    async deletePost(
        @Arg('id', () => Int) id: number,
        @Ctx() { req }: MyContext
    ): Promise<boolean> {
        const deleted = await Post.delete({
            id,
            creatorId: req.session.userId,
        });
        return !!deleted.affected;
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async upvote(
        @Arg('postId', () => Int) postId: number,
        @Arg('value', () => Int) value: number,
        @Ctx() { req }: MyContext
    ) {
        const { userId } = req.session;
        const realValue = value === 1 ? 1 : -1;

        const upvote = await Upvote.findOne({ where: { postId, userId } });

        if (upvote && upvote.value !== realValue) {
            /**
             * if the user has voted on post before and changing his vote to opposite
             */
            await getConnection().transaction(async (em) => {
                await em.query(
                    `
                update upvote
                set value = $1
                where "postId" = $2 and "userId" = $3
                `,
                    [realValue, postId, userId]
                );

                await em.query(
                    `
                      update post
                      set points = points + $1
                      where id = $2
                    `,
                    [realValue, postId]
                );
            });
        } else if (!upvote) {
            /**
             * the user never voted before
             */
            await getConnection().transaction(async (tm) => {
                await tm.query(
                    `
                        insert into upvote ("userId", "postId", value)
                        values ($1, $2, $3)
                        `,
                    [userId, postId, realValue]
                );

                await tm.query(
                    `
                    update post
                    set points = points + $1
                    where id = $2
                      `,
                    [realValue, postId]
                );
            });
        }
        return true;
    }
}
