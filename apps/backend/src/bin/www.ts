import app from "../app.ts";
import http from "http";
import { AddressInfo } from "net";
import { createHttpTerminator } from "http-terminator";
import chestnutHillHospitalNodeData from "../pathfinding/Chestnut_Hill_Data/chestnutHospitalNodeData.json";
import chestnutHillParkingNodeData from "../pathfinding/Chestnut_Hill_Data/chestnutParkingNodeData.json";
import patriotPlaceParkingNodeData from "../pathfinding/Patriot_Place_Data/patriotParkingNodeData.json";
import faulknerBelkinNodeData from "../pathfinding/Faulker-Belkin_Data/faulknerBelkinNodeData.json";

import { chestnutHillHospitalGraph } from "../pathfinding/Chestnut_Hill_Data/chestnutHospitalAdjacencyMatrix.ts";
import { chestnutHillParkingGraph } from "../pathfinding/Chestnut_Hill_Data/chestnutParkingAdjacencyMatrix.ts";
import { patriotPlaceHospitalGraph } from "../pathfinding/Patriot_Place_Data/patriotBuildingAdjacencyMatrix.ts";
import { faulknerBelkinHospitalGraph } from "../pathfinding/Faulker-Belkin_Data/faulknerBelkinAdjacencyMatrix.ts";
import patriotPlaceHospitalNodeData from "../pathfinding/Patriot_Place_Data/patriotHospitalNodeData.json";
import { patriotPlaceParkingGraph } from "../pathfinding/Patriot_Place_Data/patriotParkingAdjacencyMatrix.ts";
import mainCampusNodeData from "../pathfinding/Main_Campus_Data/mainCampusNodeData.json";
import { mainCampusAdjacencyMatrix } from "../pathfinding/Main_Campus_Data/mainCampusAdjacencyMatrix.ts";
// These two imports are just for populating the hardcoded data, may be able to be removed after we no longer hardcode DB data
import { Prisma } from "database";
import PrismaClient from "../bin/prisma-client";

// Attempt a database connection
console.info("Connecting to database...");
try {
  // This intrinsically connects to the database
  require("./prisma-client.ts");
  console.log("Successfully connected to the database");
} catch (error) {
  // Log any errors
  console.error(`Unable to establish database connection:
  ${error}`);
  process.exit(1); // Then exit
}

