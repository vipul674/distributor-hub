import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

function signToken(user) {
  if (!config.jwtSecret) {
    throw new Error("JWT_SECRET is missing");
  }

  const subject = user.id ?? user._id?.toString();
  return jwt.sign({ sub: String(subject), email: user.email }, config.jwtSecret, { expiresIn: "7d" });
}

export function createAuthRouter({ store, dbEnabled }) {
  const router = Router();

  router.post("/register", async (req, res, next) => {
    try {
      const { name, email, password } = req.body ?? {};
      const normalizedEmail = String(email).toLowerCase().trim();

      if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
      }

      const existing = dbEnabled
        ? await User.findOne({ email: normalizedEmail })
        : store.findUserByEmail(normalizedEmail);

      if (existing) {
        res.status(409).json({ message: "Email already registered" });
        return;
      }

      const passwordHash = await bcrypt.hash(String(password), 12);
      const user = dbEnabled
        ? await User.create({ name: name ? String(name) : undefined, email: normalizedEmail, passwordHash })
        : store.createUser({ name, email: normalizedEmail, passwordHash });

      const token = signToken(user);
      res.status(201).json({
        token,
        user: { id: user.id ?? user._id.toString(), name: user.name ?? null, email: user.email },
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

      const normalizedEmail = String(email).toLowerCase().trim();
      const user = dbEnabled
        ? await User.findOne({ email: normalizedEmail })
        : store.findUserByEmail(normalizedEmail);

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
        user: { id: user.id ?? user._id.toString(), name: user.name ?? null, email: user.email },
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/me", requireAuth, async (req, res, next) => {
    try {
      const userId = req.user?.sub;
      const user = userId
        ? dbEnabled
          ? await User.findById(userId)
          : store.findUserById(userId)
        : null;

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.json({ id: user.id ?? user._id.toString(), name: user.name ?? null, email: user.email });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
