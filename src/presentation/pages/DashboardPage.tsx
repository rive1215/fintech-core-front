import { useCallback } from 'react';
import { AccountActions } from '../components/account/AccountActions';
import { AccountDetail } from '../components/account/AccountDetail';
import { AccountList } from '../components/account/AccountList';
import { CreateAccountForm } from '../components/account/CreateAccountForm';
import { DashboardSummary } from '../components/account/DashboardSummary';
import { TransactionHistoryList } from '../components/account/TransactionHistoryList';
import { DepositForm } from '../components/transaction/DepositForm';
import { TransferForm } from '../components/transaction/TransferForm';
import { WithdrawalForm } from '../components/transaction/WithdrawalForm';
import { useAccount } from '../hooks/useAccount';
import { useAuth } from '../hooks/useAuth';
import { useTransaction } from '../hooks/useTransaction';

/**
 * Dashboard: cuentas + operaciones de fondos.
 * Estado remoto de cuentas en useAccount; envíos en useTransaction.
 */
export function DashboardPage() {
  const { user, logout } = useAuth();
  const account = useAccount();
  const { refreshAll } = account;

  const onSuccessRefresh = useCallback(async () => {
    await refreshAll();
  }, [refreshAll]);

  const transaction = useTransaction({ onSuccessRefresh });

  const refreshing = account.listStatus === 'loading';
  const formsLocked = transaction.isSubmitting;

  return (
    <main className="page page--wide">
      <DashboardSummary
        user={user}
        accountCount={account.accounts.length}
        refreshing={refreshing}
        onRefresh={() => {
          void account.refreshAll();
        }}
        onLogout={logout}
      />

      <div className="dashboard-grid">
        <AccountList
          accounts={account.accounts}
          selectedAccountId={account.selectedAccountId}
          status={account.listStatus}
          error={account.listError}
          onSelect={account.selectAccount}
          onRetry={() => {
            void account.retryList();
          }}
        />

        <CreateAccountForm
          status={account.createStatus}
          error={account.createError}
          lastCreated={account.lastCreatedAccount}
          onSubmit={async (initialBalance) => {
            await account.createAccount(initialBalance);
          }}
        />

        <AccountDetail
          account={account.selectedAccount}
          status={account.detailStatus}
          error={account.detailError}
          onRetry={() => {
            void account.retryDetail();
          }}
        />

        <AccountActions
          account={account.selectedAccount}
          mutationStatus={account.actionStatus}
          mutationError={account.actionError}
          onFreeze={() => {
            void account.freezeSelected();
          }}
          onUnfreeze={() => {
            void account.unfreezeSelected();
          }}
        />

        <DepositForm
          account={account.selectedAccount}
          status={transaction.depositStatus}
          error={transaction.depositError}
          lastResult={transaction.lastDeposit}
          disabled={formsLocked && transaction.depositStatus !== 'loading'}
          onClearError={transaction.clearDepositError}
          onSubmit={async (amount) => {
            if (account.selectedAccount === null) {
              return;
            }
            await transaction.deposit({
              accountId: account.selectedAccount.id,
              amount,
            });
          }}
        />

        <WithdrawalForm
          account={account.selectedAccount}
          status={transaction.withdrawalStatus}
          error={transaction.withdrawalError}
          lastResult={transaction.lastWithdrawal}
          disabled={formsLocked && transaction.withdrawalStatus !== 'loading'}
          onClearError={transaction.clearWithdrawalError}
          onSubmit={async (amount) => {
            if (account.selectedAccount === null) {
              return;
            }
            await transaction.withdrawal({
              accountId: account.selectedAccount.id,
              amount,
            });
          }}
        />

        <div className="dashboard-grid__full">
          <TransferForm
            sourceAccount={account.selectedAccount}
            status={transaction.transferStatus}
            error={transaction.transferError}
            lastResult={transaction.lastTransfer}
            disabled={formsLocked && transaction.transferStatus !== 'loading'}
            onClearError={transaction.clearTransferError}
            onSubmit={async (input) => {
              if (account.selectedAccount === null) {
                return;
              }
              const payload: {
                sourceAccountId: string;
                destinationAccountId: string;
                amount: number;
                description?: string;
              } = {
                sourceAccountId: account.selectedAccount.id,
                destinationAccountId: input.destinationAccountId,
                amount: input.amount,
              };
              if (input.description !== undefined) {
                payload.description = input.description;
              }
              await transaction.transfer(payload);
            }}
          />
        </div>

        <div className="dashboard-grid__full">
          <TransactionHistoryList
            items={account.history}
            status={account.historyStatus}
            error={account.historyError}
            onRetry={() => {
              void account.retryDetail();
            }}
          />
        </div>
      </div>
    </main>
  );
}
