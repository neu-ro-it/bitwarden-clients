import MainBackground from "./background/main.background";
import { BrowserApi } from "./browser/browserApi";
import { onCommandListener } from "./listeners/onCommandListener";
import { onInstallListener } from "./listeners/onInstallListener";
import { UpdateBadge } from "./listeners/update-badge";

if (BrowserApi.manifestVersion === 3) {
  chrome.commands.onCommand.addListener(onCommandListener);
  chrome.runtime.onInstalled.addListener(onInstallListener);
  UpdateBadge.registerListeners();
} else {
  const bitwardenMain = ((window as any).bitwardenMain = new MainBackground());
  bitwardenMain.bootstrap().then(() => {
    // Finished bootstrapping
  });
}
