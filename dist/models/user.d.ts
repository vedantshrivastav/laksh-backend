import mongoose, { Document, Types } from "mongoose";
export interface UserDocument extends Document {
    phone: string;
    name?: string;
    activeGoalId: Types.ObjectId | null;
    monthlyBudget: number;
    hasOnboarded: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const User: mongoose.Model<UserDocument, {}, {}, {}, Document<unknown, {}, UserDocument, {}, mongoose.DefaultSchemaOptions> & UserDocument & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, UserDocument & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
//# sourceMappingURL=user.d.ts.map