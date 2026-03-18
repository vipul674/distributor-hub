import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;

  if (!token) {
    res.status(401).json({ message: "Missing authorization token" });
    return;
  }

  if (!process.env.JWT_SECRET) {
    res.status(500).json({ message: "JWT_SECRET is not configured" });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

