import { CreateAccountUseCase } from '../application/use-cases/account/CreateAccountUseCase';
import { FreezeAccountUseCase } from '../application/use-cases/account/FreezeAccountUseCase';
import { GetAccountBalanceUseCase } from '../application/use-cases/account/GetAccountBalanceUseCase';
import { GetTransactionHistoryUseCase } from '../application/use-cases/account/GetTransactionHistoryUseCase';
import { ListAccountsUseCase } from '../application/use-cases/account/ListAccountsUseCase';
import { UnfreezeAccountUseCase } from '../application/use-cases/account/UnfreezeAccountUseCase';
import { LoginUseCase } from '../application/use-cases/auth/LoginUseCase';
import { RegisterUserUseCase } from '../application/use-cases/auth/RegisterUserUseCase';
import { DepositFundsUseCase } from '../application/use-cases/transaction/DepositFundsUseCase';
import { TransferMoneyUseCase } from '../application/use-cases/transaction/TransferMoneyUseCase';
import { WithdrawFundsUseCase } from '../application/use-cases/transaction/WithdrawFundsUseCase';
import { appConfig } from '../config';
import type { AccountApi } from '../domain/ports/AccountApi';
import type { AuthApi } from '../domain/ports/AuthApi';
import type { AuthSessionStore } from '../domain/ports/AuthSessionStore';
import type { TransactionFundsApi } from '../domain/ports/TransactionFundsApi';
import type { TransactionHistoryApi } from '../domain/ports/TransactionHistoryApi';
import type { TransferApi } from '../domain/ports/TransferApi';
import { AccountService } from '../infrastructure/account/AccountService';
import { AuthService } from '../infrastructure/auth/AuthService';
import { ApiClient } from '../infrastructure/http/apiClient';
import { LocalStorageSessionStore } from '../infrastructure/storage/LocalStorageSessionStore';
import { TransactionService } from '../infrastructure/transaction/TransactionService';
import { TransferService } from '../infrastructure/transaction/TransferService';

/**
 * Composition root — cablea infrastructure + application.
 */
export interface AppDependencies {
  readonly sessionStore: AuthSessionStore;
  readonly apiClient: ApiClient;
  readonly authApi: AuthApi;
  readonly accountApi: AccountApi;
  readonly fundsApi: TransactionFundsApi;
  readonly transferApi: TransferApi;
  readonly historyApi: TransactionHistoryApi;
  readonly loginUseCase: LoginUseCase;
  readonly registerUserUseCase: RegisterUserUseCase;
  readonly listAccountsUseCase: ListAccountsUseCase;
  readonly createAccountUseCase: CreateAccountUseCase;
  readonly getAccountBalanceUseCase: GetAccountBalanceUseCase;
  readonly freezeAccountUseCase: FreezeAccountUseCase;
  readonly unfreezeAccountUseCase: UnfreezeAccountUseCase;
  readonly getTransactionHistoryUseCase: GetTransactionHistoryUseCase;
  readonly depositFundsUseCase: DepositFundsUseCase;
  readonly withdrawFundsUseCase: WithdrawFundsUseCase;
  readonly transferMoneyUseCase: TransferMoneyUseCase;
}

export function createAppDependencies(): AppDependencies {
  const sessionStore = new LocalStorageSessionStore();
  const apiClient = new ApiClient(appConfig, sessionStore);
  const authApi = new AuthService(apiClient);
  const accountApi = new AccountService(apiClient);
  const transactionService = new TransactionService(apiClient);
  const transferApi = new TransferService(apiClient);

  return {
    sessionStore,
    apiClient,
    authApi,
    accountApi,
    fundsApi: transactionService,
    transferApi,
    historyApi: transactionService,
    loginUseCase: new LoginUseCase(authApi),
    registerUserUseCase: new RegisterUserUseCase(authApi),
    listAccountsUseCase: new ListAccountsUseCase(accountApi),
    createAccountUseCase: new CreateAccountUseCase(accountApi),
    getAccountBalanceUseCase: new GetAccountBalanceUseCase(accountApi),
    freezeAccountUseCase: new FreezeAccountUseCase(accountApi),
    unfreezeAccountUseCase: new UnfreezeAccountUseCase(accountApi),
    getTransactionHistoryUseCase: new GetTransactionHistoryUseCase(transactionService),
    depositFundsUseCase: new DepositFundsUseCase(transactionService),
    withdrawFundsUseCase: new WithdrawFundsUseCase(transactionService),
    transferMoneyUseCase: new TransferMoneyUseCase(transferApi),
  };
}
