import MainBackground from "./background/main.background";
import { onAlarmListener } from "./listeners/onAlarmListener";
import { onCommandListener } from "./listeners/onCommandListener";
import { onInstallListener } from "./listeners/onInstallListener";

const manifest = chrome.runtime.getManifest();

if (manifest.manifest_version === 3) {
  chrome.commands.onCommand.addListener(onCommandListener);
  chrome.runtime.onInstalled.addListener(onInstallListener);
  chrome.alarms.onAlarm.addListener(onAlarmListener);
} else {
  const bitwardenMain = ((window as any).bitwardenMain = new MainBackground());
  bitwardenMain.bootstrap().then(() => {
    // Finished bootstrapping
  });
}
