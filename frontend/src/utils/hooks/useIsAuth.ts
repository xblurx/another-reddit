import * as React from 'react';
import { useMeQuery } from '../../generated/graphql';
import { useRouter } from 'next/router';

export const useIsAuth = () => {
    const [{ data, fetching }] = useMeQuery();
    const router = useRouter();

    React.useEffect(() => {
        if (!fetching && !data?.me) {
            router.push(`/login?next=${router.pathname}`);
        }
    }, [fetching, data, router]);
};
