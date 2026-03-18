import { Router } from "express";
import { Product } from "../models/Product.js";

function inferStatus(stockQty) {
  return Number(stockQty) < 20 ? "low-stock" : "in-stock";
}

async function nextProductId() {
  const last = await Product.findOne().sort({ id: -1 }).select({ id: 1 }).lean();
  return (last?.id ?? 0) + 1;
}

export function createProductsRouter() {
  const router = Router();

  router.get("/", async (_req, res, next) => {
    try {
      const products = await Product.find().sort({ id: 1 }).select({ _id: 0, __v: 0 }).lean();
      res.json(products);
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const payload = req.body ?? {};
      const id = await nextProductId();
      const doc = await Product.create({
        id,
        name: payload.name,
        category: payload.category,
        supplier: payload.supplier,
        costPrice: payload.costPrice,
        sellingPrice: payload.sellingPrice,
        stockQty: payload.stockQty,
        status: payload.status ?? inferStatus(payload.stockQty),
      });
      const created = await Product.findOne({ id: doc.id }).select({ _id: 0, __v: 0 }).lean();
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  });

  router.put("/:id", async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const payload = req.body ?? {};
      if (Number.isNaN(id)) {
        res.status(400).json({ message: "Invalid id" });
        return;
      }

      const updates = {
        name: payload.name,
        category: payload.category,
        supplier: payload.supplier,
        costPrice: payload.costPrice,
        sellingPrice: payload.sellingPrice,
        stockQty: payload.stockQty,
        status: payload.status ?? inferStatus(payload.stockQty),
      };

      const updated = await Product.findOneAndUpdate({ id }, updates, { new: true })
        .select({ _id: 0, __v: 0 })
        .lean();

      if (!updated) {
        res.status(404).json({ message: "Product not found" });
        return;
      }
      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  router.delete("/:id", async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        res.status(400).json({ message: "Invalid id" });
        return;
      }
      const result = await Product.deleteOne({ id });
      if (result.deletedCount === 0) {
        res.status(404).json({ message: "Product not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}

