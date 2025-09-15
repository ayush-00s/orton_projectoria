
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  provider: String,
  providerId: String,
  name: String,
  email: String,
  avatar: String,
});

export default mongoose.model("User", userSchema);
