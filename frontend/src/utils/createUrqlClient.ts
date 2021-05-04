import { Cache, cacheExchange, QueryInput } from '@urql/exchange-graphcache';
import { dedupExchange, fetchExchange } from 'urql';
import {
    LoginMutation,
    LogoutMutation,
    MeDocument,
    MeQuery,
    RegisterMutation,
} from '../generated/graphql';

function betterUpdateQuery<Result, Query>(
    cache: Cache,
    qi: QueryInput,
    result: any,
    fn: (r: Result, q: Query) => Query
) {
    return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}

export const createUrqlClient = (ssrExchange: any) => ({
    url: 'http://localhost:2000/graphql',
    fetchOptions: {
        credentials: 'include' as const,
    },
    exchanges: [
        dedupExchange,
        cacheExchange({
            updates: {
                Mutation: {
                    createPost: (_result: any, args: any, cache: Cache) => {
                        cache.invalidate('Query', 'posts', {
                            limit: 10,
                        });
                    },
                    upvote: (_result: any, args: any, cache: Cache) => {
                        cache.invalidate('Query', 'posts', {
                            limit: 10,
                        });
                    },
                    login: (
                        _result: any,
                        args: any,
                        cache: Cache,
                        info: any
                    ) => {
                        betterUpdateQuery<LoginMutation, MeQuery>(
                            cache,
                            { query: MeDocument },
                            _result,
                            (result, query) => {
                                if (result.login.errors) {
                                    return query;
                                }
                                return {
                                    me: result.login.user,
                                };
                            }
                        );
                    },
                    register: (
                        _result: any,
                        args: any,
                        cache: Cache,
                        info: any
                    ) => {
                        betterUpdateQuery<RegisterMutation, MeQuery>(
                            cache,
                            { query: MeDocument },
                            _result,
                            (result, query) => {
                                if (result.register.errors) {
                                    return query;
                                }
                                return {
                                    me: result.register.user,
                                };
                            }
                        );
                    },
                    logout: (
                        _result: any,
                        args: any,
                        cache: Cache,
                        info: any
                    ) => {
                        betterUpdateQuery<LogoutMutation, MeQuery>(
                            cache,
                            { query: MeDocument },
                            _result,
                            () => ({
                                me: null,
                            })
                        );
                    },
                },
            },
        }),
        ssrExchange,
        fetchExchange,
    ],
});
