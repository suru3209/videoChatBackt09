import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  name: string;
  email: string;
  password: string;

  gender?: "male" | "female" | "other";
  token?: String;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male",
    },

    token: { type: String },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", UserSchema);
