import createError, { HttpError } from "http-errors";
import express, { Express, NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cors from "cors";
import session from "express-session";
import healthcheckRouter from "./routes/healthcheck";
import assignedRouter from "./routes/assigned";
import employeeRouter from "./routes/employee.ts";
import authRouter from "./routes/auth.routes.ts";
import pathfindingRouter from "./pathfinding/pathfinding.ts";
import allNodeDataRouter from "./pathfinding/allNodeData.ts";
import nodeEditingRouter from "./pathfinding/nodeEditing.ts";
import serviceRequestRouter from "./routes/serviceReqs.ts";
import importExportRouter from "./routes/importexport.ts";
import directoryRouter from "./routes/directory.ts";
import { API_ROUTES } from "common/src/constants";
import fileUpload from "express-fileupload";
import passport from "passport";
import "./routes/passport-config";
import "./routes/jwt.strategy.ts";
import ttsRouter from "./routes/tts.ts";

const app: Express = express(); // Set up the backend

// Setup generic middleware
app.use(cors()); // Enable CORS for all routes
app.use(
  session({
    secret: "your-secret-key", // Change this to a secure secret
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());
app.use(
  logger("dev", {
    stream: {
      // This is a "hack" that gets the output to appear in the remote debugger :)
      write: (msg) => console.info(msg),
    },
  }),
); // This records all HTTP requests
app.use(
  fileUpload({
    useTempFiles: true,
  }),
);
app.use(express.json()); // This processes requests as JSON
app.use(express.urlencoded({ extended: false })); // URL parser
app.use(cookieParser()); // Cookie parser

// Setup routers. ALL ROUTERS MUST use /api as a start point, or they
// won't be reached by the default proxy and prod setup
app.use(API_ROUTES.HEALTHCHECK, healthcheckRouter);
app.use("/assigned", assignedRouter);
app.use("/servicereqs", serviceRequestRouter);
app.use(API_ROUTES.AUTH, authRouter);
app.use(API_ROUTES.PATHFINDING, pathfindingRouter);
app.use(API_ROUTES.ALLNODEDATA, allNodeDataRouter);
app.use(API_ROUTES.NODEEDITING, nodeEditingRouter);
app.use(API_ROUTES.EMPLOYEE, employeeRouter); // lowkey if u get an error that says /api/employee/role is missing or something pls dont fw this its actually in constants.ts or in employee.ts
app.use("/assigned", assignedRouter);
app.use(API_ROUTES.SERVICEREQUESTS, serviceRequestRouter);
app.use(API_ROUTES.IMPORTEXPORT, importExportRouter);
app.use(API_ROUTES.DIRECTORY, directoryRouter);
app.use(API_ROUTES.TTS, ttsRouter);

/**
 * Catch all 404 errors, and forward them to the error handler
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  // Have the next (generic error handler) process a 404 error
  next(createError(404));
});

/**
 * Generic error handler im the goat
 */
app.use((err: HttpError, req: Request, res: Response) => {
  // Provide the error message
  res.statusMessage = err.message;

  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Reply with the error
  res.status(err.status || 500);
});

// Export the backend, so that www.ts can start it
export default app;
