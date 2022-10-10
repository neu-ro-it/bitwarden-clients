import { StateFactory } from "@bitwarden/common/factories/stateFactory";
import { GlobalState } from "@bitwarden/common/models/domain/globalState";

import { stateServiceFactory } from "../background/service_factories/state-service.factory";
import { BrowserApi } from "../browser/browserApi";
import { Account } from "../models/account";

export class ClearClipboard {
  static async run(executionTime: Date, serviceCache: Record<string, unknown>) {
    const stateFactory = new StateFactory(GlobalState, Account);
    const stateService = await stateServiceFactory(serviceCache, {
      cryptoFunctionServiceOptions: {
        win: self,
      },
      encryptServiceOptions: {
        logMacFailures: false,
      },
      logServiceOptions: {
        isDev: false,
      },
      stateMigrationServiceOptions: {
        stateFactory: stateFactory,
      },
      stateServiceOptions: {
        stateFactory: stateFactory,
      },
    });

    const clearClipboardTime = await stateService.getClearClipboardTime();

    if (!clearClipboardTime) {
      return;
    }

    if (clearClipboardTime < executionTime.getTime()) {
      return;
    }

    const activeTabs = await BrowserApi.getActiveTabs();
    if (!activeTabs || activeTabs.length === 0) {
      return;
    }

    BrowserApi.sendTabsMessage(activeTabs[0].id, {
      command: "clearClipboard",
    });
  }
}
