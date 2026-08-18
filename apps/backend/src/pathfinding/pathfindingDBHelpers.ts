import PrismaClient from "../bin/prisma-client";

export const getNodes = async (location: string) => {
  return PrismaClient.node.findMany({
    where: {
      zone: { name: location },
    },
    orderBy: {
      index: "asc",
    },
  });
};

export const getGraph = async (location: string) => {
  return PrismaClient.adjacencyMatrix.findFirst({
    where: {
      zone: {
        name: location,
      },
    },
  });
};

// Add a node to a certain map location
export const addNode = async (
  location: string,
  pathName: string,
  displayName: string,
  floor: number,
  xCoord: number,
  yCoord: number,
): Promise<number> => {
  const graph = await getGraph(location);
  let matrix: number[][] = [];
  if (graph) {
    matrix = graph.matrix as number[][];
  }
  // for some reason this fixed everything with editing newly-added nodes
  const index = matrix.length - 1;
  await PrismaClient.node.create({
    data: {
      index: index,
      pathName: pathName,
      displayName: displayName,
      floor: floor,
      xCoord: xCoord,
      yCoord: yCoord,
      zone: {
        connect: {
          name: location,
        },
      },
    },
  });
  return index;
};

// Modify a node given the index and map location
export const editNode = async (
  location: string,
  index: number,
  displayName: string,
  floor: number,
  xCoord: number,
  yCoord: number,
) => {
  switch (location) {
    case "Chestnut Hill Hospital":
      await PrismaClient.node.update({
        data: {
          displayName: displayName,
          xCoord: xCoord,
          yCoord: yCoord,
        },
        where: {
          zoneID_index: {
            index: index,
            zoneID: 1,
          },
        },
      });
      break;
    case "Chestnut Hill Parking Lot":
      await PrismaClient.node.update({
        data: {
          displayName: displayName,
          xCoord: xCoord,
          yCoord: yCoord,
        },
        where: {
          zoneID_index: {
            index: index,
            zoneID: 2,
          },
        },
      });
      break;
    case "Patriot Place Hospital":
      await PrismaClient.node.update({
        data: {
          displayName: displayName,
          xCoord: xCoord,
          yCoord: yCoord,
        },
        where: {
          zoneID_index: {
            index: index,
            zoneID: 3,
          },
        },
      });
      break;
    case "Patriot Place Parking Lot":
      await PrismaClient.node.update({
        data: {
          displayName: displayName,
          xCoord: xCoord,
          yCoord: yCoord,
        },
        where: {
          zoneID_index: {
            index: index,
            zoneID: 4,
          },
        },
      });
      break;
    case "Faulkner-Belkin Hospital Map":
      await PrismaClient.node.update({
        data: {
          displayName: displayName,
          xCoord: xCoord,
          yCoord: yCoord,
        },
        where: {
          zoneID_index: {
            index: index,
            zoneID: 5,
          },
        },
      });
      break;
    case "Main Campus":
      await PrismaClient.node.update({
        data: {
          displayName: displayName,
          xCoord: xCoord,
          yCoord: yCoord,
        },
        where: {
          zoneID_index: {
            index: index,
            zoneID: 6,
          },
        },
      });
      break;
  }
};

