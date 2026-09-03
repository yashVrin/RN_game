import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from "react-native";

const { LocalSocketModule } = NativeModules;

export type SocketMessageCallback = (messageStr: string, senderIp?: string) => void;
export type ClientEventCallback = (data: any) => void;

class NativeSocketBridge {
  private eventEmitter: NativeEventEmitter | null = null;
  private messageListeners: Set<SocketMessageCallback> = new Set();
  private connectListeners: Set<ClientEventCallback> = new Set();
  private disconnectListeners: Set<ClientEventCallback> = new Set();

  private subMessage: EmitterSubscription | null = null;
  private subConnected: EmitterSubscription | null = null;
  private subDisconnected: EmitterSubscription | null = null;

  constructor() {
    if (LocalSocketModule) {
      this.eventEmitter = new NativeEventEmitter(LocalSocketModule);
      this.initListeners();
    }
  }

  private initListeners() {
    if (!this.eventEmitter) return;

    this.subMessage = this.eventEmitter.addListener(
      "onSocketMessage",
      (event: { message: string; senderIp?: string }) => {
        if (event && event.message) {
          this.messageListeners.forEach((cb) => cb(event.message, event.senderIp));
        }
      }
    );

    this.subConnected = this.eventEmitter.addListener(
      "onClientConnected",
      (event: any) => {
        this.connectListeners.forEach((cb) => cb(event));
      }
    );

    this.subDisconnected = this.eventEmitter.addListener(
      "onClientDisconnected",
      (event: any) => {
        this.disconnectListeners.forEach((cb) => cb(event));
      }
    );
  }

  public isSupported(): boolean {
    return !!LocalSocketModule;
  }

  public async getLocalIp(): Promise<string> {
    if (LocalSocketModule && LocalSocketModule.getLocalIpAddress) {
      try {
        const ip = await LocalSocketModule.getLocalIpAddress();
        if (ip) return ip;
      } catch {
        // fallback
      }
    }
    // Default Hotspot Gateway on Android / iOS
    return Platform.OS === "ios" ? "172.20.10.1" : "192.168.43.1";
  }

  public async startServer(port: number = 8080): Promise<boolean> {
    if (!LocalSocketModule) return false;
    try {
      await LocalSocketModule.startServer(port);
      return true;
    } catch {
      return false;
    }
  }

  public async broadcast(messageObj: any): Promise<boolean> {
    if (!LocalSocketModule) return false;
    try {
      const str = typeof messageObj === "string" ? messageObj : JSON.stringify(messageObj);
      await LocalSocketModule.broadcastMessage(str);
      return true;
    } catch {
      return false;
    }
  }

  public async stopServer(): Promise<boolean> {
    if (!LocalSocketModule) return false;
    try {
      await LocalSocketModule.stopServer();
      return true;
    } catch {
      return false;
    }
  }

  public async connect(host: string, port: number = 8080): Promise<boolean> {
    if (!LocalSocketModule) return false;
    try {
      await LocalSocketModule.connectToServer(host, port);
      return true;
    } catch {
      return false;
    }
  }

  public async send(messageObj: any): Promise<boolean> {
    if (!LocalSocketModule) return false;
    try {
      const str = typeof messageObj === "string" ? messageObj : JSON.stringify(messageObj);
      await LocalSocketModule.sendToServer(str);
      return true;
    } catch {
      return false;
    }
  }

  public async disconnect(): Promise<boolean> {
    if (!LocalSocketModule) return false;
    try {
      await LocalSocketModule.disconnectClient();
      return true;
    } catch {
      return false;
    }
  }

  public onMessage(callback: SocketMessageCallback): () => void {
    this.messageListeners.add(callback);
    return () => this.messageListeners.delete(callback);
  }

  public onClientConnected(callback: ClientEventCallback): () => void {
    this.connectListeners.add(callback);
    return () => this.connectListeners.delete(callback);
  }

  public onClientDisconnected(callback: ClientEventCallback): () => void {
    this.disconnectListeners.add(callback);
    return () => this.disconnectListeners.delete(callback);
  }
}

export const nativeSocket = new NativeSocketBridge();
