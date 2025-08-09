"use client";
import React from "react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import Image from "next/image";
import logo from "../../../public/Logo.png";
import TextField from "@/components/TextField";
import Button from "@/components/Button";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Google } from "iconsax-reactjs";

const schema = yup
    .object({
        email: yup.string().email().required("Email is required"),
        password: yup.string().required("Password is required"),
    })
    .required();

const LoginContent = () => {
    const {
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm({
        resolver: yupResolver(schema),
    });

    console.log(errors);

    const getGoogleInfo = useGoogleLogin({
        onSuccess: (codeResponse) => {
            const apiUrl = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${codeResponse.access_token}`;
            fetch(apiUrl)
                .then((response) => response.json())
                .then((data) => {
                    let newData = {
                        email: data.email,
                        password: "",
                        firstName: data.given_name,
                        lastName: data.family_name,
                        userImage: data.picture,
                    };
                    onSubmit(newData);
                })
                .catch((error) => {
                    console.error("Error:", error);
                });
        },
        // flow: 'auth-code',
    });

    const onSubmit = async (data: any) => {
        try {
            const response = await fetch(`/api/auth?email=${data.email}&password=${data.password}`);
            const responseData = await response.json();
            console.log(responseData);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="fixed top-5 w-full max-w-5xl">
                <a href="/" className="flex items-center gap-2">
                    <Image src={logo} alt="logo" />
                    <span className="text-xl font-bold font-display">
                        SocialHub
                    </span>
                </a>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 w-full max-w-md shadow-xl rounded-xl p-5">
                <div className="flex flex-col items-center justify-center gap-4  w-full">
                    <h1 className="text-2xl font-bold">Welcome to SocialHub</h1>
                    <form
                        className="flex flex-col items-center justify-center gap-4 w-full"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <TextField
                            type="email"
                            placeholder="Email"
                            value={watch("email")}
                            onChange={(e) => setValue("email", e.target.value)}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            width="full"
                        />
                        <TextField
                            type="password"
                            placeholder="Password"
                            value={watch("password")}
                            onChange={(e) =>
                                setValue("password", e.target.value)
                            }
                            error={!!errors.password}
                            helperText={errors.password?.message}
                            width="full"
                        />
                        <Button
                            text="Login"
                            variant="primary"
                            width="full"
                            type="submit"
                        />
                    </form>
                    <button
                        className={`rounded-lg py-2 px-4 font-display cursor-pointer border border-gray-300 w-full flex items-center justify-center gap-2 hover:text-primary`}
                        onClick={() => {
                            getGoogleInfo();
                        }}
                    >
                        <Google />
                        Continue with Google
                    </button>
                    <div className="flex items-center justify-center">
                        <span className="text-sm text-gray-500">
                            Don&apos;t have an account?{" "}
                            <a href="/signup" className="text-primary">
                                Signup
                            </a>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Login = () => {
    return (
        <GoogleOAuthProvider
            clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
        >
            <LoginContent />
        </GoogleOAuthProvider>
    );
};

export default Login;
