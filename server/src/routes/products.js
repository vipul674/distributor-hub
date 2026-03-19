import { Router } from "express";
import { Product } from "../models/Product.js";
import { mergeProductsWithSalesCatalog } from "../services/productCatalog.js";

function inferStatus(stockQty, reorderLevel = 20) {
  return Number(stockQty) <= Number(reorderLevel) ? "low-stock" : "in-stock";
}

async function nextProductId() {
  const last = await Product.findOne().sort({ id: -1 }).select({ id: 1 }).lean();
  return (last?.id ?? 0) + 1;
}

export function createProductsRouter({ store, dbEnabled }) {
  const router = Router();

  router.get("/", async (_req, res, next) => {
    try {
      if (!dbEnabled) {
        res.json(mergeProductsWithSalesCatalog(store.getProducts(), store.getAllBills()));
        return;
      }

      const products = await Product.find().sort({ id: 1 }).select({ _id: 0, __v: 0 }).lean();
      res.json(mergeProductsWithSalesCatalog(products, store.getAllBills()));
    } catch (error) {
      next(error);
    }
  });

  router.post("/", async (req, res, next) => {
    try {
      const payload = req.body ?? {};

      if (!dbEnabled) {
        const created = store.createProduct({
          ...payload,
          status: payload.status ?? inferStatus(payload.stockQty, payload.reorderLevel ?? 20),
        });
        res.status(201).json({ ...created, source: "manual" });
        return;
      }

      const id = await nextProductId();
      const doc = await Product.create({
        id,
        productCode: payload.productCode ?? null,
        name: payload.name,
        category: payload.category,
        supplier: payload.supplier,
        costPrice: payload.costPrice,
        sellingPrice: payload.sellingPrice,
        stockQty: payload.stockQty,
        reorderLevel: payload.reorderLevel ?? null,
        warehouse: payload.warehouse ?? null,
        damagedQty: payload.damagedQty ?? 0,
        status: payload.status ?? inferStatus(payload.stockQty, payload.reorderLevel ?? 20),
      });
      const created = await Product.findOne({ id: doc.id }).select({ _id: 0, __v: 0 }).lean();
      res.status(201).json({ ...created, source: "manual" });
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

      if (!dbEnabled) {
        const updated = store.updateProduct(id, {
          ...payload,
          status: payload.status ?? (payload.stockQty !== undefined
            ? inferStatus(payload.stockQty, payload.reorderLevel ?? 20)
            : undefined),
        });

        if (!updated) {
          res.status(404).json({ message: "Product not found" });
          return;
        }

        res.json({ ...updated, source: "manual" });
        return;
      }

      const existingProduct = await Product.findOne({ id })
        .select({ id: 1, stockQty: 1, reorderLevel: 1 })
        .lean();
      if (!existingProduct) {
        res.status(404).json({ message: "Product not found" });
        return;
      }

      const nextStockQty = payload.stockQty ?? existingProduct.stockQty;
      const nextReorderLevel = payload.reorderLevel ?? existingProduct.reorderLevel ?? 20;

      const updates = {
        productCode: payload.productCode,
        name: payload.name,
        category: payload.category,
        supplier: payload.supplier,
        costPrice: payload.costPrice,
        sellingPrice: payload.sellingPrice,
        stockQty: payload.stockQty,
        reorderLevel: payload.reorderLevel,
        warehouse: payload.warehouse,
        damagedQty: payload.damagedQty,
        status: payload.status ?? inferStatus(nextStockQty, nextReorderLevel),
      };

      const updated = await Product.findOneAndUpdate(
        { id },
        Object.fromEntries(Object.entries(updates).filter(([, value]) => value !== undefined)),
        { new: true }
      )
        .select({ _id: 0, __v: 0 })
        .lean();

      res.json({ ...updated, source: "manual" });
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

      if (!dbEnabled) {
        const deleted = store.deleteProduct(id);
        if (!deleted) {
          res.status(404).json({ message: "Product not found" });
          return;
        }

        res.status(204).send();
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