// Delete a node
export const deleteNode = async (
  location: string,
  index: number,
  floor: number,
) => {
  const graph = await getGraph(location);
  let matrix: number[][] = [];
  if (graph) {
    matrix = graph.matrix as number[][];
  }
  switch (location) {
    case "Chestnut Hill Hospital":
      await PrismaClient.node.delete({
        where: {
          zoneID_index: {
            zoneID: 1,
            index: index,
          },
        },
      });
      for (let i = index + 1; i < matrix.length; i++) {
        await PrismaClient.node.update({
          data: {
            index: i - 1,
          },
          where: {
            zoneID_index: {
              index: i,
              zoneID: 1,
            },
          },
        });
      }
      break;
    case "Chestnut Hill Parking Lot":
      await PrismaClient.node.delete({
        where: {
          zoneID_index: {
            zoneID: 2,
            index: index,
          },
        },
      });
      for (let i = index + 1; i < matrix.length; i++) {
        await PrismaClient.node.update({
          data: {
            index: i - 1,
          },
          where: {
            zoneID_index: {
              index: i,
              zoneID: 2,
            },
          },
        });
      }
      break;
    case "Patriot Place Hospital":
      await PrismaClient.node.delete({
        where: {
          zoneID_index: {
            zoneID: 3,
            index: index,
          },
        },
      });
      for (let i = index + 1; i < matrix.length; i++) {
        await PrismaClient.node.update({
          data: {
            index: i - 1,
          },
          where: {
            zoneID_index: {
              index: i,
              zoneID: 3,
            },
          },
        });
      }
      break;
    case "Patriot Place Parking Lot":
      await PrismaClient.node.delete({
        where: {
          zoneID_index: {
            zoneID: 4,
            index: index,
          },
        },
      });
      for (let i = index + 1; i < matrix.length; i++) {
        await PrismaClient.node.update({
          data: {
            index: i - 1,
          },
          where: {
            zoneID_index: {
              index: i,
              zoneID: 4,
            },
          },
        });
      }
      break;
    case "Faulkner-Belkin Hospital Map":
      await PrismaClient.node.delete({
        where: {
          zoneID_index: {
            zoneID: 5,
            index: index,
          },
        },
      });
      for (let i = index + 1; i < matrix.length; i++) {
        await PrismaClient.node.update({
          data: {
            index: i - 1,
          },
          where: {
            zoneID_index: {
              index: i,
              zoneID: 5,
            },
          },
        });
      }
      break;
    case "Main Campus":
      await PrismaClient.node.delete({
        where: {
          zoneID_index: {
            zoneID: 6,
            index: index,
          },
        },
      });
      for (let i = index + 1; i < matrix.length; i++) {
        await PrismaClient.node.update({
          data: {
            index: i - 1,
          },
          where: {
            zoneID_index: {
              index: i,
              zoneID: 6,
            },
          },
        });
      }
      break;
  }
};

// Update an adjacency matrix based on the map location and a 2d array
export const editGraph = async (location: string, graph: number[][]) => {
  switch (location) {
    case "Chestnut Hill Hospital":
      await PrismaClient.adjacencyMatrix.update({
        data: {
          matrix: graph,
        },
        where: {
          zoneID: 1,
        },
      });
      break;
    case "Chestnut Hill Parking Lot":
      await PrismaClient.adjacencyMatrix.update({
        data: {
          matrix: graph,
        },
        where: {
          zoneID: 2,
        },
      });
      break;
    case "Patriot Place Hospital":
      await PrismaClient.adjacencyMatrix.update({
        data: {
          matrix: graph,
        },
        where: {
          zoneID: 3,
        },
      });
      break;
    case "Patriot Place Parking Lot":
      await PrismaClient.adjacencyMatrix.update({
        data: {
          matrix: graph,
        },
        where: {
          zoneID: 4,
        },
      });
      break;
    case "Faulkner-Belkin Hospital Map":
      await PrismaClient.adjacencyMatrix.update({
        data: {
          matrix: graph,
        },
        where: {
          zoneID: 5,
        },
      });
      break;
    case "Main Campus":
      await PrismaClient.adjacencyMatrix.update({
        data: {
          matrix: graph,
        },
        where: {
          zoneID: 6,
        },
      });
      break;
  }
};

export const getAllPathNames = async (location: string) => {
  const nodes = await getNodes(location);
  let pathNames: string[] = [];
  for (const node of nodes) {
    pathNames.push(node.pathName);
  }
  return pathNames;
};

