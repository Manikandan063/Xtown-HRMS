import express from "express";
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} from "./users.controller.js";

import authMiddleware from "../../shared/middlewares/auth.js";
import validate from "../../shared/middlewares/validate.js";
import { createUserSchema, updateUserSchema } from "./users.schema.js";
import companyAccess from "../../shared/middlewares/companyAccess.js";

const router = express.Router();

router.use(authMiddleware);
router.use(companyAccess());

router.post("/", validate(createUserSchema), createUser);
router.get("/", getUsers);
router.put("/:id", validate(updateUserSchema), updateUser);
router.delete("/:id", deleteUser);

export default router;