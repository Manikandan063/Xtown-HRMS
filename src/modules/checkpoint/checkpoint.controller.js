import asyncHandler from "../../shared/utils/asyncHandler.js";
import { db } from "../../models/initModels.js";

const { Checkpoint } = db;

export const createCheckpoint = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;
  const checkpoint = await Checkpoint.create({
    ...req.body,
    companyId,
  });
  res.status(201).json({ success: true, data: checkpoint });
});

export const getCheckpoints = asyncHandler(async (req, res) => {
  const companyId = req.user.companyId;
  const checkpoints = await Checkpoint.findAll({
    where: { companyId },
  });
  res.status(200).json({ success: true, data: checkpoints });
});

export const updateCheckpoint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const companyId = req.user.companyId;
  const checkpoint = await Checkpoint.findOne({ where: { id, companyId } });
  if (!checkpoint) return res.status(404).json({ message: "Checkpoint not found" });

  await checkpoint.update(req.body);
  res.status(200).json({ success: true, data: checkpoint });
});

export const deleteCheckpoint = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const companyId = req.user.companyId;
  const checkpoint = await Checkpoint.findOne({ where: { id, companyId } });
  if (!checkpoint) return res.status(404).json({ message: "Checkpoint not found" });

  await checkpoint.destroy();
  res.status(200).json({ success: true, message: "Checkpoint deleted" });
});
