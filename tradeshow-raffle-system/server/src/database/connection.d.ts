export interface DatabaseConnection {
  connect(): Promise<void>;
  getConnectionStatus(): boolean;
}

export declare const connectionInstance: DatabaseConnection;
export declare const connectDatabase: () => Promise<void>;
export declare const disconnectDatabase: () => Promise<void>;
