import { GeneratePasswordToClipboardCommand } from "../../commands/generate-password-to-clipboard-command";

import { factory, FactoryOptions } from "./factory-options";
import {
  passwordGenerationServiceFactory,
  PasswordGenerationServiceInitOptions,
} from "./password-generation-service.factory";
import { stateServiceFactory, StateServiceInitOptions } from "./state-service.factory";

type GeneratePasswordToClipboardCommandOptions = FactoryOptions;

export type GeneratePasswordToClipboardCommandInitOptions =
  GeneratePasswordToClipboardCommandOptions &
    PasswordGenerationServiceInitOptions &
    StateServiceInitOptions;

export function generatePasswordToClipboardCommandFactory(
  cache: { generatePasswordToClipboardCommand?: GeneratePasswordToClipboardCommand },
  opts: GeneratePasswordToClipboardCommandInitOptions
): Promise<GeneratePasswordToClipboardCommand> {
  return factory(
    cache,
    "generatePasswordToClipboardCommand",
    opts,
    async () =>
      new GeneratePasswordToClipboardCommand(
        await passwordGenerationServiceFactory(cache, opts),
        await stateServiceFactory(cache, opts)
      )
  );
}
