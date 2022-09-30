import { sendTabsMessage } from "../browser/sendTabsMessage";

export const onAlarmListener = async (alarm: chrome.alarms.Alarm) => {
  switch (alarm.name) {
    case "clearClipboard": {
      const tabs = await chrome.tabs.query({
        active: true,
      });
      if (tabs && tabs.length > 0) {
        sendTabsMessage(tabs[0].id, { command: "clearClipboard" });
      }
      break;
    }
  }
};
