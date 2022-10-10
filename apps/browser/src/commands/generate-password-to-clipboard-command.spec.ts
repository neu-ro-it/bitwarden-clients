import { matches, mock, MockProxy } from "jest-mock-extended";

import { PasswordGenerationService } from "@bitwarden/common/abstractions/passwordGeneration.service";

import { BrowserApi } from "../browser/browserApi";
import { StateService } from "../services/abstractions/state.service";

import { GeneratePasswordToClipboardCommand } from "./generate-password-to-clipboard-command";

describe("GeneratePasswordToClipboardCommand", () => {
  let passwordGenerationService: MockProxy<PasswordGenerationService>;
  let stateService: MockProxy<StateService>;

  let sut: GeneratePasswordToClipboardCommand;

  beforeEach(() => {
    passwordGenerationService = mock<PasswordGenerationService>();
    stateService = mock<StateService>();

    passwordGenerationService.getOptions.mockResolvedValue([{ length: 8 }, {} as any]);

    passwordGenerationService.generatePassword.mockResolvedValue("PASSWORD");

    jest.spyOn(BrowserApi, "sendTabsMessage").mockReturnValue();

    sut = new GeneratePasswordToClipboardCommand(passwordGenerationService, stateService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("generatePasswordToClipboard", () => {
    it("has clear clipboard value", async () => {
      stateService.getClearClipboard.mockResolvedValue(5 * 60); // 5 minutes

      await sut.generatePasswordToClipboard({ id: 1 } as any);

      expect(jest.spyOn(BrowserApi, "sendTabsMessage")).toHaveBeenCalledTimes(1);

      expect(jest.spyOn(BrowserApi, "sendTabsMessage")).toHaveBeenCalledWith(1, {
        command: "copyText",
        text: "PASSWORD",
      });

      expect(stateService.setClearClipboardTime).toHaveBeenCalledTimes(1);

      expect(stateService.setClearClipboardTime).toHaveBeenCalledWith(
        matches((time: number) => {
          const now = new Date();
          const date = new Date(time);

          return date.getMinutes() - now.getMinutes() === 5;
        })
      );
    });

    it("does not have clear clipboard value", async () => {
      stateService.getClearClipboard.mockResolvedValue(null);

      await sut.generatePasswordToClipboard({ id: 1 } as any);

      expect(jest.spyOn(BrowserApi, "sendTabsMessage")).toHaveBeenCalledTimes(1);

      expect(jest.spyOn(BrowserApi, "sendTabsMessage")).toHaveBeenCalledWith(1, {
        command: "copyText",
        text: "PASSWORD",
      });

      expect(stateService.setClearClipboardTime).not.toHaveBeenCalled();
    });
  });
});
