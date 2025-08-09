"use client";
import Button from "@/components/Button";
import TextField from "@/components/TextField";
import React, { useState } from "react";

const Components = () => {
    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    return (
        <div className="flex flex-col items-center justify-center h-screen max-w-md mx-auto">
            <TextField
                type="text"
                placeholder="email"
                value={email}
                onChange={(e) => {
                    setEmail(e.target.value);
                }}
                width="full"
            />
            <br />
            <TextField
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                    setPassword(e.target.value);
                }}
                width="full"
            />
            <br />
            <Button
                text="Login"
                onClick={() => {
                    console.log(email, password);
                }}
                variant="primary"
                width="full"
            />
        </div>
    );
};

export default Components;
