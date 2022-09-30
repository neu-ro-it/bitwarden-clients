import { AuthenticationStatus } from "@bitwarden/common/enums/authenticationStatus";
import { StateFactory } from "@bitwarden/common/factories/stateFactory";
import { GlobalState } from "@bitwarden/common/models/domain/globalState";
import { AuthService } from "@bitwarden/common/services/auth.service";
import { CipherService } from "@bitwarden/common/services/cipher.service";
import { ConsoleLogService } from "@bitwarden/common/services/consoleLog.service";
import { EncryptService } from "@bitwarden/common/services/encrypt.service";
import { NoopEventService } from "@bitwarden/common/services/noopEvent.service";
import { SearchService } from "@bitwarden/common/services/search.service";
import { SettingsService } from "@bitwarden/common/services/settings.service";
import { StateMigrationService } from "@bitwarden/common/services/stateMigration.service";
import { WebCryptoFunctionService } from "@bitwarden/common/services/webCryptoFunction.service";

import {
  passwordGenerationServiceFactory,
  PasswordGenerationServiceInitOptions,
} from "../background/service_factories/password-generation-service.factory";
import { stateServiceFactory } from "../background/service_factories/state-service.factory";
import { sendTabsMessage } from "../browser/sendTabsMessage";
import { AutoFillActiveTabCommand } from "../commands/autoFillActiveTabCommand";
import { Account } from "../models/account";
import { StateService as AbstractStateService } from "../services/abstractions/state.service";
import AutofillService from "../services/autofill.service";
import { BrowserCryptoService } from "../services/browserCrypto.service";
import BrowserLocalStorageService from "../services/browserLocalStorage.service";
import BrowserPlatformUtilsService from "../services/browserPlatformUtils.service";
import I18nService from "../services/i18n.service";
import { KeyGenerationService } from "../services/keyGeneration.service";
import { LocalBackedSessionStorageService } from "../services/localBackedSessionStorage.service";
import { StateService } from "../services/state.service";

export const onCommandListener = async (command: string, tab: chrome.tabs.Tab) => {
  switch (command) {
    case "autofill_login":
      await doAutoFillLogin(tab);
      break;
    case "generate_password":
      await doGeneratePasswordToClipboard(tab);
      break;
  }
};

const doAutoFillLogin = async (tab: chrome.tabs.Tab): Promise<void> => {
  const logService = new ConsoleLogService(false);

  const cryptoFunctionService = new WebCryptoFunctionService(self);

  const storageService = new BrowserLocalStorageService();

  const secureStorageService = new BrowserLocalStorageService();

  const memoryStorageService = new LocalBackedSessionStorageService(
    new EncryptService(cryptoFunctionService, logService, false),
    new KeyGenerationService(cryptoFunctionService)
  );

  const stateFactory = new StateFactory(GlobalState, Account);

  const stateMigrationService = new StateMigrationService(
    storageService,
    secureStorageService,
    stateFactory
  );

  const stateService: AbstractStateService = new StateService(
    storageService,
    secureStorageService,
    memoryStorageService, // AbstractStorageService
    logService,
    stateMigrationService,
    stateFactory
  );

  await stateService.init();

  const platformUtils = new BrowserPlatformUtilsService(
    null, // MessagingService
    null, // clipboardWriteCallback
    null // biometricCallback
  );

  const cryptoService = new BrowserCryptoService(
    cryptoFunctionService,
    null, // AbstractEncryptService
    platformUtils,
    logService,
    stateService
  );

  const settingsService = new SettingsService(stateService);

  const i18nService = new I18nService(chrome.i18n.getUILanguage());

  await i18nService.init();

  // Don't love this pt.1
  let searchService: SearchService = null;

  const cipherService = new CipherService(
    cryptoService,
    settingsService,
    null, // ApiService
    null, // FileUploadService,
    i18nService,
    () => searchService, // Don't love this pt.2
    logService,
    stateService
  );

  // Don't love this pt.3
  searchService = new SearchService(cipherService, logService, i18nService);

  // TODO: Remove this before we encourage anyone to start using this
  const eventService = new NoopEventService();

  const autofillService = new AutofillService(
    cipherService,
    stateService,
    null, // TotpService
    eventService,
    logService
  );

  const authService = new AuthService(
    cryptoService, // CryptoService
    null, // ApiService
    null, // TokenService
    null, // AppIdService
    platformUtils,
    null, // MessagingService
    logService,
    null, // KeyConnectorService
    null, // EnvironmentService
    stateService,
    null, // TwoFactorService
    i18nService
  );

  const authStatus = await authService.getAuthStatus();
  if (authStatus < AuthenticationStatus.Unlocked) {
    // TODO: Add back in unlock on autofill
    logService.info("Currently not unlocked, MV3 does not support unlock on autofill currently.");
    return;
  }

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
