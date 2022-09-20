import * as zxcvbn from "zxcvbn";

import { GeneratedPasswordHistory } from "../models/domain/generatedPasswordHistory";
import { PasswordGeneratorOptions } from "../models/domain/passwordGeneratorOptions";
import { PasswordGeneratorPolicyOptions } from "../models/domain/passwordGeneratorPolicyOptions";

export abstract class PasswordGenerationService {
  generatePassword: (options: PasswordGeneratorOptions) => Promise<string>;
  generatePassphrase: (options: PasswordGeneratorOptions) => Promise<string>;
  getOptions: () => Promise<[PasswordGeneratorOptions, PasswordGeneratorPolicyOptions]>;
  enforcePasswordGeneratorPoliciesOnOptions: (
    options: PasswordGeneratorOptions
  ) => Promise<[PasswordGeneratorOptions, PasswordGeneratorPolicyOptions]>;
  getPasswordGeneratorPolicyOptions: () => Promise<PasswordGeneratorPolicyOptions>;
  saveOptions: (options: PasswordGeneratorOptions) => Promise<void>;
  getHistory: () => Promise<GeneratedPasswordHistory[]>;
  addHistory: (password: string) => Promise<void>;
  clear: (userId?: string) => Promise<void>;
  passwordStrength: (password: string, userInputs?: string[]) => zxcvbn.ZXCVBNResult;
  normalizeOptions: (
    options: PasswordGeneratorOptions,
    enforcedPolicyOptions: PasswordGeneratorPolicyOptions
  ) => void;
}
