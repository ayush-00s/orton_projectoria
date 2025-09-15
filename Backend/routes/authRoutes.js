import jwt from "jsonwebtoken";

app.get("/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Redirect with token as query param (or send JSON if using fetch)
    res.redirect(`http://localhost:5173/dashboard?token=${token}`);
  }
);
