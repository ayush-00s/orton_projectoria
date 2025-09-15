// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "./models/user.js";

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Health
app.get("/health", (_req, res) => res.json({ ok: true }));

// Simplified demo auth: issue a JWT and redirect
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const FRONTEND_REDIRECT = process.env.FRONTEND_REDIRECT || "http://localhost:5173/dashboard";
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:4001/auth/google/callback";

// Optional MongoDB connection if MONGO_URI is present
let isDatabaseReady = false;
const { MONGO_URI } = process.env;
if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      isDatabaseReady = true;
      console.log("MongoDB connected");
    })
    .catch((err) => {
      isDatabaseReady = false;
      console.error("MongoDB connection failed:", err.message);
    });
} else {
  console.warn("MONGO_URI not set. Skipping database connection.");
}

async function handleAuth(res, provider) {
  const demoProfile = {
    provider,
    providerId: `demo-${provider}-id`,
    name: `Demo ${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
    email: `demo_${provider}@example.com`,
    avatar: null,
  };

  let userId = demoProfile.providerId;
  if (isDatabaseReady) {
    try {
      let user = await User.findOne({ provider: provider, providerId: demoProfile.providerId });
      if (!user) {
        user = await User.create(demoProfile);
      } else {
        // Keep latest demo profile fields in sync
        user.name = demoProfile.name;
        user.email = demoProfile.email;
        await user.save();
      }
      userId = user._id.toString();
    } catch (err) {
      console.error("Failed to save user:", err.message);
    }
  }

  const token = jwt.sign(
    { id: userId, email: demoProfile.email, provider },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.redirect(`${FRONTEND_REDIRECT}?token=${token}`);
}

// Real Google OAuth with Passport
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const provider = "google";
        const providerId = profile.id;
        const name = profile.displayName;
        const email = profile.emails?.[0]?.value || null;
        const avatar = profile.photos?.[0]?.value || null;

        let user = await User.findOne({ provider, providerId });
        if (!user) {
          user = await User.create({ provider, providerId, name, email, avatar });
        } else {
          user.name = name;
          user.email = email;
          user.avatar = avatar;
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" })
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id.toString(), email: req.user.email, provider: "google" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.redirect(`${FRONTEND_REDIRECT}?token=${token}`);
  }
);

app.get("/auth/github", async (_req, res) => handleAuth(res, "github"));

// Email-based demo auth: accepts JSON { email }
app.post("/auth/email", async (req, res) => {
  const email = (req.body?.email || "").trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const provider = "email";
  const profile = {
    provider,
    providerId: `demo-email-${email}`,
    name: email.split("@")[0] || "Demo User",
    email,
    avatar: null,
  };

  let userId = profile.providerId;
  if (isDatabaseReady) {
    try {
      let user = await User.findOne({ provider: provider, providerId: profile.providerId });
      if (!user) {
        user = await User.create(profile);
      } else {
        user.name = profile.name;
        await user.save();
      }
      userId = user._id.toString();
    } catch (err) {
      console.error("Failed to save email user:", err.message);
    }
  }

  const token = jwt.sign({ id: userId, email, provider }, JWT_SECRET, { expiresIn: "1h" });
  return res.json({ token });
});

app.listen(4001, () => console.log("Server running on http://localhost:4001"));
