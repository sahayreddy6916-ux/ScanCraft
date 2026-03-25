export type UserRole = 'user' | 'admin' | 'super-user';

export interface User {
  id: number;
  email: string;
  role: UserRole;
}

export interface Log {
  id: number;
  userId: number;
  action: string;
  details: string;
  createdAt: string;
  User?: {
    email: string;
  };
}

export interface AppMode {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export interface GeneratedCode {
  id: number;
  userId: number;
  type: 'barcode' | 'qr';
  format: string;
  value: string;
  options: string; // JSON string
  createdAt: string;
}

export interface CodeOptions {
  width: number;
  height: number;
  margin: number;
  displayValue: boolean;
  background: string;
  lineColor: string;
}
