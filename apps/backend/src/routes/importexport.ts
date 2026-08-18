import express, { Request, Response, Router } from "express";
import { Prisma } from "database";
import PrismaClient from "../bin/prisma-client";
import * as fs from "fs";

const router: Router = express.Router();

router.post("/", async function (req: Request, res: Response) {
  if (!req.files) {
    res.status(400).send("No files were uploaded.");
    console.log("no files");
    return;
  }

  const file = req.files.myCSV;
  if ("tempFilePath" in file) {
    const fsFile = fs.readFileSync(file.tempFilePath);
    const myFile = fsFile.toString();
    const lines = myFile.split("\n");
    const inputs: Prisma.DepartmentCreateInput[] = [];
    for (const line in lines) {
      const sublines = lines[line].split(/(?<!\\),/);
      if (parseInt(line) == 0) {
        if (
          !(
            sublines[0] &&
            sublines[1] &&
            sublines[2] &&
            sublines[3] &&
            sublines[4] &&
            sublines[5] &&
            sublines[6]
          )
        ) {
          fs.rmSync(file.tempFilePath);
          res.status(400).send("Improper csv!");
          return;
        }
        if (
          !(
            sublines[0] == "ID" &&
            sublines[1] == "Department Name" &&
            sublines[2] == "Services" &&
            sublines[3] == "Floor" &&
            sublines[4] == "Location" &&
            sublines[5] == "Building" &&
            sublines[6] == "Telephone"
          )
        ) {
          fs.rmSync(file.tempFilePath);
          res.status(400).send("Improper csv!");
          return;
        }
      } else {
        if (
          sublines[0] !== null &&
          sublines[1] !== null &&
          sublines[2] !== null &&
          sublines[3] !== null &&
          sublines[4] !== null &&
          sublines[5] !== null &&
          sublines[6] !== null
        ) {
          inputs.push({
            departmentID: parseInt(sublines[0].replaceAll("\\", "")),
            name: sublines[1].replaceAll("\\", ""),
            services: sublines[2].replaceAll("\\", ""),
            floor: sublines[3].replaceAll("\\", ""),
            location: sublines[4].replaceAll("\\", ""),
            building: { connect: { name: sublines[5].replaceAll("\\", "") } },
            phone: sublines[6].replaceAll("\\", ""),
          });
        }
      }
    }

    for (const input of inputs) {
      try {
        await PrismaClient.department.upsert({
          where: {
            departmentID: input.departmentID,
          },
          update: {
            name: input.name,
            services: input.services,
            floor: input.floor,
            location: input.location,
            building: input.building,
            phone: input.phone,
          },
          create: {
            departmentID: input.departmentID,
            name: input.name,
            services: input.services,
            floor: input.floor,
            location: input.location,
            building: input.building,
            phone: input.phone,
          },
        });
      } catch (error) {
        console.error(
          `Unable to add ${input.name} to database because: ${error}`,
        );
        fs.rmSync(file.tempFilePath);
        res.sendStatus(400);
        return;
      }
    }
    fs.rmSync(file.tempFilePath);
  }
  res.sendStatus(200);
});

router.get("/", async function (req: Request, res: Response) {
  const departments = await PrismaClient.department.findMany({
    include: {
      building: true,
    },
  });
  let csvString =
    "ID,Department Name,Services,Floor,Location,Building,Telephone";
  for (const department of departments) {
    csvString = csvString.concat(
      `\n${department.departmentID.toString()},${department.name.replaceAll(",", "\\,")},${department.services.replaceAll(",", "\\,")},${department.floor},${department.location.replaceAll(",", "\\,")},${department.building.name.replaceAll(",", "\\,")},${department.phone.replaceAll(",", "\\,")}`,
    );
  }
  const attachmentName = `Department Backup ${new Date().toLocaleString().replaceAll("/", "-").replace(",", "")}.csv`;
  res.attachment(attachmentName);
  res.type("text/csv");
  res.status(200).send(csvString);
});

export default router;
