import argon2 from 'argon2';
import {
    Arg,
    Ctx,
    Field,
    FieldResolver,
    InputType,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    Root,
} from 'type-graphql';
import { MyContext } from 'src/types';
import { User } from '../entities';
import { validateRegister } from '../utils/validateRegister';
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX, SITE_URL } from '../consts';
import { v4 } from 'uuid';
import { sendEmail } from '../utils/sendEmail';

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

@Resolver(User)
export class UserResolver {
    @FieldResolver(() => String)
    email(@Root() user: User, @Ctx() { req }: MyContext) {
        return req.session.userId === user.id ? user.email : '';
    }

    @Query(() => [User], { nullable: true })
    users(): Promise<User[]> {
        return User.find();
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const errors = validateRegister(options);
        if (errors) return { errors };

        const hashedPassword = await argon2.hash(options.password);

        let user;
        try {
            user = await User.create({
                username: options.username,
                email: options.email,
                password: hashedPassword,
            }).save();
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
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const searchField = usernameOrEmail.includes('@')
            ? { where: { email: usernameOrEmail } }
            : { where: { username: usernameOrEmail } };
        const user = await User.findOne(searchField);

        if (!user) {
            return {
                errors: [
                    {
                        field: 'usernameOrEmail',
                        message: 'User does not exist',
                    },
                ],
            };
        }

        const passwordsMatch = await argon2.verify(user.password, password);
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

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() { redis }: MyContext
    ): Promise<boolean> {
        const user = await User.findOne({ where: { email } });
        console.log(`user resolver forgotPassword user: ${user}`);
        if (!user) {
            return true;
        }

        const token = v4();
        await redis.set(
            FORGOT_PASSWORD_PREFIX + token,
            user.id,
            'ex',
            1000 * 60 * 10
        );
        const text = `<a href=${
            SITE_URL + `/reset-password/${token}`
        }>Reset password</a>`;
        await sendEmail(email, text);
        return true;
    }

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() { redis }: MyContext
    ): Promise<UserResponse> {
        const key = FORGOT_PASSWORD_PREFIX + token;
        const userId = await redis.get(key);
        if (!userId) {
            return {
                errors: [
                    {
                        field: 'token',
                        message: 'token is expired',
                    },
                ],
            };
        }
        const userIdNum = parseInt(userId);
        const user = await User.findOne(userIdNum);
        if (!user) {
            return {
                errors: [
                    {
                        field: 'token',
                        message: 'user no longer exists',
                    },
                ],
            };
        }

        await User.update(
            { id: userIdNum },
            { password: await argon2.hash(newPassword) }
        );
        await redis.del(key);
        return { user };
    }

    @Query(() => User, { nullable: true })
    async me(@Ctx() { req }: MyContext): Promise<User | undefined> {
        if (!req.session.userId) {
            return undefined;
        }
        return await User.findOne(req.session.userId);
    }
}
