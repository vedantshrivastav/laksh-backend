import mongoose, { Document, Types } from "mongoose";
export type Category = "food" | "transport" | "shopping" | "entertainment" | "health" | "bills" | "others" | "chai";
export interface ExpenseDocument extends Document {
    userId: Types.ObjectId;
    amount: number;
    category: Category;
    label: string;
    note?: string;
    date: Date;
    goalId?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Expense: mongoose.Model<ExpenseDocument, {}, {}, {}, Document<unknown, {}, ExpenseDocument, {}, mongoose.DefaultSchemaOptions> & ExpenseDocument & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ExpenseDocument & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
//# sourceMappingURL=expense.d.ts.map