// Can't use await (needed by Prisma) outside an async function, so this is
// an IIFE (Immediately Invoked Function Expression) to get around that
(async () => {
  // populate tables
  try {
    // create employees to fulfill seeding requirement.
    // this might just be for dropdown list of employees.
    // if we receive clarification that this isn't necessary it can be removed, but I'm keeping it for now (sorry aditya)
    // await PrismaClient.employee.upsert({
    //   where: {
    //     id: 1,
    //   },
    //   create: {
    //     name: "Sarah",
    //     role: "Pediatrician",
    //   },
    //   update: {},
    // });
    // await PrismaClient.employee.upsert({
    //   where: {
    //     id: 2,
    //   },
    //   create: {
    //     name: "Marcus",
    //     role: "ER Nurse",
    //   },
    //   update: {},
    // });
    // await PrismaClient.employee.upsert({
    //   where: {
    //     id: 3,
    //   },
    //   create: {
    //     name: "Aditya",
    //     role: "Hospital Photographer",
    //   },
    //   update: {},
    // });
    // await PrismaClient.employee.upsert({
    //   where: {
    //     id: 4,
    //   },
    //   create: {
    //     name: "Daniel",
    //     role: "Physician",
    //   },
    //   update: {},
    // });
    // await PrismaClient.employee.upsert({
    //   where: {
    //     id: 5,
    //   },
    //   create: {
    //     name: "Emily",
    //     role: "Surgeon",
    //   },
    //   update: {},
    // });
    await PrismaClient.globalSettings.upsert({
      where: {
        id: 1,
      },
      create: {
        id: 1,
        pathfindingAlgorithm: "dijkstra",
      },
      update: {},
    });
    await PrismaClient.serviceRequests.upsert({
      where: {
        requestID: 1,
      },
      create: {
        description: "Bedpan spill",
        locationRequiringService: "Test Department at 22 Patriot Place",
        requestedService: "Disinfection",
        requesterName: "Aditya",
        serviceCategory: "Sanitation",
        status: "Unassigned",
        urgencyLevel: "Medium",
      },
      update: {},
    });
    await PrismaClient.serviceRequests.upsert({
      where: {
        requestID: 2,
      },
      create: {
        description: "The faucet in my office leaks",
        locationRequiringService: "Test Department at Chestnut Hill",
        requestedService: "Plumbing",
        requesterName: "Daniel",
        serviceCategory: "Facility Maintenance",
        status: "Unassigned",
        urgencyLevel: "Low",
        FacilityMaintenanceRequest: {
          connectOrCreate: {
            where: {
              serviceRequestID: 2,
            },
            create: {
              date: "4/1/2025",
            },
          },
        },
      },
      update: {},
    });
    await PrismaClient.serviceRequests.upsert({
      where: {
        requestID: 3,
      },
      create: {
        description: "Patient needs care at a department at the main campus",
        locationRequiringService: "Test Department at 20 Patriot Place",
        requestedService: "Ambulance",
        requesterName: "Sarah",
        serviceCategory: "Patient Transportation",
        status: "Unassigned",
        urgencyLevel: "High/Urgent",
        PatientTransportationRequest: {
          connectOrCreate: {
            where: {
              serviceRequestID: 3,
            },
            create: {
              patientMobilityLevel: "Wheelchair",
              destination: "Main Campus",
              date: "4/2/2025",
            },
          },
        },
      },
      update: {},
    });
    // create buildings
    await PrismaClient.building.upsert({
      where: {
        id: 1,
      },
      update: {
        name: "Chestnut Hill Hospital",
      },
      create: {
        id: 1,
        name: "Chestnut Hill Hospital",
      },
    });
    await PrismaClient.building.upsert({
      where: {
        id: 2,
      },
      update: {
        name: "20 Patriot Place",
      },
      create: {
        id: 2,
        name: "20 Patriot Place",
      },
    });
    await PrismaClient.building.upsert({
      where: {
        id: 3,
      },
      update: {
        name: "22 Patriot Place",
      },
      create: {
        id: 3,
        name: "22 Patriot Place",
      },
    });
    await PrismaClient.building.upsert({
      where: {
        id: 4,
      },
      update: {
        name: "Faulkner Hospital",
      },
      create: {
        id: 4,
        name: "Faulkner Hospital",
      },
    });
    await PrismaClient.building.upsert({
      where: {
        id: 5,
      },
      update: {
        name: "Belkin House",
      },
      create: {
        id: 5,
        name: "Belkin House",
      },
    });
    await PrismaClient.building.upsert({
      where: {
        id: 6,
      },
      update: {
        name: "Main Campus",
      },
      create: {
        id: 6,
        name: "Main Campus",
      },
    });

    await PrismaClient.pathfindingZone.upsert({
      where: {
        id: 1,
      },
      update: {
        name: "Chestnut Hill Hospital",
      },
      create: {
        id: 1,
        name: "Chestnut Hill Hospital",
      },
    });
    await PrismaClient.pathfindingZone.upsert({
      where: {
        id: 2,
      },
      update: {
        name: "Chestnut Hill Parking Lot",
      },
      create: {
        id: 2,
        name: "Chestnut Hill Parking Lot",
      },
    });
    await PrismaClient.pathfindingZone.upsert({
      where: {
        id: 3,
      },
      update: {
        name: "Patriot Place Hospital",
      },
      create: {
        id: 3,
        name: "Patriot Place Hospital",
      },
    });
    await PrismaClient.pathfindingZone.upsert({
      where: {
        id: 4,
      },
      update: {
        name: "Patriot Place Parking Lot",
      },
      create: {
        id: 4,
        name: "Patriot Place Parking Lot",
      },
    });
    await PrismaClient.pathfindingZone.upsert({
      where: {
        id: 5,
      },
      update: {
        name: "Faulkner-Belkin Hospital Map",
      },
      create: {
        id: 5,
        name: "Faulkner-Belkin Hospital Map",
      },
    });
    await PrismaClient.pathfindingZone.upsert({
      where: {
        id: 6,
      },
      update: {
        name: "Main Campus",
      },
      create: {
        id: 6,
        name: "Main Campus",
      },
    });

    // create node data
    for (const node of chestnutHillHospitalNodeData) {
      await PrismaClient.node.upsert({
        where: {
          zoneID_index: {
            zoneID: 1,
            index: node.index,
          },
        },
        create: {
          index: node.index,
          zoneID: 1,
          xCoord: node.xCoord,
          yCoord: node.yCoord,
          pathName: node.pathName,
          displayName: node.displayName,
          floor: node.floor,
        },
        update: {},
      });
    }

    for (const node of chestnutHillParkingNodeData) {
      await PrismaClient.node.upsert({
        where: {
          zoneID_index: {
            zoneID: 2,
            index: node.index,
          },
        },
        create: {
          index: node.index,
          zoneID: 2,
          xCoord: node.xCoord,
          yCoord: node.yCoord,
          pathName: node.pathName,
          displayName: node.displayName,
          floor: node.floor,
        },
        update: {},
      });
    }

    for (const node of patriotPlaceHospitalNodeData) {
      await PrismaClient.node.upsert({
        where: {
          zoneID_index: {
            zoneID: 3,
            index: node.index,
          },
        },
        create: {
          index: node.index,
          zoneID: 3,
          xCoord: node.xCoord,
          yCoord: node.yCoord,
          pathName: node.pathName,
          displayName: node.displayName,
          floor: node.floor,
        },
        update: {},
      });
    }

    for (const node of patriotPlaceParkingNodeData) {
      await PrismaClient.node.upsert({
        where: {
          zoneID_index: {
            zoneID: 4,
            index: node.index,
          },
        },
        create: {
          index: node.index,
          zoneID: 4,
          xCoord: node.xCoord,
          yCoord: node.yCoord,
          pathName: node.pathName,
          displayName: node.displayName,
          floor: node.floor,
        },
        update: {},
      });
    }

    for (const node of faulknerBelkinNodeData) {
      await PrismaClient.node.upsert({
        where: {
          zoneID_index: {
            zoneID: 5,
            index: node.index,
          },
        },
        create: {
          index: node.index,
          zoneID: 5,
          xCoord: node.xCoord,
          yCoord: node.yCoord,
          pathName: node.pathName,
          displayName: node.displayName,
          floor: node.floor,
        },
        update: {},
      });
    }
    for (const node of mainCampusNodeData) {
      await PrismaClient.node.upsert({
        where: {
          zoneID_index: {
            zoneID: 6,
            index: node.index,
          },
        },
        create: {
          index: node.index,
          zoneID: 6,
          xCoord: node.xCoord,
          yCoord: node.yCoord,
          pathName: node.pathName,
          displayName: node.displayName,
          floor: node.floor,
        },
        update: {},
      });
    }

    await PrismaClient.adjacencyMatrix.upsert({
      where: {
        zoneID: 1,
      },
      create: {
        zoneID: 1,
        matrix: chestnutHillHospitalGraph,
      },
      update: {},
    });

    await PrismaClient.adjacencyMatrix.upsert({
      where: {
        zoneID: 2,
      },
      create: {
        zoneID: 2,
        matrix: chestnutHillParkingGraph,
      },
      update: {},
    });

    await PrismaClient.adjacencyMatrix.upsert({
      where: {
        zoneID: 3,
      },
      create: {
        zoneID: 3,
        matrix: patriotPlaceHospitalGraph,
      },
      update: {},
    });

    await PrismaClient.adjacencyMatrix.upsert({
      where: {
        zoneID: 4,
      },
      create: {
        zoneID: 4,
        matrix: patriotPlaceParkingGraph,
      },
      update: {},
    });

    await PrismaClient.adjacencyMatrix.upsert({
      where: {
        zoneID: 5,
      },
      create: {
        zoneID: 5,
        matrix: faulknerBelkinHospitalGraph,
      },
      update: {},
    });

    await PrismaClient.adjacencyMatrix.upsert({
      where: {
        zoneID: 6,
      },
      create: {
        zoneID: 6,
        matrix: mainCampusAdjacencyMatrix,
      },
      update: {},
    });

    /*
        // create departments
        await PrismaClient.department.createMany({
          data: [
            {
              departmentID: 11,
              name: "Lab",
              services: "Lab services placeholder",
              location: "Lab room placeholder",
              phone: "(123) 456-7899",
            },
            {
              departmentID: 1,
              name: "Allergy",
              services: "Allergy services placeholder",
              location: "Allergy room placeholder",
              phone: "(555) 456-7899",
            },
          ],
        });
        
     */
    /*
        // create the service requests
        await PrismaClient.serviceRequests.createMany({
          data: [
            {
              requestID: 1,
              serviceCategory: "Medical Device",
              assignedEmployeeID: undefined,
              status: "To Do",
              description: "Take your time",
              locationRequiringService: "Room 210",
              requestedService: "MRI Scanner",
              urgencyLevel: "Low",
            },
            {
              requestID: 2,
              serviceCategory: "Medical Device",
              assignedEmployeeID: undefined,
              status: "To Do",
              description: "No rush",
              locationRequiringService: "Room 116",
              requestedService: "Ultrasound Machine",
              urgencyLevel: "Medium",
            },
            {
              requestID: 3,
              serviceCategory: "Medical Device",
              assignedEmployeeID: undefined,
              status: "To Do",
              description: "Need ASAP",
              locationRequiringService: "ICU, Bed 08",
              requestedService: "Ventilator",
              urgencyLevel: "High",
            },
            {
              requestID: 4,
              serviceCategory: "Medical Device",
              assignedEmployeeID: undefined,
              status: "To Do",
              description: "Heavy, be careful",
              locationRequiringService: "Room 102",
              requestedService: "X-Ray Machine",
              urgencyLevel: "Low",
            },
            {
              requestID: 5,
              serviceCategory: "Medical Device",
              assignedEmployeeID: undefined,
              status: "To Do",
              description: "I can help if needed",
              locationRequiringService: "Room 305",
              requestedService: "CT Scanner",
              urgencyLevel: "Low",
            },
            {
              requestID: 6,
              serviceCategory: "Medical Device",
              assignedEmployeeID: undefined,
              status: "To Do",
              description: "Get here quick!",
              locationRequiringService: "ICU, Bed 12",
              requestedService: "Vitals Monitor",
              urgencyLevel: "High",
            },
            {
              requestID: 7,
              serviceCategory: "Medical Device",
              assignedEmployeeID: undefined,
              status: "To Do",
              description: "Make sure to change the sheets",
              locationRequiringService: "Room 408",
              requestedService: "Hospital Bed",
              urgencyLevel: "Low",
            },
            {
              requestID: 8,
              serviceCategory: "Medical Device",
              assignedEmployeeID: undefined,
              status: "To Do",
              description: "Handle with care",
              locationRequiringService: "Operating Room 6",
              requestedService: "Anesthesia Machine",
              urgencyLevel: "High",
            },
            {
              requestID: 9,
              serviceCategory: "Medical Device",
              assignedEmployeeID: undefined,
              status: "To Do",
              description: "None",
              locationRequiringService: "Lab Station B",
              requestedService: "Blood Analyzer",
              urgencyLevel: "Low",
            },
            {
              requestID: 10,
              serviceCategory: "Medical Device",
              assignedEmployeeID: undefined,
              status: "To Do",
              description: "One of the smaller ones please",
              locationRequiringService: "Room 105",
              requestedService: "Blood Pressure Monitor",
              urgencyLevel: "Low",
            },
          ],
        });
    
        // create the medical device requests
        await PrismaClient.medicalDeviceRequests.createMany({
          data: [
            {
              serviceRequestID: 1,
              deliveryTime: new Date(),
            },
            {
              serviceRequestID: 2,
              deliveryTime: new Date(),
            },
            {
              serviceRequestID: 3,
              deliveryTime: new Date(),
            },
            {
              serviceRequestID: 4,
              deliveryTime: new Date(),
            },
            {
              serviceRequestID: 5,
              deliveryTime: new Date(),
            },
            {
              serviceRequestID: 6,
              deliveryTime: new Date(),
            },
            {
              serviceRequestID: 7,
              deliveryTime: new Date(),
            },
            {
              serviceRequestID: 8,
              deliveryTime: new Date(),
            },
            {
              serviceRequestID: 9,
              deliveryTime: new Date(),
            },
            {
              serviceRequestID: 10,
              deliveryTime: new Date(),
            },
          ],
        });
    
        await PrismaClient.serviceRequests.create({
          data: {
            requestID: 11,
            serviceCategory: "Medical Device",
            assignedEmployeeID: undefined,
            status: "To Do",
            description: "test",
            locationRequiringService: "Room 1",
            requestedService: "test device",
            urgencyLevel: "Low",
            MedicalDeviceRequests: {
              create: {
                deliveryTime: new Date(),
              },
            },
          },
        });
    
        await PrismaClient.serviceRequests.create({
          data: {
            requestID: 12,
            serviceCategory: "Sanitation",
            assignedEmployeeID: undefined,
            status: "To Do",
            description: "test sanitation 1",
            locationRequiringService: "Room 500",
            requestedService: "Wall",
            urgencyLevel: "High",
          },
        });
    
        await PrismaClient.serviceRequests.create({
          data: {
            requestID: 13,
            serviceCategory: "Sanitation",
            assignedEmployeeID: undefined,
            status: "To Do",
            description: "test sanitation 2",
            locationRequiringService: "Room 501",
            urgencyLevel: "Low",
            requestedService: "Wall",
          },
        });
    
        // update some of the service requests to assign employees
        await PrismaClient.serviceRequests.update({
          where: {
            requestID: 1,
          },
          data: {
            assignedEmployeeID: 5,
          },
        });
    
        await PrismaClient.serviceRequests.update({
          where: {
            requestID: 4,
          },
          data: {
            assignedEmployeeID: 2,
          },
        });
    
        await PrismaClient.serviceRequests.update({
          where: {
            requestID: 7,
          },
          data: {
            assignedEmployeeID: 1,
          },
        });
    
     */

    console.info("Successfully populated sample data!");
  } catch (error) {
    console.error("There was an issue populating the sample data.");
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // print the detailed Prisma error if possible
      console.error(error.message);
    }
  }
})();

