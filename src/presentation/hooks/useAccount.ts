import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppError } from '../../domain/errors/ApiErrorCode';
import { normalizeError } from '../../domain/errors/normalizeError';
import type { Account } from '../../domain/entities/Account';
import type { TransactionHistoryItem } from '../../domain/entities/Transaction';
import { useDependencies } from './useDependencies';

export type RemoteStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

export interface UseAccountResult {
  readonly accounts: ReadonlyArray<Account>;
  readonly listStatus: RemoteStatus;
  readonly listError: AppError | null;

  readonly selectedAccountId: string | null;
  readonly selectedAccount: Account | null;
  readonly detailStatus: RemoteStatus;
  readonly detailError: AppError | null;

  readonly history: ReadonlyArray<TransactionHistoryItem>;
  readonly historyStatus: RemoteStatus;
  readonly historyError: AppError | null;

  readonly createStatus: RemoteStatus;
  readonly createError: AppError | null;
  readonly lastCreatedAccount: Account | null;

  readonly actionStatus: RemoteStatus;
  readonly actionError: AppError | null;

  selectAccount: (accountId: string) => void;
  refreshAll: () => Promise<void>;
  retryList: () => Promise<void>;
  retryDetail: () => Promise<void>;
  createAccount: (initialBalance?: number) => Promise<Account>;
  freezeSelected: () => Promise<void>;
  unfreezeSelected: () => Promise<void>;
}

/**
 * Única fuente de estado remoto de cuentas/historial en presentation.
 * No se duplica en Context.
 */
