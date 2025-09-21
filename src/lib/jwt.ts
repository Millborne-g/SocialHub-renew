import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

export const generateAccessToken = (payload: object) => {
    // return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "1" });
};

export const generateRefreshToken = (payload: object) => {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
};

export const verifyRefreshToken = (token: string) => {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
};

// for quick access to token details
export const decodeToken = (token: string) => {
    return jwt.decode(token);
};
