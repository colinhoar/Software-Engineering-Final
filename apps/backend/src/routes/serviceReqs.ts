import express from "express";
import { Request, Response } from "express";
import PrismaClient from "../bin/prisma-client";
import { Prisma } from "database";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const serviceRequests = await PrismaClient.serviceRequests.findMany({
      include: {
        PatientTransportationRequest: true,
        FacilityMaintenanceRequest: true,
      },
    });

    // Send the data as JSON to the browser
    res.json(serviceRequests);
  } catch (error) {
    console.error("Error fetching service requests:", error);
    res.status(500).json({ error: "Failed to fetch service requests" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  if (
    req.body.hasOwnProperty("newAssignedEmployee") &&
    req.body.hasOwnProperty("requestID")
  ) {
    try {
      // Attempt to create in the database
      await PrismaClient.serviceRequests.update({
        where: {
          requestID: parseInt(req.body.requestID),
        },
        data: {
          assignedEmployeeID: parseInt(req.body.newAssignedEmployee),
        },
      });
      console.info("Successfully updated service request!"); // Log that it was successful
    } catch (error) {
      // Log any failures
      console.error(`Unable to update service request`);
      res.sendStatus(400); // Send error
      return; // Don't try to send duplicate statuses
    }
    res.sendStatus(200);
  } else if (
    req.body.hasOwnProperty("newStatus") &&
    req.body.hasOwnProperty("requestID")
  ) {
    try {
      // Attempt to create in the database
      await PrismaClient.serviceRequests.update({
        where: {
          requestID: parseInt(req.body.requestID),
        },
        data: {
          status: req.body.newStatus,
        },
      });
      console.info("Successfully updated service request!");
    } catch (error) {
      // Log any failures
      console.error(`Unable to update service request`);
      res.sendStatus(400);
      return;
    }
    res.sendStatus(200);
  } else {
    const serviceRequest: Prisma.ServiceRequestsCreateInput = req.body;
    try {
      await PrismaClient.serviceRequests.create({ data: serviceRequest });
      console.info("Successfully saved service request!"); // Log that it was successful
    } catch (error) {
      console.error(
        `Unable to save ${serviceRequest.serviceCategory} - ${serviceRequest.requestedService}: ${error}`,
      );
      res.sendStatus(400); // Send error
      return;
    }
    res.sendStatus(200);
  }
});

export default router;
