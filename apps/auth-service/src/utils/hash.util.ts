import argon2 from "argon2";
import bcrypt from "bcryptjs";

export const hashPassword = (pw: string) => argon2.hash(pw, { type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 4 });
export const verifyPassword = (pw: string, hash: string) => argon2.verify(hash, pw);
export const hashPin = (pin: string) => bcrypt.hash(pin, 12);
export const verifyPin = (pin: string, hash: string) => bcrypt.compare(pin, hash);
