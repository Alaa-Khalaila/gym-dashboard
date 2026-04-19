import { Response, NextFunction } from "express";
import { z } from "zod";
import { AuthRequest } from "../types/index.js";
import * as membersService from "../services/members.service.js";

const createSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email().optional(),
  gender: z.enum(["male", "female"]),
  birthDate: z.string().optional(),
  notes: z.string().optional(),
});

const updateSchema = createSchema.partial();

export async function getAll(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const members = await membersService.getAllMembers({ search, status });
    res.json({ success: true, data: members });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const member = await membersService.getMemberById(req.params.id);
    res.json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createSchema.parse(req.body);
    const member = await membersService.createMember({
      ...data,
      createdById: req.user!.sub,
    });
    res.status(201).json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = updateSchema.parse(req.body);
    const member = await membersService.updateMember(req.params.id, data);
    res.json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await membersService.deleteMember(req.params.id);
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}
