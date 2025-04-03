import { Meta } from "./meta.interface";

export interface User {
    id: number;
    email: string;
    fullName: string;
    phone: string;
    token: string;
}

export interface UserResponse {
    user: User;
    meta: Meta;
}