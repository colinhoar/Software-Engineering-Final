import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import PrismaClient from "../bin/prisma-client";

// This sets up the strategy to validate JWT tokens in request headers coz
passport.use(
  new JwtStrategy(
    {
      // Extract the token from Authorization: Bearer header (professional comment)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET as string,
    },
    async (
      payload: { userId: string }, // use userId instead of clientId
      done: (error: unknown, client?: any) => void,
    ) => {
      try {
        // The "payload" (idk why its called that) contains the userId from when we created the token basically
        const user = await PrismaClient.user.findUnique({
          where: { id: payload.userId },
          include: { employee: true }, // include employee info like name, etc.
        });

        if (!user) {
          return done(null, false); // User no longer exists (trust)
        }

        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    },
  ),
);
