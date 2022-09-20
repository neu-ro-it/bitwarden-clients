import { SearchService } from "@bitwarden/common/abstractions/search.service";
import { AuthenticationStatus } from "@bitwarden/common/enums/authenticationStatus";
import { StateFactory } from "@bitwarden/common/factories/stateFactory";
import { GlobalState } from "@bitwarden/common/models/domain/globalState";

import {
  authServiceFactory,
  AuthServiceInitOptions,
} from "../background/service_factories/auth-service.factory";
import {
  autofillServiceFactory,
  AutofillServiceInitOptions,
} from "../background/service_factories/autofill-service.factory";
import { cipherServiceFactory } from "../background/service_factories/cipher-service.factory";
import { cryptoServiceFactory } from "../background/service_factories/crypto-service.factory";
import { encryptServiceFactory } from "../background/service_factories/encrypt-service.factory";
import { logServiceFactory } from "../background/service_factories/log-service.factory";
import {
  passwordGenerationServiceFactory,
  PasswordGenerationServiceInitOptions,
} from "../background/service_factories/password-generation-service.factory";
import { searchServiceFactory } from "../background/service_factories/search-service.factory";
import { stateServiceFactory } from "../background/service_factories/state-service.factory";
import { sendTabsMessage } from "../browser/sendTabsMessage";
import { AutoFillActiveTabCommand } from "../commands/autoFillActiveTabCommand";
import { Account } from "../models/account";

export const onCommandListener = async (command: string, tab: chrome.tabs.Tab) => {
  switch (command) {
    case "autofill_login":
      await doAutoFillLogin(tab);
      break;
    case "generate_password":
      await doGeneratePasswordToClipboard(tab);
      break;
    // No need to support this one yet since this is only for safari
    // case "open_popup":
    //   break;
    case "lock_vault":
      break;
  }
};

const doAutoFillLogin = async (tab: chrome.tabs.Tab): Promise<void> => {
  const stateFactory = new StateFactory(GlobalState, Account);

  const cache = {};
  const opts: AutofillServiceInitOptions & AuthServiceInitOptions = {
    apiServiceOptions: {
      logoutCallback: (_expired) => Promise.resolve(),
    },
    cryptoFunctionServiceOptions: {
      win: self,
    },
    encryptServiceOptions: {
      logMacFailures: false,
    },
    eventServiceOptions: {
      useNoopService: true, // Eventually get rid of this
    },
    i18nServiceOptions: {
      systemLanguage: chrome.i18n.getUILanguage(),
    },
    logServiceOptions: {
      isDev: false,
    },
    platformUtilsServiceOptions: {
      biometricCallback: () => Promise.resolve(true),
      clipboardWriteCallback: (_clipboardValue, _clearMs) => Promise.resolve(),
      win: self,
    },
    stateMigrationServiceOptions: {
      stateFactory: stateFactory,
    },
    stateServiceOptions: {
      stateFactory: stateFactory,
    },
    keyConnectorServiceOptions: {
      logoutCallback: (_expired, _userId) => Promise.resolve(),
    },
  };

  const cryptoService = await cryptoServiceFactory(cache, opts);
  const encryptService = await encryptServiceFactory(cache, opts);

  self.bitwardenContainerService = {
    getCryptoService: () => cryptoService,
    getEncryptService: () => encryptService,
  };

  const stateService = await stateServiceFactory(cache, opts);

  const user = await stateService.getUserId();
  await stateService.setActiveUser(user);

  // Build required services
  const logService = await logServiceFactory(cache, opts);
  const authService = await authServiceFactory(cache, opts);

  const authStatus = await authService.getAuthStatus();
  if (authStatus < AuthenticationStatus.Unlocked) {
    // TODO: Add back in unlock on autofill
    logService.info("Currently not unlocked, MV3 does not support unlock on autofill currently.");
    return;
  }

  // Create pointer for search service
  let searchService: SearchService = null;

  // This sets up cipherService to be created with a pointer to the local searchService
  await cipherServiceFactory(cache, {
    ...opts,
    cipherServiceOptions: {
      searchServiceFactory: () => searchService,
    },
  });

  // Fill that pointer with a real object
  searchService = await searchServiceFactory(cache, opts);

  // Continue making servies
  const autofillService = await autofillServiceFactory(cache, opts);

  const command = new AutoFillActiveTabCommand(autofillService);
  await command.doAutoFillActiveTabCommand(tab);
};

const doGeneratePasswordToClipboard = async (tab: chrome.tabs.Tab): Promise<void> => {
  const stateFactory = new StateFactory(GlobalState, Account);

  const cache = {};

  const options: PasswordGenerationServiceInitOptions = {
    cryptoFunctionServiceOptions: {
      win: self,
    },
    encryptServiceOptions: {
      logMacFailures: false,
    },
    logServiceOptions: {
      isDev: false,
    },
    platformUtilsServiceOptions: {
      biometricCallback: () => Promise.resolve(true),
      clipboardWriteCallback: (_clipboardValue, _clearMs) => Promise.resolve(),
      win: self,
    },
    stateMigrationServiceOptions: {
      stateFactory: stateFactory,
    },
    stateServiceOptions: {
      stateFactory: stateFactory,
    },
  };

  const passwordGenerationService = await passwordGenerationServiceFactory(cache, options);

  const [passwordGenerationOptions] = await passwordGenerationService.getOptions();
  const password = await passwordGenerationService.generatePassword(passwordGenerationOptions);
  sendTabsMessage(tab.id, {
    command: "copyText",
    text: password,
  });

  const stateService = await stateServiceFactory(cache, options);
  const clearClipboard = await stateService.getClearClipboard();

  if (clearClipboard != null) {
    chrome.alarms.create("clearClipboard", {
      when: Date.now() + clearClipboard * 1000,
    });
  }
};
