import { useCallback, useEffect, useRef, useState } from 'react';
import type { AppError } from '../../domain/errors/ApiErrorCode';
import { normalizeError } from '../../domain/errors/normalizeError';
import type {
  DepositInput,
  DepositResult,
  WithdrawalInput,
  WithdrawalResult,
} from '../../domain/ports/TransactionFundsApi';
import type { TransferInput, TransferResult } from '../../domain/ports/TransferApi';
import type { RemoteStatus } from './useAccount';
import { useDependencies } from './useDependencies';

export interface UseTransactionOptions {
  /** Tras éxito: refrescar saldo, estado e historial desde el servidor (sin optimismo). */
  readonly onSuccessRefresh: () => Promise<void>;
}

export interface UseTransactionResult {
  readonly depositStatus: RemoteStatus;
  readonly depositError: AppError | null;
  readonly lastDeposit: DepositResult | null;

  readonly withdrawalStatus: RemoteStatus;
  readonly withdrawalError: AppError | null;
  readonly lastWithdrawal: WithdrawalResult | null;

  readonly transferStatus: RemoteStatus;
  readonly transferError: AppError | null;
  readonly lastTransfer: TransferResult | null;

  readonly isSubmitting: boolean;

  deposit: (input: DepositInput) => Promise<DepositResult>;
  withdrawal: (input: WithdrawalInput) => Promise<WithdrawalResult>;
  transfer: (input: TransferInput) => Promise<TransferResult>;
  clearDepositError: () => void;
  clearWithdrawalError: () => void;
  clearTransferError: () => void;
}

/**
 * Estado de envío de operaciones de fondos.
 * No calcula ni muta saldos localmente.
 */
export function useTransaction(
  options: UseTransactionOptions,
): UseTransactionResult {
  const dependencies = useDependencies();
  const dependenciesRef = useRef(dependencies);
  useEffect(() => {
    dependenciesRef.current = dependencies;
  }, [dependencies]);

  const onSuccessRefreshRef = useRef(options.onSuccessRefresh);
  useEffect(() => {
    onSuccessRefreshRef.current = options.onSuccessRefresh;
  }, [options.onSuccessRefresh]);

  const [depositStatus, setDepositStatus] = useState<RemoteStatus>('idle');
  const [depositError, setDepositError] = useState<AppError | null>(null);
  const [lastDeposit, setLastDeposit] = useState<DepositResult | null>(null);

  const [withdrawalStatus, setWithdrawalStatus] = useState<RemoteStatus>('idle');
  const [withdrawalError, setWithdrawalError] = useState<AppError | null>(null);
  const [lastWithdrawal, setLastWithdrawal] = useState<WithdrawalResult | null>(null);

  const [transferStatus, setTransferStatus] = useState<RemoteStatus>('idle');
  const [transferError, setTransferError] = useState<AppError | null>(null);
  const [lastTransfer, setLastTransfer] = useState<TransferResult | null>(null);

  const submittingRef = useRef(false);

  const isSubmitting =
    depositStatus === 'loading' ||
    withdrawalStatus === 'loading' ||
    transferStatus === 'loading';

  const deposit = useCallback(async (input: DepositInput): Promise<DepositResult> => {
    if (submittingRef.current) {
      throw normalizeError({
        code: 'UNKNOWN',
        message: 'Hay una operación en curso. Espere a que finalice.',
        statusHttp: 409,
      });
    }

    submittingRef.current = true;
    setDepositStatus('loading');
    setDepositError(null);
    try {
      const result = await dependenciesRef.current.depositFundsUseCase.execute(input);
      setLastDeposit(result);
      setDepositStatus('success');
      await onSuccessRefreshRef.current();
      return result;
    } catch (error: unknown) {
      const appError = normalizeError(error);
      setDepositError(appError);
      setDepositStatus('error');
      throw appError;
    } finally {
      submittingRef.current = false;
    }
  }, []);

  const withdrawal = useCallback(
    async (input: WithdrawalInput): Promise<WithdrawalResult> => {
      if (submittingRef.current) {
        throw normalizeError({
          code: 'UNKNOWN',
          message: 'Hay una operación en curso. Espere a que finalice.',
          statusHttp: 409,
        });
      }

      submittingRef.current = true;
      setWithdrawalStatus('loading');
      setWithdrawalError(null);
      try {
        const result =
          await dependenciesRef.current.withdrawFundsUseCase.execute(input);
        setLastWithdrawal(result);
        setWithdrawalStatus('success');
        await onSuccessRefreshRef.current();
        return result;
      } catch (error: unknown) {
        const appError = normalizeError(error);
        setWithdrawalError(appError);
        setWithdrawalStatus('error');
        throw appError;
      } finally {
        submittingRef.current = false;
      }
    },
    [],
  );

  const transfer = useCallback(async (input: TransferInput): Promise<TransferResult> => {
    if (submittingRef.current) {
      throw normalizeError({
        code: 'UNKNOWN',
        message: 'Hay una operación en curso. Espere a que finalice.',
        statusHttp: 409,
      });
    }

    submittingRef.current = true;
    setTransferStatus('loading');
    setTransferError(null);
    try {
      const result = await dependenciesRef.current.transferMoneyUseCase.execute(input);
      setLastTransfer(result);
      setTransferStatus('success');
      await onSuccessRefreshRef.current();
      return result;
    } catch (error: unknown) {
      const appError = normalizeError(error);
      setTransferError(appError);
      setTransferStatus('error');
      throw appError;
    } finally {
      submittingRef.current = false;
    }
  }, []);

  const clearDepositError = useCallback(() => {
    setDepositError(null);
    setDepositStatus((current) => (current === 'error' ? 'idle' : current));
  }, []);

  const clearWithdrawalError = useCallback(() => {
    setWithdrawalError(null);
    setWithdrawalStatus((current) => (current === 'error' ? 'idle' : current));
  }, []);

  const clearTransferError = useCallback(() => {
    setTransferError(null);
    setTransferStatus((current) => (current === 'error' ? 'idle' : current));
  }, []);

  return {
    depositStatus,
    depositError,
    lastDeposit,
    withdrawalStatus,
    withdrawalError,
    lastWithdrawal,
    transferStatus,
    transferError,
    lastTransfer,
    isSubmitting,
    deposit,
    withdrawal,
    transfer,
    clearDepositError,
    clearWithdrawalError,
    clearTransferError,
  };
}
