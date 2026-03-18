import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

function signToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing");
  }
  return jwt.sign({ sub: user._id.toString(), email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export function createAuthRouter() {
  const router = Router();

  router.post("/register", async (req, res, next) => {
    try {
      const { name, email, password } = req.body ?? {};

      if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
      }

      const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
      if (existing) {
        res.status(409).json({ message: "Email already registered" });
        return;
      }

      const passwordHash = await bcrypt.hash(String(password), 12);
      const user = await User.create({ name: name ? String(name) : undefined, email: String(email), passwordHash });

      const token = signToken(user);
      res.status(201).json({
        token,
        user: { id: user._id.toString(), name: user.name ?? null, email: user.email },
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/login", async (req, res, next) => {
    try {
      const { email, password } = req.body ?? {};
      if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
      }

      const user = await User.findOne({ email: String(email).toLowerCase().trim() });
      if (!user) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      const ok = await bcrypt.compare(String(password), user.passwordHash);
      if (!ok) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      const token = signToken(user);
      res.json({
        token,
        user: { id: user._id.toString(), name: user.name ?? null, email: user.email },
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/me", requireAuth, async (req, res, next) => {
    try {
      const userId = req.user?.sub;
      const user = userId ? await User.findById(userId) : null;
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.json({ id: user._id.toString(), name: user.name ?? null, email: user.email });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

