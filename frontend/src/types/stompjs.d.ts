declare module '@stomp/stompjs' {
  export interface StompHeaders {
    [key: string]: string;
  }

  export interface StompSubscription {
    id: string;
    unsubscribe: () => void;
  }

  export interface Message {
    command: string;
    headers: StompHeaders;
    body: string;
    ack: () => void;
    nack: () => void;
  }

  export interface StompConfig {
    brokerURL?: string;
    webSocketFactory?: () => WebSocket;
    connectHeaders?: StompHeaders;
    disconnectHeaders?: StompHeaders;
    heartbeatIncoming?: number;
    heartbeatOutgoing?: number;
    reconnectDelay?: number;
    debug?: (message: string) => void;
    onConnect?: (frame: Message) => void;
    onDisconnect?: (frame: Message) => void;
    onWebSocketClose?: () => void;
    onWebSocketError?: (event: Event) => void;
    onStompError?: (frame: Message) => void;
    logRawCommunication?: boolean;
    beforeConnect?: () => void;
    onUnhandledMessage?: (message: Message) => void;
    onUnhandledReceipt?: (frame: Message) => void;
    onUnhandledFrame?: (frame: Message) => void;
  }

  export class Client {
    constructor(config?: StompConfig);
    activate(): void;
    deactivate(): void;
    connected: boolean;
    readonly connectedVersion: string;
    readonly disconnectedVersion: string;
    readonly active: boolean;
    readonly webSocket: WebSocket;
    subscribe(destination: string, callback: (message: Message) => void, headers?: StompHeaders): StompSubscription;
    publish(parameters: {
      destination: string;
      body?: string;
      headers?: StompHeaders;
      skipContentLengthHeader?: boolean;
    }): void;
    begin(transactionId?: string): void;
    commit(transactionId?: string): void;
    abort(transactionId?: string): void;
    debug(...args: any[]): void;
    connected: boolean;
  }
} 