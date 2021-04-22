import React from 'react';
import { ChakraProvider, ColorModeProvider } from '@chakra-ui/react';
import { createClient, dedupExchange, fetchExchange, Provider } from 'urql';
import theme from '../theme';
import { cacheExchange, QueryInput, Cache } from '@urql/exchange-graphcache';
import { LoginMutation, MeDocument, MeQuery } from '../generated/graphql';

function betterUpdateQuery<Result, Query>(
    cache: Cache,
    qi: QueryInput,
    result: any,
    fn: (r: Result, q: Query) => Query
) {
    return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}

const client = createClient({
    url: 'http://localhost:2000/graphql',
    fetchOptions: {
        credentials: 'include',
    },
    exchanges: [
        dedupExchange,
        cacheExchange({
            updates: {
                Mutation: {
                    login: (_result, args, cache, info) => {
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
                },
            },
        }),
        fetchExchange,
    ],
});

function MyApp({ Component, pageProps }: any) {
    return (
        <Provider value={client}>
            <ChakraProvider resetCSS theme={theme}>
                <ColorModeProvider
                    options={{
                        useSystemColorMode: true,
                    }}
                >
                    <Component {...pageProps} />
                </ColorModeProvider>
            </ChakraProvider>
        </Provider>
    );
}

export default MyApp;
