import express, { Router } from "express";
import PrismaClient from "../bin/prisma-client";
import { Request, Response } from "express";
const router = express.Router();

// Whenever a get request is made, return the employee data
router.get("/", async (req, res) => {
  if (req.query.email) {
    const email = req.query.email;
    try {
      const targetUser = await PrismaClient.user.findUnique({
        where: {
          email: email as string,
        },
      });
      if (targetUser) {
        const employee = await PrismaClient.employee.findUnique({
          where: {
            id: targetUser.employeeID,
          },
        });
        res.status(200).json(employee);
      } else {
        res.status(404).send("Employee not found");
      }
    } catch (e) {
      console.error("Error fetching employee: ", e);
      res.status(500).json({ error: "Failed to fetch employee" });
    }
  } else {
    try {
      // Fetch the employee information from database, including the connected user for email and admin info
      const allEmployee = await PrismaClient.employee.findMany({
        include: { connectedUser: true },
      });
      // If employees don't exist
      if (!allEmployee || allEmployee.length === 0) {
        // Log that (it's a problem)
        console.error("No employee found in database!");
        res.sendStatus(204); // Send HTTP code 204 (no data)
      } else {
        // Otherwise, send the employee info (flattened with email/admin)
        const result = allEmployee.map((emp) => ({
          id: emp.id,
          name: emp.name,
          role: emp.role,
          pronouns: emp.pronouns,
          email: emp.connectedUser?.email ?? "",
          isAdmin: emp.connectedUser?.isAdmin ?? false,
          profileColor: emp.profileColor,
        }));
        res.json(result);
      }
    } catch (err) {
      // Log if something goes wrong
      console.error("Error fetching employees: ", err);
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  }
});

// Update admin status, but prevent self-demotion hopefully coz ts is so unpredicatble
router.post("/", async (req: Request, res: Response) => {
  if (
    req.body.hasOwnProperty("id") &&
    req.body.hasOwnProperty("newAdmin") &&
    req.body.hasOwnProperty("currentUserEmail")
  ) {
    try {
      // Find the user we are trying to edit
      const targetUser = await PrismaClient.user.findUnique({
        where: {
          employeeID: parseInt(req.body.id),
        },
      });

      if (!targetUser) {
        res.status(404).json({ error: "Target user not found." });
        return;
      }

      // Prevent self-demotion (no backend update if email matches coz why would it )
      if (targetUser.email === req.body.currentUserEmail) {
        res
          .status(400)
          .json({ error: "You cannot change your own admin status." });
        return;
      }

      // Actually perform update
      await PrismaClient.user.update({
        where: {
          employeeID: parseInt(req.body.id),
        },
        data: {
          isAdmin: req.body.newAdmin,
        },
      });
      console.info("Successfully updated user!"); // Log that it was successful
      res.sendStatus(200);
    } catch (error) {
      // Log any failures
      console.error(`Unable to update user`, error);
      res.sendStatus(400); // Send error
      return;
    }
  } else if (
    req.body.hasOwnProperty("name") &&
    req.body.hasOwnProperty("birthday") &&
    req.body.hasOwnProperty("pronouns") &&
    req.body.hasOwnProperty("email")
  ) {
    const targetUser = await PrismaClient.user.findUnique({
      where: {
        email: req.body.email,
      },
    });
    if (targetUser) {
      await PrismaClient.employee.update({
        where: {
          id: targetUser.employeeID,
        },
        data: {
          name: req.body.name,
          birthday: req.body.birthday,
          pronouns: req.body.pronouns,
        },
      });
    }

    res.sendStatus(200);
  } else if (
    req.body.hasOwnProperty("newColor") &&
    req.body.hasOwnProperty("email")
  ) {
    const targetUser = await PrismaClient.user.findUnique({
      where: {
        email: req.body.email,
      },
    });
    if (targetUser) {
      await PrismaClient.employee.update({
        where: {
          id: targetUser.employeeID,
        },
        data: {
          profileColor: req.body.newColor,
        },
      });
    }

    res.sendStatus(200);
  } else {
    res
      .status(400)
      .json({ error: "Missing id, newAdmin, or currentUserEmail in request." });
  }
});

// Update hospital role
router.post("/role", async (req: Request, res: Response) => {
  if (req.body.hasOwnProperty("id") && req.body.hasOwnProperty("newRole")) {
    try {
      // Actually perform update
      await PrismaClient.employee.update({
        where: { id: parseInt(req.body.id) },
        data: { role: req.body.newRole },
      });
      res.sendStatus(200);
    } catch (error) {
      res.status(400).json({ error: "Unable to update role" });
    }
  } else {
    res.status(400).json({ error: "Missing id or newRole in request." });
  }
});

export default router;
