import mongoose, { Document, Types } from "mongoose";
export interface GoalDocument extends Document {
    userId: Types.ObjectId;
    name: string;
    emoji: string;
    targetAmount: number;
    savedAmount: number;
    startDate: Date;
    targetDate: Date;
    isCompleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Goal: mongoose.Model<GoalDocument, {}, {}, {}, Document<unknown, {}, GoalDocument, {}, mongoose.DefaultSchemaOptions> & GoalDocument & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, GoalDocument & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
//# sourceMappingURL=goal.d.ts.map