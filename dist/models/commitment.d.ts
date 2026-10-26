import mongoose, { Document, Types } from "mongoose";
import type { Category } from "./expense";
export type Period = "day" | "week";
export interface CommitmentDocument extends Document {
    userId: Types.ObjectId;
    category: Category;
    maxCount: number;
    period: Period;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Commitment: mongoose.Model<CommitmentDocument, {}, {}, {}, Document<unknown, {}, CommitmentDocument, {}, mongoose.DefaultSchemaOptions> & CommitmentDocument & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, CommitmentDocument & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
//# sourceMappingURL=commitment.d.ts.map