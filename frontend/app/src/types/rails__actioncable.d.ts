declare module "@rails/actioncable" {
  export function createConsumer(url?: string): Consumer;

  export interface Consumer {
    subscriptions: Subscriptions;
    send(data: any): boolean;
    connect(): void;
    disconnect(): void;
    ensureConnected(): void;
  }

  export interface Subscriptions {
    create(
      channel: string | ChannelNameWithParams,
      mixin: Partial<Subscription>
    ): Subscription;
  }

  export interface ChannelNameWithParams {
    channel: string;
    [key: string]: any;
  }

  export interface Subscription {
    connected?(): void;
    disconnected?(): void;
    received?(data: any): void;
    send(data: any): boolean;
    unsubscribe(): void;
  }
}
