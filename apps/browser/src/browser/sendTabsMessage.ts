import { TabMessage } from "../types/tab-messages";

export const sendTabsMessage = <T = unknown>(
  tabId: number,
  message: TabMessage,
  responseCallback?: (response: T) => void
) => {
  chrome.tabs.sendMessage<TabMessage, T>(tabId, message, responseCallback);
};
