import { db } from "../../models/initModels.js";
import AppError from "../../shared/utils/appError.js";
import asyncHandler from "../../shared/utils/asyncHandler.js";

const { Terminal } = db;

export const getTerminals = asyncHandler(async (req, res) => {
  const terminals = await Terminal.findAll({
    where: { companyId: req.user.companyId }
  });

  res.status(200).json({
    success: true,
    data: terminals
  });
});

export const createTerminal = asyncHandler(async (req, res) => {
  const terminal = await Terminal.create({
    ...req.body,
    companyId: req.user.companyId
  });

  res.status(201).json({
    success: true,
    data: terminal
  });
});

export const updateTerminal = asyncHandler(async (req, res) => {
  const terminal = await Terminal.findOne({
    where: { id: req.params.id, companyId: req.user.companyId }
  });

  if (!terminal) {
    throw new AppError("Terminal not found", 404);
  }

  await terminal.update(req.body);

  res.status(200).json({
    success: true,
    data: terminal
  });
});

export const deleteTerminal = asyncHandler(async (req, res) => {
  const terminal = await Terminal.findOne({
    where: { id: req.params.id, companyId: req.user.companyId }
  });

  if (!terminal) {
    throw new AppError("Terminal not found", 404);
  }

  await terminal.destroy();

  res.status(200).json({
    success: true,
    message: "Terminal deleted successfully"
  });
});
