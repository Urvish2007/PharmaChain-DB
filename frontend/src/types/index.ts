export interface User {
  username: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  role: string;
}

export interface InventoryShortage {
  itemId: number;
  materialName: string;
  materialType: string;
  currentStock: number;
  minimumRequired: number;
  unitsToOrder: number;
}

export interface ExpiryRisk {
  batchNo: number;
  productName: string;
  expDate: string;
  daysRemaining: number;
  riskStatus: string;
  manufacturedQty: number;
  totalSoldQty: number;
  unsoldInventory: number;
}

export interface BatchTraceability {
  batchNo: number;
  productName: string;
  mfgDate: string;
  expDate: string;
  qcStatus: string;
  rawMaterialsUsed: string;
  totalSoldToMarket: number;
}
