import asyncHandler from "../../shared/utils/asyncHandler.js";
import { Role } from "../../models/initModels.js";
import {
  createUserService,
  getUsersService,
  updateUserService,
  deleteUserService,
} from "./users.service.js";

export const createUser = asyncHandler(async (req, res) => {
  const user = await createUserService(req.body, req.user);
  res.status(201).json({ success: true, data: user });
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await getUsersService(req.user, req.companyFilter);
  res.json({ success: true, data: users });
});
export const updateUser = asyncHandler(async (req, res) => {
  const user = await updateUserService(req.params.id, req.body, req.user);
  res.json({ success: true, data: user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  await deleteUserService(req.params.id, req.user);
  res.json({ success: true, message: "User deleted successfully" });
});

export const getRoles = asyncHandler(async (req, res) => {
  const roles = await Role.findAll();
  res.json({ success: true, data: roles });
});