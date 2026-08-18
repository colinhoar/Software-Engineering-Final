import passport from "passport";
import { Strategy as ClientPasswordStrategy } from "passport-oauth2-client-password";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import { Strategy as GitHubStrategy } from "passport-github2";
import PrismaClient from "../bin/prisma-client";
import "./jwt.strategy";

// Add type for the done callback
type DoneCallback = (error: any, user?: any) => void;

// Add type for Google profile so that we can come back and make some changes and stuff for this idk
interface GoogleProfile {
  id: string;
  displayName: string;
  emails?: Array<{ value: string }>;
}

interface GitHubProfile {
  id: string;
  username: string;
  displayName: string;
  emails?: Array<{ value: string }>;
}

// Serialize user for the session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from the session (json to object basically)
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await PrismaClient.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(
  new ClientPasswordStrategy(
    async (clientId: string, clientSecret: string, done) => {
      try {
        const client = await PrismaClient.client.findUnique({
          where: { clientId },
        });

        if (!client || client.clientSecret !== clientSecret) {
          return done(null, false);
        }

        if (!client.grants.includes("client_credentials")) {
          return done(null, false);
        }

        return done(null, client);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:3001/api/auth/google/callback",
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: GoogleProfile,
      done: DoneCallback,
    ) => {
      try {
        const numberOfUsers = await PrismaClient.user.count();
        const user = await PrismaClient.user.upsert({
          where: { email: profile.emails?.[0]?.value },
          update: {
            googleId: profile.id,
          },
          create: {
            email: profile.emails?.[0]?.value || "",
            googleId: profile.id,
            isAdmin: numberOfUsers === 0,
            password: "",// trust this is safe
            employee: {
              create: {
                name: profile.displayName,
              },
            },
          },
          include: {
            employee: true,
          },
        });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

// GitHub OAuth2 Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      callbackURL:
        process.env.GITHUB_CALLBACK_URL ||
        "http://localhost:3001/api/auth/github/callback",
      scope: ["user:email"],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: GitHubProfile,
      done: DoneCallback,
    ) => {
      try {
        const numberOfUsers = await PrismaClient.user.count();
        const user = await PrismaClient.user.upsert({
          where: { email: profile.emails?.[0]?.value },
          update: {
            githubId: profile.id,
          },
          create: {
            email: profile.emails?.[0]?.value || "",
            employee: {
              create: {
                name: profile.displayName || profile.username,
              },
            },
            isAdmin: numberOfUsers === 0,
            githubId: profile.id,
            password: "",
          },
          include: {
            employee: true,
          },
        });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);
