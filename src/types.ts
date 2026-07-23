export interface Item {
  name: string;
  description: string | null;
  price: number;
  in_stock: boolean;
}

export interface ItemWithId extends Item {
  id: number;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
}

export interface EnvInfo {
  app_port: string | null;
  workspace_url: string | null;
  app_name: string | null;
}
