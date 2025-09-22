"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuthStore } from "@/store/authStore";
import { decodeToken } from "@/lib/jwt";
import api from "@/lib/axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
    User,
    Lock,
    Message,
    Profile,
    Setting2,
    SecurityUser,
    Notification,
    Shield,
} from "iconsax-reactjs";
import Button from "@/components/Button";
import LoadingScreen from "@/components/LoadingScreen";
import Modal from "@/components/Modal";

// Validation schema for password update
const createPasswordSchema = (isGoogleUser: boolean) =>
    yup.object({
        currentPassword: isGoogleUser
            ? yup.string()
            : yup.string().required("Current password is required"),
        newPassword: yup
            .string()
            .min(6, "Password must be at least 6 characters")
            .required("New password is required"),
        confirmPassword: yup
            .string()
            .oneOf([yup.ref("newPassword")], "Passwords must match")
            .required("Please confirm your password"),
    });

interface UserDetails {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    userImage?: string;
    isGoogleUser?: boolean;
}

interface PasswordFormData {
    currentPassword?: string;
    newPassword: string;
    confirmPassword: string;
}

const SettingsPage = () => {
    const router = useRouter();
    const { accessToken, refreshToken, logout } = useAuthStore();
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [activeSection, setActiveSection] = useState("profile");
    const [isGoogleUser, setIsGoogleUser] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const {
        handleSubmit,
        register,
        formState: { errors },
        reset,
    } = useForm({
        resolver: yupResolver(createPasswordSchema(isGoogleUser)),
    });

    // Re-validate form when isGoogleUser changes
    useEffect(() => {
        reset();
    }, [isGoogleUser, reset]);

    // Check if user is a Google user
    const checkGoogleUser = async () => {
        try {
            const response = await api.get("/api/auth/password");
            if (response.data.isGoogleUser) {
                setIsGoogleUser(true);
            }
        } catch (error) {
            console.error("Error checking user type:", error);
        }
    };

    // Get user details from token
    useEffect(() => {
        const getUserDetails = async () => {
            try {
                if (accessToken) {
                    const decoded = decodeToken(accessToken) as any;
                    setUserDetails(decoded.user);
                    // Check if user is Google user
                    await checkGoogleUser();
                } else {
                    // Try to refresh token
                    const newToken = await refreshToken();
                    if (newToken) {
                        const decoded = decodeToken(newToken) as any;
                        setUserDetails(decoded.user);
                        // Check if user is Google user
                        await checkGoogleUser();
                    } else {
                        router.push("/login");
                    }
                }
            } catch (error) {
                console.error("Error getting user details:", error);
                router.push("/login");
            } finally {
                setIsLoading(false);
            }
        };

        getUserDetails();
    }, [accessToken, refreshToken, router]);

    const handlePasswordUpdate = async (data: any) => {
        try {
            setIsUpdatingPassword(true);
            const requestData = isGoogleUser
                ? { newPassword: data.newPassword }
                : {
                      currentPassword: data.currentPassword,
                      newPassword: data.newPassword,
                  };

            const response = await api.put("/api/auth/password", requestData);

            if (response.data.isGoogleUser) {
                toast.success(
                    "Password set successfully! Note: You will no longer be able to sign in with Google after setting a password."
                );
                setIsGoogleUser(false); // Update state since user now has a password
            } else {
                toast.success("Password updated successfully");
            }
            reset();

            // Show logout confirmation modal after successful password update
            setShowLogoutModal(true);
        } catch (error: any) {
            console.error("Password update error:", error);
            toast.error(
                error.response?.data?.message || "Failed to update password"
            );
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await logout();
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
            toast.error("Failed to logout");
        } finally {
            setIsLoggingOut(false);
            setShowLogoutModal(false);
        }
    };

    const handleCloseLogoutModal = () => {
        setShowLogoutModal(false);
    };

    if (isLoading) {
        return (
            <>
                <div className="h-screen bg-gray-50 px-3"></div>
                <LoadingScreen />
            </>
        );
    }

    if (!userDetails) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Unable to load user details
                    </h2>
                    <Button
                        text="Go to Login"
                        onClick={() => router.push("/login")}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    />
                </div>
            </div>
        );
    }

    // Sidebar navigation items
    const sidebarItems = [
        {
            id: "profile",
            label: "Profile",
            icon: Profile,
            description: "Personal information",
        },
        {
            id: "security",
            label: "Security",
            icon: Shield,
            description: "Password & security",
        },
        // {
        //     id: "notifications",
        //     label: "Notifications",
        //     icon: Notification,
        //     description: "Email preferences",
        // },
        // {
        //     id: "privacy",
        //     label: "Privacy",
        //     icon: SecurityUser,
        //     description: "Privacy settings",
        // },
    ];

    // Render content based on active section
    const renderContent = () => {
        switch (activeSection) {
            case "profile":
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                                Personal Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* First Name */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center mb-2">
                                        <User
                                            size={20}
                                            className="text-gray-600 mr-2"
                                        />
                                        <label className="text-sm font-medium text-gray-700">
                                            First Name
                                        </label>
                                    </div>
                                    <p className="text-lg text-gray-900">
                                        {userDetails?.firstName}
                                    </p>
                                </div>

                                {/* Last Name */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex items-center mb-2">
                                        <User
                                            size={20}
                                            className="text-gray-600 mr-2"
                                        />
                                        <label className="text-sm font-medium text-gray-700">
                                            Last Name
                                        </label>
                                    </div>
                                    <p className="text-lg text-gray-900">
                                        {userDetails?.lastName}
                                    </p>
                                </div>

                                {/* Email */}
                                <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                                    <div className="flex items-center mb-2">
                                        <Message
                                            size={20}
                                            className="text-gray-600 mr-2"
                                        />
                                        <label className="text-sm font-medium text-gray-700">
                                            Email Address
                                        </label>
                                    </div>
                                    <p className="text-lg text-gray-900">
                                        {userDetails?.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case "security":
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                                Security Settings
                            </h2>

                            {/* Google User Warning */}
                            {isGoogleUser && (
                                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0">
                                            <Shield className="h-5 w-5 text-amber-400" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-amber-800">
                                                Google Account
                                            </h3>
                                            <div className="mt-2 text-sm text-amber-700">
                                                <p>
                                                    You signed up using Google.
                                                    You can set a password
                                                    below, but
                                                    <strong className="font-semibold">
                                                        {" "}
                                                        you will no longer be
                                                        able to sign in with
                                                        Google
                                                    </strong>{" "}
                                                    after setting a password.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form
                                onSubmit={handleSubmit(handlePasswordUpdate)}
                                className="w-full"
                            >
                                <div className="space-y-6">
                                    {/* Current Password - Only show for non-Google users */}
                                    {!isGoogleUser && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Current Password
                                            </label>
                                            <div className="relative">
                                                <Lock
                                                    size={20}
                                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                />
                                                <input
                                                    type="password"
                                                    {...register(
                                                        "currentPassword"
                                                    )}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter your current password"
                                                />
                                            </div>
                                            {errors.currentPassword && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {
                                                        errors.currentPassword
                                                            .message
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* New Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {isGoogleUser
                                                ? "Set Password"
                                                : "New Password"}
                                        </label>
                                        <div className="relative">
                                            <Lock
                                                size={20}
                                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                            />
                                            <input
                                                type="password"
                                                {...register("newPassword")}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder={
                                                    isGoogleUser
                                                        ? "Enter your new password"
                                                        : "Enter your new password"
                                                }
                                            />
                                        </div>
                                        {errors.newPassword && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.newPassword.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {isGoogleUser
                                                ? "Confirm Password"
                                                : "Confirm New Password"}
                                        </label>
                                        <div className="relative">
                                            <Lock
                                                size={20}
                                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                            />
                                            <input
                                                type="password"
                                                {...register("confirmPassword")}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder={
                                                    isGoogleUser
                                                        ? "Confirm your new password"
                                                        : "Confirm your new password"
                                                }
                                            />
                                        </div>
                                        {errors.confirmPassword && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.confirmPassword.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end">
                                        <Button
                                            text={
                                                isUpdatingPassword
                                                    ? isGoogleUser
                                                        ? "Setting..."
                                                        : "Updating..."
                                                    : isGoogleUser
                                                    ? "Set Password"
                                                    : "Update Password"
                                            }
                                            type="submit"
                                            disabled={isUpdatingPassword}
                                            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                            icon={
                                                isUpdatingPassword ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                ) : undefined
                                            }
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                );

            case "notifications":
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                                Notification Settings
                            </h2>
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <p className="text-gray-600">
                                    Notification preferences will be available
                                    soon.
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case "privacy":
                return (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                                Privacy Settings
                            </h2>
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <p className="text-gray-600">
                                    Privacy settings will be available soon.
                                </p>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="h-screen bg-gray-50 px-3">
            <div className="lg:max-w-[60rem] lg:px-0 xl:max-w-[76rem] mx-auto py-8 h-full">
                <div className="bg-white rounded-lg overflow-hidden h-full ">
                    <div className="flex">
                        {/* Sidebar */}
                        <div className="w-16 md:w-64 bg-gray-50 border-r border-gray-200 px-2 md:px-6 h-screen">
                            <nav className="space-y-2">
                                {sidebarItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() =>
                                                setActiveSection(item.id)
                                            }
                                            className={`cursor-pointer w-full flex items-center justify-center px-3 md:px-4 py-3 text-left rounded-lg transition-colors ${
                                                activeSection === item.id
                                                    ? "bg-blue-100 text-blue-700 sm:border-r-2 sm:border-blue-500"
                                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                            }`}
                                            title={item.label}
                                        >
                                            <Icon
                                                size={20}
                                                className="flex-shrink-0"
                                            />
                                            <div className="hidden md:block flex-1 min-w-0 ml-3">
                                                <div className="text-sm font-medium">
                                                    {item.label}
                                                </div>
                                                <div className="text-xs text-gray-500 truncate">
                                                    {item.description}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 p-6">{renderContent()}</div>
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <Modal
                    title="Password Updated Successfully"
                    onClose={handleCloseLogoutModal}
                    onSave={handleLogout}
                    noButtons={true}
                    content={
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <Shield className="h-8 w-8 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Password Updated
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Your password has been successfully
                                        updated. For security reasons, we
                                        recommend logging out and signing in
                                        again with your new password.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-blue-800">
                                    <strong>Security Tip:</strong> Logging out
                                    ensures that all your sessions are refreshed
                                    with the new password.
                                </p>
                            </div>

                            {/* Custom Buttons */}
                            <div className="flex justify-end space-x-3 pt-4">
                                <Button
                                    variant="secondary"
                                    text="Stay Logged In"
                                    size="sm"
                                    onClick={handleCloseLogoutModal}
                                    disabled={isLoggingOut}
                                />
                                <Button
                                    variant="primary"
                                    text={
                                        isLoggingOut
                                            ? "Logging Out..."
                                            : "Logout & Sign In Again"
                                    }
                                    size="sm"
                                    onClick={handleLogout}
                                    disabled={isLoggingOut}
                                    icon={
                                        isLoggingOut ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        ) : undefined
                                    }
                                />
                            </div>
                        </div>
                    }
                />
            )}
        </div>
    );
};

export default SettingsPage;
