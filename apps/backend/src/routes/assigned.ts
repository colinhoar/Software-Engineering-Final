import express, { Router, Request, Response } from "express";
import PrismaClient from "../bin/prisma-client.ts";
const router: Router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  const servReq_db = PrismaClient.serviceRequests;

  const assignedServReqs = await servReq_db.findMany({
    where: {
      assignedEmployeeID: {
        not: null,
      },
    },
  });

  res.json(assignedServReqs);
});

export default router;
