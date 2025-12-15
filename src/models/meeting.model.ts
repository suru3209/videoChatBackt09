import { Schema, model, Document } from "mongoose";

export interface IMeeting extends Document {
  user_id: String;
  meeting_code: String;
  date: Date;
}

const MeetingSchema = new Schema<IMeeting>(
  {
    user_id: { type: String, required: true },

    meeting_code: { type: String, required: true },

    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Meeting = model<IMeeting>("Meeting", MeetingSchema);
