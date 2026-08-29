export interface User {
  username: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  role: string;
}

export interface InventoryShortage {
  materialId: string;
  materialName: string;
  stock: number;
  reorderLevel: number;
  shortage: number;
  unit: string;
}

export interface ExpiryRisk {
  batchNo: string;
  productId: string;
  productName: string;
  stockQty: number;
  mfgDate: string;
  expiryDate: string;
  daysToExpiry: number;
}

export interface BatchTraceability {
  batchNo: string;
  productId: string;
  productName: string;
  mfgDate: string;
  expiryDate: string;
  stockQty: number;
  yieldPercentage: number;
  qcStatus: string;
  qcResult: string;
  soldQty: number;
  remainingSaleable: number;
}
