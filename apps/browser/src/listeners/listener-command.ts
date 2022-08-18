export interface ListenerCommand {
  run: () => Promise<void>;
}
