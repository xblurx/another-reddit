import React from 'react';
import { ChakraProvider, ColorModeProvider } from '@chakra-ui/react';
import { createClient, Provider } from 'urql';
import theme from '../theme';

const client = createClient({
    url: 'http://localhost:2000/graphql',
    fetchOptions: {
        credentials: 'include',
    },
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