// Get port from environment and store in Express
const port: string | undefined = process.env.BACKEND_PORT;

if (port === undefined) {
  console.error("Failed to start: Missing PORT environment variable");
  process.exit(1);
}

app.set("port", port);

// Create the server, enable the application
console.info("Starting server...");
const server: http.Server = http.createServer(app);

// Export the server, so that testing client can use it
export default server;

// Setup graceful exit logic
// Exit conditions
[
  "SIGHUP",
  "SIGINT",
  "SIGQUIT",
  "SIGILL",
  "SIGTRAP",
  "SIGABRT",
  "SIGBUS",
  "SIGFPE",
  "SIGUSR1",
  "SIGSEGV",
  "SIGUSR2",
  "SIGTERM",
].forEach(function (sig) {
  // On any of those
  process.on(sig, async function () {
    // On shutdown request
    console.info(`Server shutting down due to ${sig}...`);

    // Create a terminator, to safely destroy the HTTP server
    const httpTerminator = createHttpTerminator({
      server,
      gracefulTerminationTimeout: 10,
    });
    await httpTerminator.terminate();

    // Log the exit
    console.log("Server shutdown complete");
    process.exit(0); // Exit normally
  });
});

// Listen on the provided port, on all interfaces
server.listen(port);
server.on("error", onError); // Error handler
server.on("listening", onListening); // Notify that we started

