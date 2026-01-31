

export const EUserRole = {
    ADMIN: "ADMIN",
    STAFF: "STAFF",
    MANAGE: "MANAGE",
    PURCHASE: "PURCHASE",
    SALE: "SALE",
} as const;

export type EUserRole = keyof typeof EUserRole;

export interface DynamicKeyObject {
  [key: string]: any;
}