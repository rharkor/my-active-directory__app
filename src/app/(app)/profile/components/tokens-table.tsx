'use client';

import { apiGetAllTokens } from '@/lib/auth-calls';
import { getImageFromOsName } from '@/lib/utils';
import { ApiSchemas } from '@/types/api';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as z from 'zod';

export default function TokensTable() {
  const [tokens, setTokens] = useState<z.infer<
    typeof ApiSchemas.getAllTokens.response
  > | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getTokens = async () => {
      const res = await apiGetAllTokens(router);
      setTokens(res);
    };
    getTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log(tokens);

  return (
    <section>
      <header>
        <h3 className="text-lg font-medium">Logged in devices</h3>
        <p className="text-sm text-muted-foreground">
          You can manage your logged in devices here.
        </p>
      </header>
      <div className="flex flex-col space-y-4">
        {tokens?.data.map((token) => {
          return (
            <div className="flex flex-row space-x-4" key={token.id}>
              <div className="flex flex-col space-y-1">
                <div className="flex flex-row space-x-2">
                  <Image
                    src={getImageFromOsName(token.os.name)}
                    alt={(token.os ?? 'os') + ' logo'}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{token.os.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {token.createdByIp}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {token.browser.name}
                </p>
              </div>
              <div className="flex flex-col space-y-1">
                <p className="text-xs text-muted-foreground">Last used</p>
                <p className="text-xs text-muted-foreground">
                  {token.lastUsedAt}
                </p>
              </div>
              <div className="flex flex-col space-y-1">
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-xs text-muted-foreground">
                  {token.createdAt}
                </p>
              </div>
              <div className="flex flex-col space-y-1">
                <p className="text-xs text-muted-foreground">Expires</p>
                <p className="text-xs text-muted-foreground">
                  {token.expiresAt}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
