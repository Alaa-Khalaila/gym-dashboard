import { Request } from "express";

export type Role = "super_admin" | "admin";

export interface JwtPayload {
  sub: string;
  role: Role;
  name: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