/**
 * Event listener for HTTP server "error" event, to provide user friendly error output and then exit
 */
function onError(error: NodeJS.ErrnoException): void {
  // If we're doing something other than try to listen, we can't help
  if (error.syscall !== "listen") {
    throw error; // Re-throw
  }

  // Get the pipe/port we're listening on
  const bind: string =
    typeof port === "string" ? "Pipe " + port : "Port " + port;

  // Handle specific listen errors with friendly messages
  switch (error.code) {
    // Server can't get start permission
    case "EACCES":
      console.error(`Failed to start: ${bind} requires elevated permissions!`);
      process.exit(1);
      break;
    // Server can't get address
    case "EADDRINUSE":
      console.error(`Failed to start: ${bind} + ' is already in use`);
      process.exit(1); // Exit with failure
      break;
    default:
      // Print the default error otherwise, and exit
      console.error(`Failed to start: Unknown binding error:
    ${error}`);
      process.exit(1);
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening(): void {
  // Get the address we're listening on
  const addr: string | AddressInfo | null = server.address();

  // If it's a string, simply get it (it's a pipe)
  const bind: string =
    typeof addr === "string" ? "pipe " + addr : "port " + addr?.port; // Otherwise get the port
  console.info("Server listening on " + bind); // Debug output that we're listening
  console.log("Startup complete");
}
