import express, { Request, Response } from "express";
import PrismaClient from "../bin/prisma-client";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  let location = "";

  if (req.query.location) {
    location = req.query.location as string;
  }

  try {
    if (location !== "") {
      if (location === "patriot_place") {
        // Use Prisma to fetch all departments
        const departments = await PrismaClient.department.findMany({
          where: {
            building: {
              name: {
                endsWith: "Patriot Place",
              },
            },
          },
          orderBy: [{ name: "asc" }, { floor: "asc" }],
          include: { building: true },
        });

        // Send the data as JSON to the browser
        res.json(departments);
      } else if (location === "chestnut_hill") {
        // Use Prisma to fetch all departments
        const departments = await PrismaClient.department.findMany({
          where: {
            building: {
              name: "Chestnut Hill Hospital",
            },
          },
          orderBy: [{ name: "asc" }, { floor: "asc" }],
          include: { building: true },
        });

        // Send the data as JSON to the browser
        res.json(departments);
      } else if (location === "faulkner-belkin") {
        // Use Prisma to fetch all departments
        const departments = await PrismaClient.department.findMany({
          where: {
            OR: [
              {
                building: {
                  name: "Faulkner Hospital",
                },
              },
              {
                building: {
                  name: "Belkin House",
                },
              },
            ],
          },
          orderBy: [{ name: "asc" }, { floor: "asc" }],
          include: { building: true },
        });

        // Send the data as JSON to the browser
        res.json(departments);
      } else if (location === "main_campus") {
        // Use Prisma to fetch all departments
        const departments = await PrismaClient.department.findMany({
          where: {
            building: {
              name: "Main Campus",
            },
          },
          orderBy: [{ name: "asc" }, { floor: "asc" }],
          include: { building: true },
        });

        // Send the data as JSON to the browser
        res.json(departments);
      } else {
        res.status(400).send("Bad location!");
      }
    } else {
      // Use Prisma to fetch all departments
      const departments = await PrismaClient.department.findMany({
        orderBy: [{ buildingID: "asc" }, { name: "asc" }, { floor: "asc" }],
        include: { building: true },
      });

      // Send the data as JSON to the browser
      res.json(departments);
    }
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
});

export default router;
