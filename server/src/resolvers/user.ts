import argon2 from 'argon2';
import {
    Arg,
    Ctx,
    Field,
    InputType,
    Mutation,
    ObjectType,
    Query,
    Resolver,
} from 'type-graphql';
import { MyContext } from 'src/types';
import { User } from '../entities';
import { validateRegister } from '../utils/validateRegister';
import { COOKIE_NAME } from '../consts';

@InputType()
export class UsernamePasswordInput {
    @Field()
    username: string;
    @Field()
    email: string;
    @Field()
    password: string;
}

@ObjectType()
export class FieldError {
    @Field()
    field: string;
    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;
}

@Resolver()
export class UserResolver {
    @Query(() => [User], { nullable: true })
    users(@Ctx() { em }: MyContext): Promise<User[]> {
        return em.find(User, {});
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { req, em }: MyContext
    ): Promise<UserResponse> {
        const errors = validateRegister(options);
        if (errors) return { errors };

        const hashedPassword = await argon2.hash(options.password);
        const user = em.create(User, {
            username: options.username,
            email: options.email,
            password: hashedPassword,
        });
        try {
            await em.persistAndFlush(user);
        } catch (e) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: 'Username has already been taken',
                    },
                ],
            };
        }

        req.session.userId = user.id;
        return {
            user,
        };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const findBy = usernameOrEmail.includes('@')
            ? { email: usernameOrEmail }
            : { username: usernameOrEmail };

        const user = await em.findOne(User, findBy);

        if (!user) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: 'User does not exist',
                    },
                ],
            };
        }

        const passwordsMatch = await argon2.verify(
            user.password,
            password
        );
        if (!passwordsMatch) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'Passwords do not match',
                    },
                ],
            };
        }

        req.session.userId = user.id;
        return {
            user,
        };
    }

    @Mutation(() => Boolean)
    async logout(@Ctx() { req, res }: MyContext): Promise<boolean> {
        return new Promise((resolve) =>
            req.session.destroy((err: any) => {
                res.clearCookie(COOKIE_NAME);
                if (err) {
                    resolve(false);
                    return;
                }
                resolve(true);
            })
        );
    }

    @Query(() => User, { nullable: true })
    async me(@Ctx() { em, req }: MyContext): Promise<User | null> {
        const user = await em.findOne(User, { id: req.session.userId });
        if (user) {
            return user;
        }
        return null;
    }
}
