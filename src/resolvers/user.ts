import { MyContext } from 'src/types';
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
import { User } from '../entities';
import argon2 from 'argon2';
import { validateRegister } from '../utils/validateRegister';

@InputType()
export class UsernamePasswordInput {
    @Field()
    username: string;
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
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        const user = await em.findOne(User, {
            username: options.username,
        });
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
            options.password
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
}
