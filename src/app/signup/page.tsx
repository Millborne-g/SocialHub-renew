"use client";
import Image from "next/image";
import React, { useEffect, useState, Suspense } from "react";
import logo from "../../../public/Logo.png";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import { Google } from "iconsax-reactjs";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import LoadingScreen from "@/components/LoadingScreen";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { decodeToken } from "@/lib/jwt";

const schema = yup
    .object({
        firstName: yup.string().required("First Name is required"),
        lastName: yup.string().required("Last Name is required"),
        email: yup.string().email().required("Email is required"),
        password: yup.string().required("Password is required"),
        confirmPassword: yup.string().required("Confirm Password is required"),
    })
    .required();

const SignupContent = ({ email }: { email: string }) => {
    const {
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm({
        resolver: yupResolver(schema),
    });

    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const [isPasswordMatch, setIsPasswordMatch] = useState(true);
    const { signup, accessToken, refreshToken } = useAuthStore();
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
            setIsLoading(true);
            await signup(
                data.firstName,
                data.lastName,
                data.email,
                data.password,
                data.userImage
            );
            toast.success("User created successfully");
            // router.push("/home");
        } catch (Error: any) {
            toast.error("User creation failed");
            console.log(Error.response.data.message, "test");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const refreshUserToken = async () => {
            if (accessToken) {
                router.push("/home");
            } else {
                await refreshToken();
            }
        };
        refreshUserToken();
    }, [accessToken, refreshToken]);

    useEffect(() => {
        if (watch("password") && watch("confirmPassword")) {
            if (watch("password") !== watch("confirmPassword")) {
                setIsPasswordMatch(false);
            } else {
                setIsPasswordMatch(true);
            }
        } else {
            setIsPasswordMatch(true);
        }
    }, [watch("password"), watch("confirmPassword")]);

    useEffect(() => {
        if (email) {
            setValue("email", email);
        }
    }, [email]);

    return (
        <div className="flex flex-col gap-4 items-center justify-center h-screen">
            <a href="/" className="flex items-center gap-2">
                <span className="text-2xl font-black font-display">
                    Link
                    <span className="text-primary">LET</span>
                </span>
            </a>
            <div className="flex flex-col items-center justify-center gap-4 mx-3 md:mx-0">
                <form
                    className="flex flex-col gap-4"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className="grid grid-cols-2 gap-4">
                        <TextField
                            type="text"
                            placeholder="First Name"
                            value={watch("firstName")}
                            onChange={(e) => {
                                setValue("firstName", e.target.value);
                            }}
                            width="full"
                            error={!!errors.firstName}
                            helperText={errors.firstName?.message}
                        />
                        <TextField
                            type="text"
                            placeholder="Last Name"
                            value={watch("lastName")}
                            onChange={(e) => {
                                setValue("lastName", e.target.value);
                            }}
                            width="full"
                            error={!!errors.lastName}
                            helperText={errors.lastName?.message}
                        />
                    </div>
                    <TextField
                        type="email"
                        placeholder="Email"
                        value={watch("email")}
                        onChange={(e) => {
                            setValue("email", e.target.value);
                        }}
                        width="full"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                    />
                    <TextField
                        type="password"
                        placeholder="Password"
                        value={watch("password")}
                        onChange={(e) => {
                            setValue("password", e.target.value);
                        }}
                        width="full"
                        error={!!errors.password}
                        helperText={errors.password?.message}
                    />
                    <TextField
                        type="password"
                        placeholder="Confirm Password"
                        value={watch("confirmPassword")}
                        onChange={(e) => {
                            setValue("confirmPassword", e.target.value);
                        }}
                        width="full"
                        error={!!errors.confirmPassword || !isPasswordMatch}
                        helperText={
                            errors.confirmPassword?.message ||
                            (!isPasswordMatch && "Passwords do not match") ||
                            undefined
                        }
                    />
                    <Button
                        text="Signup"
                        type="submit"
                        variant="primary"
                        width="full"
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
                        Already have an account?{" "}
                        <span
                            className="text-primary cursor-pointer hover:underline"
                            onClick={() => {
                                router.push("/login");
                            }}
                        >
                            Login
                        </span>
                    </span>
                </div>
            </div>
            {isLoading && <LoadingScreen />}
        </div>
    );
};

const SignupWithSearchParams = () => {
    const searchParams = useSearchParams();
    const email = searchParams.get("email");

    return <SignupContent email={email || ""} />;
};

const Signup = () => {
    return (
        <GoogleOAuthProvider
            clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
        >
            <Suspense fallback={<LoadingScreen />}>
                <SignupWithSearchParams />
            </Suspense>
        </GoogleOAuthProvider>
    );
};

export default Signup;