export function useAccount(): UseAccountResult {
  const dependencies = useDependencies();
  const dependenciesRef = useRef(dependencies);
  useEffect(() => {
    dependenciesRef.current = dependencies;
  }, [dependencies]);

  const [accounts, setAccounts] = useState<ReadonlyArray<Account>>([]);
  const [listStatus, setListStatus] = useState<RemoteStatus>('idle');
  const [listError, setListError] = useState<AppError | null>(null);

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [detailStatus, setDetailStatus] = useState<RemoteStatus>('idle');
  const [detailError, setDetailError] = useState<AppError | null>(null);

  const [history, setHistory] = useState<ReadonlyArray<TransactionHistoryItem>>([]);
  const [historyStatus, setHistoryStatus] = useState<RemoteStatus>('idle');
  const [historyError, setHistoryError] = useState<AppError | null>(null);

  const [createStatus, setCreateStatus] = useState<RemoteStatus>('idle');
  const [createError, setCreateError] = useState<AppError | null>(null);
  const [lastCreatedAccount, setLastCreatedAccount] = useState<Account | null>(null);

  const [actionStatus, setActionStatus] = useState<RemoteStatus>('idle');
  const [actionError, setActionError] = useState<AppError | null>(null);

  const selectedIdRef = useRef<string | null>(null);
  useEffect(() => {
    selectedIdRef.current = selectedAccountId;
  }, [selectedAccountId]);

  const loadDetailAndHistory = useCallback(async (accountId: string) => {
    const {
      getAccountBalanceUseCase,
      getTransactionHistoryUseCase,
    } = dependenciesRef.current;

    setDetailStatus('loading');
    setDetailError(null);
    setHistoryStatus('loading');
    setHistoryError(null);

    try {
      const detail = await getAccountBalanceUseCase.execute(accountId);
      if (selectedIdRef.current !== accountId) {
        return;
      }
      setSelectedAccount(detail);
      setDetailStatus('success');
    } catch (error: unknown) {
      if (selectedIdRef.current !== accountId) {
        return;
      }
      setSelectedAccount(null);
      setDetailError(normalizeError(error));
      setDetailStatus('error');
    }

    try {
      const historyResult = await getTransactionHistoryUseCase.execute(accountId);
      if (selectedIdRef.current !== accountId) {
        return;
      }
      setHistory(historyResult.transactions);
      setHistoryStatus(
        historyResult.transactions.length === 0 ? 'empty' : 'success',
      );
    } catch (error: unknown) {
      if (selectedIdRef.current !== accountId) {
        return;
      }
      setHistory([]);
      setHistoryError(normalizeError(error));
      setHistoryStatus('error');
    }
  }, []);

  const loadList = useCallback(async () => {
    const { listAccountsUseCase } = dependenciesRef.current;
    setListStatus('loading');
    setListError(null);
    try {
      const items = await listAccountsUseCase.execute();
      setAccounts(items);
      setListStatus(items.length === 0 ? 'empty' : 'success');

      const currentId = selectedIdRef.current;
      if (currentId !== null && !items.some((item) => item.id === currentId)) {
        setSelectedAccountId(null);
        setSelectedAccount(null);
        setHistory([]);
        setDetailStatus('idle');
        setHistoryStatus('idle');
      } else if (currentId === null && items.length > 0) {
        const first = items[0];
        if (first !== undefined) {
          setSelectedAccountId(first.id);
          await loadDetailAndHistory(first.id);
        }
      } else if (currentId !== null) {
        await loadDetailAndHistory(currentId);
      }
    } catch (error: unknown) {
      setAccounts([]);
      setListError(normalizeError(error));
      setListStatus('error');
    }
  }, [loadDetailAndHistory]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const selectAccount = useCallback(
    (accountId: string) => {
      if (!accounts.some((item) => item.id === accountId)) {
        return;
      }
      setSelectedAccountId(accountId);
      void loadDetailAndHistory(accountId);
    },
    [accounts, loadDetailAndHistory],
  );

  const refreshAll = useCallback(async () => {
    await loadList();
  }, [loadList]);

  const retryList = useCallback(async () => {
    await loadList();
  }, [loadList]);

  const retryDetail = useCallback(async () => {
    const id = selectedIdRef.current;
    if (id === null) {
      return;
    }
    await loadDetailAndHistory(id);
  }, [loadDetailAndHistory]);

  const createAccount = useCallback(
    async (initialBalance?: number): Promise<Account> => {
      const { createAccountUseCase } = dependenciesRef.current;
      setCreateStatus('loading');
      setCreateError(null);
      try {
        const created = await createAccountUseCase.execute(
          initialBalance === undefined ? {} : { initialBalance },
        );
        setLastCreatedAccount(created);
        setCreateStatus('success');
        setSelectedAccountId(created.id);
        await loadList();
        await loadDetailAndHistory(created.id);
        return created;
      } catch (error: unknown) {
        const appError = normalizeError(error);
        setCreateError(appError);
        setCreateStatus('error');
        throw appError;
      }
    },
    [loadDetailAndHistory, loadList],
  );

  const freezeSelected = useCallback(async () => {
    const id = selectedIdRef.current;
    if (id === null || selectedAccount === null) {
      return;
    }
    if (selectedAccount.status !== 'ACTIVE') {
      return;
    }
    if (!accounts.some((item) => item.id === id)) {
      return;
    }

    const { freezeAccountUseCase } = dependenciesRef.current;
    setActionStatus('loading');
    setActionError(null);
    try {
      await freezeAccountUseCase.execute(id);
      setActionStatus('success');
      await loadList();
      await loadDetailAndHistory(id);
    } catch (error: unknown) {
      const appError = normalizeError(error);
      setActionError(appError);
      setActionStatus('error');
      throw appError;
    }
  }, [accounts, loadDetailAndHistory, loadList, selectedAccount]);

  const unfreezeSelected = useCallback(async () => {
    const id = selectedIdRef.current;
    if (id === null || selectedAccount === null) {
      return;
    }
    if (selectedAccount.status !== 'FROZEN') {
      return;
    }
    if (!accounts.some((item) => item.id === id)) {
      return;
    }

    const { unfreezeAccountUseCase } = dependenciesRef.current;
    setActionStatus('loading');
    setActionError(null);
    try {
      await unfreezeAccountUseCase.execute(id);
      setActionStatus('success');
      await loadList();
      await loadDetailAndHistory(id);
    } catch (error: unknown) {
      const appError = normalizeError(error);
      setActionError(appError);
      setActionStatus('error');
      throw appError;
    }
  }, [accounts, loadDetailAndHistory, loadList, selectedAccount]);

  return {
    accounts,
    listStatus,
    listError,
    selectedAccountId,
    selectedAccount,
    detailStatus,
    detailError,
    history,
    historyStatus,
    historyError,
    createStatus,
    createError,
    lastCreatedAccount,
    actionStatus,
    actionError,
    selectAccount,
    refreshAll,
    retryList,
    retryDetail,
    createAccount,
    freezeSelected,
    unfreezeSelected,
  };
}
