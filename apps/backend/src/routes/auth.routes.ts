import express, { Request, Response, Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import PrismaClient from "../bin/prisma-client";
import { getFrontendUrl } from "./utils/urls";

const router = express.Router();

// This is so we can actually sign up
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, fullName } = req.body;
    // Validate input (this will block anyone from skipping email or password) or at least I hope bruh ts too unpredicatle
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    if (password.length < 6) {
      res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
      return;
    }
    // Check if user already exists (block duplicate accounts but thats like chill )
    const existingUser = await PrismaClient.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({ error: "User already exists" });
      return;
    }
    // Hash the password (hope this isnt the part thats breaking stuff)
    const hashedPassword = await bcrypt.hash(password, 10);
    const numberOfUsers = await PrismaClient.user.count();

    const user = await PrismaClient.user.create({
      data: {
        email,
        password: hashedPassword,
        isAdmin: numberOfUsers === 0, // the first user in the database is automatically admin
        employee: {
          create: { name: fullName },
        },
      },
    });
    // Send success response XD - do not laugh at the XD i was feeling it
    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      error: "An error occurred during registration",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// User login - creates a client for the user if needed but should make a separate sign up
router.post("/login", async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    const user = await PrismaClient.user.findUnique({
      where: { email },
      include: { employee: true },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "24h" },
    );

    // Find or create an OAuth client for this user (this is for service tokens and stuff)
    let client = await PrismaClient.client.findFirst({
      where: { name: email },
    });
    // Generate random clientId and clientSecret
    if (!client) {
      const clientId = crypto.randomBytes(16).toString("hex");
      const clientSecret = crypto.randomBytes(32).toString("hex");
      // Create the client
      client = await PrismaClient.client.create({
        data: {
          name: email,
          clientId,
          clientSecret,
          redirectUris: [],
          grants: ["client_credentials"],
          userId: user.id,
        },
      });
    }
    // Return user info and client credentials (including isAdmin for frontend)
    res.json({
      token,
      userId: user.id,
      email: user.email,
      clientId: client.clientId,
      clientSecret: client.clientSecret,
      name: user.employee.name,
      isAdmin: user.isAdmin,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

/*OAuth2 token endpoint - exchanges client credentials for an access token this made me legit crashout Idk why it has
such bad specifc synatax it could just be normal but NO it wants me to suffer*/
router.post(
  "/oauth/token",
  passport.authenticate("oauth2-client-password", { session: false }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const client = req.user as any;

      if (!client) {
        res.status(401).json({ error: "Invalid client credentials" });
        return;
      }
      // Create a JWT token with client information
      const token = jwt.sign(
        {
          clientId: client.clientId,
          userId: client.userId,
        },
        process.env.JWT_SECRET || "your_jwt_secret",
        { expiresIn: "24h" },
      );
      // Return the token in OAuth2 format
      res.json({
        access_token: token,
        token_type: "Bearer",
        expires_in: 3600,
        scope: "read write",
      });
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ error: error.message });
    }
  },
);

// Verify token endpoint this was easy
router.get(
  "/verify",
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const client = req.user as { userId: string };

      if (!client) {
        res.status(401).json({ error: "Invalid token" });
        return;
      }
      // Get the associated user
      const user = await PrismaClient.user.findUnique({
        where: { id: client.userId },
      });

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json({
        message: "Token is valid",
        user: {
          id: user.id,
          email: user.email,
        },
      });
    } catch (err) {
      const error = err as Error;
      res.status(500).json({ error: error.message });
    }
  },
);



router.get(
  "/has-password",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const user = req.user as { id: string };

      if (!user?.id) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const foundUser = await PrismaClient.user.findUnique({
        where: { id: user.id },
        select: { password: true },
      });

      if (!foundUser) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const hasPassword =
        typeof foundUser.password === "string" &&
        foundUser.password.trim() !== "";
      res.json({ hasPassword });
    } catch (err) {
      console.error("Error checking password existence:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);



router.post(
  "/password",
  passport.authenticate("jwt", { session: false }),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as {
        id: string;
        password: string;
        email: string;
      };

      if (!user?.id) {
        console.error("Missing user ID from req.user");
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const foundUser = await PrismaClient.user.findUnique({
        where: { id: user.id },
      });

      if (!foundUser) {
        console.error("User not found in database:", user.id);
        res.status(404).json({ error: "User not found" });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      console.log("Password update request:", {
        userId: user.id,
        currentPasswordProvided: !!currentPassword,
        newPasswordLength: newPassword?.length,
      });

      if (!newPassword || newPassword.length < 6) {
        res
          .status(400)
          .json({ error: "New password must be at least 6 characters long" });
        return;
      }

      const userHasPassword =
        typeof foundUser.password === "string" &&
        foundUser.password.trim() !== "";

      if (userHasPassword) {
        if (!currentPassword) {
          res.status(400).json({ error: "Current password is required" });
          return;
        }

        const isValid = await bcrypt.compare(
          currentPassword,
          foundUser.password,
        );
        if (!isValid) {
          res.status(403).json({ error: "Current password is incorrect" });
          return;
        }
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      await PrismaClient.user.update({
        where: { id: foundUser.id },
        data: { password: hashedNewPassword },
      });

      res
        .status(200)
        .json({ success: true, message: "Password updated successfully" });
    } catch (err) {
      console.error("Password update error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Google OAuth2 authentication route DO NOT CHANGE THIS I WILL END YOU - this is not a joke everything will break
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// Google OAuth2 callback route - SAME THING DO NOT CHANGE
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req: Request, res: Response) => {
    try {
      if (!process.env.JWT_SECRET)
        throw new Error("JWT_SECRET is not configured");
      if (!req.user) throw new Error("User not found in request");

      const user = req.user as {
        id: string;
        email: string;
        employee: { id: number; name: string; role: string | null };
        isAdmin: boolean;
      };

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      const frontendUrl = getFrontendUrl();
      res.redirect(
        `${frontendUrl}/login?token=${token}&email=${user.email}&name=${user.employee.name}&isAdmin=${user.isAdmin}`,
      );
    } catch (error) {
      console.error("Error in Google OAuth callback:", error);
      res.redirect("/login?error=auth_failed");
    }
  },
);

// GitHub OAuth2 authentication route
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
);

// GitHub OAuth2 callback route
router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req: Request, res: Response) => {
    try {
      if (!process.env.JWT_SECRET)
        throw new Error("JWT_SECRET is not configured");
      if (!req.user) throw new Error("User not found in request");

      const user = req.user as {
        id: string;
        email: string;
        employee: { id: number; name: string; role: string | null };
        isAdmin: boolean;
      };

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });
      const frontendUrl = getFrontendUrl();
      res.redirect(
        `${frontendUrl}/login?token=${token}&email=${user.email}&name=${user.employee.name}&isAdmin=${user.isAdmin}`,
      );
    } catch (error) {
      console.error("Error in GitHub OAuth callback:", error);
      res.redirect("/login?error=auth_failed");
    }
  },
);

export default router;
