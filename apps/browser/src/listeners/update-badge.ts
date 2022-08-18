import { AuthService } from "@bitwarden/common/abstractions/auth.service";
import { StateFactory } from "@bitwarden/common/factories/stateFactory";
import { GlobalState } from "@bitwarden/common/models/domain/globalState";

import { authServiceFactory } from "src/background/service_factories/auth-service.factory";
import { BrowserApi } from "src/browser/browserApi";
import { Account } from "src/models/account";

import { ListenerCommand } from "./listener-command";

export class UpdateBadge implements ListenerCommand {
  private authService: AuthService;

  constructor() {
    const serviceCache = {};
    this.authService = authServiceFactory(serviceCache, {
      cryptoFunctionServiceOptions: { win: self },
      encryptServiceOptions: { logMacFailures: true },
      logServiceOptions: { isDev: false },
      platformUtilsServiceOptions: {
        clipboardWriteCallback: (clipboardValue: string, clearMs: number) =>
          Promise.reject("not implemented"),
        biometricCallback: () => Promise.reject("not implemented"),
      },
      stateServiceOptions: {
        stateFactory: new StateFactory(GlobalState, Account),
      },
      stateMigrationServiceOptions: {
        stateFactory: new StateFactory(GlobalState, Account),
      },
      apiServiceOptions: {
        logoutCallback: () => Promise.reject("not implemented"),
      },
      keyConnectorServiceOptions: {
        logoutCallback: () => Promise.reject("not implemented"),
      },
      i18nServiceOptions: {
        systemLanguage: BrowserApi.getUILanguage(self),
      },
    });
    //eslint-disable-next-line no-console
    console.log("UpdateBadge");
  }

  run(): Promise<void> {
    //eslint-disable-next-line no-console
    console.log("UpdateBadge.run");
    return Promise.resolve();
  }
}
