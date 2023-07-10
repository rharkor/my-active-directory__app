'use client';

import { apiGetAllTokens, apiRevokeToken } from '@/lib/auth-calls';
import { ApiSchemas } from '@/types/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as z from 'zod';
import GetDeviceIcon from './get-device-icon';
import { getTimeBetween } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TrashIcon } from '@radix-ui/react-icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function TokensTable() {
  const [tokens, setTokens] = useState<z.infer<
    typeof ApiSchemas.getAllTokens.response
  > | null>(null);
  const router = useRouter();
  const [selectedToken, setSelectedToken] = useState<number | null>(null);

  useEffect(() => {
    const getTokens = async () => {
      const res = await apiGetAllTokens(router);
      setTokens(res);
    };
    getTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteToken = async () => {
    if (!selectedToken) return;
    const res = await apiRevokeToken(selectedToken.toString(), router);
    if (res) {
      setTokens((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          data: prev.data.filter((token) => token.id !== selectedToken),
        };
      });
    }
  };

  return (
    <section>
      <header>
        <h3 className="text-lg font-medium">Logged in devices</h3>
        <p className="text-sm text-muted-foreground">
          You can manage your logged in devices here.
        </p>
      </header>
      <div className="flex flex-col space-y-4 mt-4">
        <AlertDialog>
          {tokens?.data.map((token) => {
            return (
              <div
                className="grid space-x-4 grid-cols-[1fr,1fr,1fr,1fr,auto] items-center"
                key={token.id}
              >
                <div className="flex flex-col space-y-1">
                  <div className="flex flex-row space-x-2">
                    <div className="flex flex-col space-y-1">
                      <div className="flex flex-row space-x-2 items-center">
                        <GetDeviceIcon name={token.os.name} />
                        <p className="text-sm font-medium">{token.os.name}</p>
                      </div>
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
                    {token.lastUsed
                      ? getTimeBetween(new Date(token.lastUsed), new Date())
                      : 'never'}
                  </p>
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(token.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-xs text-muted-foreground">Expires</p>
                  <p className="text-xs text-muted-foreground">
                    in {getTimeBetween(new Date(token.expiresAt), new Date())}
                  </p>
                </div>
                <div className="flex flex-row space-x-2">
                  <AlertDialogTrigger asChild>
                    <Button
                      className="btn btn-primary btn-sm"
                      variant={'destructive'}
                      size={'sm'}
                      onClick={() => setSelectedToken(token.id)}
                    >
                      <TrashIcon />
                    </Button>
                  </AlertDialogTrigger>
                </div>
              </div>
            );
          })}
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will disconnect the device connected to this token.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={deleteToken}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  );
}