export const getAllxCoord = async (
  location: string,
  indexes: number[],
): Promise<number[]> => {
  const xCoords: number[] = [];
  switch (location) {
    case "Chestnut Hill Hospital":
      for (let i = 0; i < indexes.length; i++) {
        const node = await PrismaClient.node.findUnique({
          where: {
            zoneID_index: {
              index: indexes[i],
              zoneID: 1,
            },
          },
        });
        if (node) {
          xCoords.push(node.xCoord);
        }
      }
      break;
    case "Chestnut Hill Parking Lot":
      for (let i = 0; i < indexes.length; i++) {
        const node = await PrismaClient.node.findUnique({
          where: {
            zoneID_index: {
              index: indexes[i],
              zoneID: 2,
            },
          },
        });
        if (node) {
          xCoords.push(node.xCoord);
        }
      }
      break;
    case "Patriot Place Hospital":
      for (let i = 0; i < indexes.length; i++) {
        const node = await PrismaClient.node.findUnique({
          where: {
            zoneID_index: {
              index: indexes[i],
              zoneID: 3,
            },
          },
        });
        if (node) {
          xCoords.push(node.xCoord);
        }
      }
      break;
    case "Patriot Place Parking Lot":
      for (let i = 0; i < indexes.length; i++) {
        const node = await PrismaClient.node.findUnique({
          where: {
            zoneID_index: {
              index: indexes[i],
              zoneID: 4,
            },
          },
        });
        if (node) {
          xCoords.push(node.xCoord);
        }
      }
      break;
    case "Faulkner-Belkin Hospital Map":
      for (let i = 0; i < indexes.length; i++) {
        const node = await PrismaClient.node.findUnique({
          where: {
            zoneID_index: {
              index: indexes[i],
              zoneID: 5,
            },
          },
        });
        if (node) {
          xCoords.push(node.xCoord);
        }
      }
      break;
    case "Main Campus":
      for (let i = 0; i < indexes.length; i++) {
        const node = await PrismaClient.node.findUnique({
          where: {
            zoneID_index: {
              index: indexes[i],
              zoneID: 6,
            },
          },
        });
        if (node) {
          xCoords.push(node.xCoord);
        }
      }
      break;
  }
  return xCoords;
};

export const getAllyCoord = async (
  location: string,
  indexes: number[],
): Promise<number[]> => {
  const yCoords: number[] = [];
  switch (location) {
    case "Chestnut Hill Hospital":
      for (let i = 0; i < indexes.length; i++) {
        const node = await PrismaClient.node.findUnique({
          where: {
            zoneID_index: {
              index: indexes[i],
              zoneID: 1,
            },
          },
        });
        if (node) {
          yCoords.push(node.yCoord);
        }
      }
      break;
    case "Chestnut Hill Parking Lot":
      for (let i = 0; i < indexes.length; i++) {
        const node = await PrismaClient.node.findUnique({
          where: {
            zoneID_index: {
              index: indexes[i],
              zoneID: 2,
            },
          },
        });
        if (node) {
          yCoords.push(node.yCoord);
        }
      }
      break;
    case "Patriot Place Hospital":
      for (let i = 0; i < indexes.length; i++) {
        const node = await PrismaClient.node.findUnique({
          where: {
            zoneID_index: {
              index: indexes[i],
              zoneID: 3,
            },
          },
        });
        if (node) {
          yCoords.push(node.yCoord);
        }
      }
      break;
    case "Patriot Place Parking Lot":
      for (let i = 0; i < indexes.length; i++) {
        const node = await PrismaClient.node.findUnique({
          where: {
            zoneID_index: {
              index: indexes[i],
              zoneID: 4,
            },
          },
        });
        if (node) {
          yCoords.push(node.yCoord);
        }
      }
      break;
    case "Faulkner-Belkin Hospital Map":
      for (let i = 0; i < indexes.length; i++) {
        const node = await PrismaClient.node.findUnique({
          where: {
            zoneID_index: {
              index: indexes[i],
              zoneID: 5,
            },
          },
        });
        if (node) {
          yCoords.push(node.yCoord);
        }
      }
      break;
    case "Main Campus":
      for (let i = 0; i < indexes.length; i++) {
        const node = await PrismaClient.node.findUnique({
          where: {
            zoneID_index: {
              index: indexes[i],
              zoneID: 6,
            },
          },
        });
        if (node) {
          yCoords.push(node.yCoord);
        }
      }
      break;
  }
  return yCoords;
};

export const setAlgorithm = async (algorithm: "dfs" | "dijkstra") => {
  await PrismaClient.globalSettings.update({
    where: {
      id: 1,
    },
    data: {
      pathfindingAlgorithm: algorithm,
    },
  });
};

export const getAlgorithm = async () => {
  const algoObject = await PrismaClient.globalSettings.findUnique({
    where: {
      id: 1,
    },
  });
  if (algoObject) {
    return algoObject.pathfindingAlgorithm;
  } else {
    return "dijkstra";
  }
};
