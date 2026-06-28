import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "../db";
import crypto from "crypto";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, "treetrack-india-salt-v2", 12000, 64, "sha512").toString("hex");
}

// GET /api/admin/users - List all users
router.get("/admin/users", async (_req, res): Promise<void> => {
  try {
    const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
    
    res.json({ users, total: users.length });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// POST /api/admin/users - Create new user
router.post("/admin/users", async (req, res): Promise<void> => {
  try {
    const { name, email, password, role, state } = req.body as Record<string, string>;

    if (!name?.trim() || !email?.trim() || !password || !role || !state) {
      return res.status(400).json({ error: "Name, email, password, role, and state are required." });
    }

    if (!["citizen", "officer", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role. Must be 'citizen', 'officer', or 'admin'." });
    }

    // Check if email already exists
    const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase().trim())).limit(1);

    if (existingUser.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const [newUser] = await db.insert(usersTable).values({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: hashPassword(password),
      role,
      state,
    }).returning();

    res.status(201).json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        state: newUser.state,
        createdAt: newUser.createdAt,
      }
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// PUT /api/admin/users/:id - Update user
router.put("/admin/users/:id", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const { name, email, state, role } = req.body as Record<string, string>;

    // Check if user exists
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check email uniqueness if changing
    if (email && email.toLowerCase().trim() !== user.email) {
      const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase().trim())).limit(1);
      if (existingUser.length > 0 && existingUser[0].id !== id) {
        return res.status(409).json({ error: "An account with this email already exists." });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (state) updateData.state = state;
    if (role) updateData.role = role;

    const [updated] = await db.update(usersTable).set(updateData).where(eq(usersTable.id, id)).returning();

    res.json({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        state: updated.state,
        createdAt: updated.createdAt,
      }
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete("/admin/users/:id", async (req, res): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Check if user exists and delete
    const result = await db.delete(usersTable).where(eq(usersTable.id, id)).returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
