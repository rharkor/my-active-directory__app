'use client';

import { apiGetAllTokens, apiRevokeToken } from '@/lib/auth-calls';
import { ApiSchemas } from '@/types/api';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
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
import Pagination from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';

type RowProps =
  | {
      token: z.infer<typeof ApiSchemas.getAllTokens.response>['data'][0];
      setSelectedToken: Dispatch<SetStateAction<number | null>>;
      skeleton?: never;
    }
  | {
      skeleton: true;
      token?: never;
      setSelectedToken?: never;
    };

function TokenRow({ token, setSelectedToken, skeleton }: RowProps) {
  return (
    <div className="grid space-x-4 grid-cols-[1fr,1fr,1fr,1fr,auto] items-center">
      <div className="flex flex-col space-y-1">
        <div className="flex flex-row space-x-2">
          <div className="flex flex-col space-y-1">
            <div className="flex flex-row space-x-2 items-center">
              {skeleton ? (
                <Skeleton className="h-4 w-4" />
              ) : (
                <GetDeviceIcon name={token.os.name} />
              )}
              {skeleton ? (
                <Skeleton className="h-4 w-9" />
              ) : (
                <p className="text-sm font-medium">{token.os.name}</p>
              )}
            </div>
            {skeleton ? (
              <Skeleton className="h-3 w-16" />
            ) : (
              <p className="text-xs text-muted-foreground">
                {token.createdByIp}
              </p>
            )}
          </div>
        </div>
        {skeleton ? (
          <Skeleton className="h-3 w-5" />
        ) : (
          <p className="text-xs text-muted-foreground">{token.browser.name}</p>
        )}
      </div>
      <div className="flex flex-col space-y-1">
        <p className="text-xs text-muted-foreground">Last used</p>
        {skeleton ? (
          <Skeleton className="h-4 w-8" />
        ) : (
          <p className="text-xs text-muted-foreground">
            {token.lastUsed
              ? getTimeBetween(new Date(token.lastUsed), new Date())
              : 'never'}
          </p>
        )}
      </div>
      <div className="flex flex-col space-y-1">
        <p className="text-xs text-muted-foreground">Created</p>
        {skeleton ? (
          <Skeleton className="h-4 w-10" />
        ) : (
          <p className="text-xs text-muted-foreground">
            {new Date(token.createdAt).toLocaleDateString()}
          </p>
        )}
      </div>
      <div className="flex flex-col space-y-1">
        <p className="text-xs text-muted-foreground">Expires</p>
        {skeleton ? (
          <Skeleton className="h-4 w-10" />
        ) : (
          <p className="text-xs text-muted-foreground">
            in {getTimeBetween(new Date(token.expiresAt), new Date())}
          </p>
        )}
      </div>
      <div className="flex flex-row space-x-2">
        {skeleton ? (
          <Skeleton className="h-8 w-10" />
        ) : (
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
        )}
      </div>
    </div>
  );
}

const itemsPerPageInitial = 5;

export default function TokensTable() {
  const [tokens, setTokens] = useState<z.infer<
    typeof ApiSchemas.getAllTokens.response
  > | null>(null);
  const router = useRouter();
  const [selectedToken, setSelectedToken] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageInitial);

  useEffect(() => {
    const getTokens = async () => {
      const res = await apiGetAllTokens(
        router,
        currentPage.toString(),
        itemsPerPage.toString(),
      );
      setTokens(res);
    };
    getTokens();
  }, [currentPage, itemsPerPage, router]);

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

  const rows = tokens?.data.map((token) => (
    <TokenRow
      token={token}
      setSelectedToken={setSelectedToken}
      key={token.id}
    />
  ));

  const skelRows = (
    <>
      <TokenRow skeleton />
      <TokenRow skeleton />
      <TokenRow skeleton />
    </>
  );

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
          {tokens ? rows : skelRows}
          {tokens &&
            (tokens.meta.totalPages > 1 ||
              itemsPerPageInitial !== itemsPerPage) && (
              <Pagination
                currentPage={tokens?.meta.currentPage}
                totalPages={tokens?.meta.totalPages}
                setCurrentPage={setCurrentPage}
                itemsPerPage={tokens?.meta.itemsPerPage}
                setItemsPerPage={setItemsPerPage}
              />
            )}
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
