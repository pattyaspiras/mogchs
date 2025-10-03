import React, { useState } from "react";
import { LockKeyhole, ArrowLeft, Eye, EyeOff, Mail } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
	checkEmailExists,
	sendPasswordResetOTP,
	resetPassword,
} from "../utils/admin";
import toast from "react-hot-toast";

export default function ForgotPassword({ onBackToLogin }) {
	const [step, setStep] = useState(1); // 1: Enter Email, 2: Verify OTP, 3: New Password
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [storedOTP, setStoredOTP] = useState(""); // Store OTP in JavaScript
	const [userData, setUserData] = useState(null); // Store user data after email verification

	const handleEmailSubmit = async () => {
		if (!email.trim()) {
			setError("Please enter your email address");
			toast.error("Please enter your email address");
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			const result = await checkEmailExists(email);

			if (result.exists) {
				setUserData(result);
				toast.success("Email verified! Sending OTP to your email...");

				// Automatically send OTP after email verification
				const otpResult = await sendPasswordResetOTP(
					result.userId,
					result.userType
				);

				if (otpResult.status === "success") {
					// Store the OTP that was sent
					if (otpResult.otp) {
						setStoredOTP(otpResult.otp);
					}
					toast.success("OTP sent to your email!");
					setStep(2);
				} else {
					setError(otpResult.message || "Failed to send OTP");
					toast.error(otpResult.message || "Failed to send OTP");
				}
			} else {
				setError(
					"Email not found in our records. Please check your email address."
				);
				toast.error("Email not found in our records.");
			}
		} catch (error) {
			console.error("Email check error:", error);
			setError("Failed to verify email. Please try again.");
			toast.error("Failed to verify email. Please try again.");
		}

		setIsLoading(false);
	};

	const handleResendOTP = async () => {
		setIsLoading(true);
		setError("");

		try {
			const result = await sendPasswordResetOTP(
				userData.userId,
				userData.userType
			);

			if (result.status === "success") {
				// Store the OTP that was sent
				if (result.otp) {
					setStoredOTP(result.otp);
				}
				toast.success("OTP resent to your email!");
			} else {
				setError(result.message || "Failed to send OTP");
				toast.error(result.message || "Failed to send OTP");
			}
		} catch (error) {
			console.error("Send OTP error:", error);
			setError("Failed to send OTP. Please try again.");
			toast.error("Failed to send OTP. Please try again.");
		}

		setIsLoading(false);
	};

	const handleVerifyOTP = async () => {
		if (otp.length !== 6) {
			setError("Please enter a 6-digit OTP");
			toast.error("Please enter a 6-digit OTP");
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			// Verify OTP locally first
			if (otp === storedOTP) {
				toast.success("OTP verified successfully!");
				setStep(3);
			} else {
				setError("Invalid OTP. Please try again.");
				toast.error("Invalid OTP. Please try again.");
			}
		} catch (error) {
			console.error("Verify OTP error:", error);
			setError("Failed to verify OTP. Please try again.");
			toast.error("Failed to verify OTP. Please try again.");
		}

		setIsLoading(false);
	};

	const handleResetPassword = async () => {
		// Validate password
		if (newPassword.length < 8) {
			setError("Password must be at least 8 characters long");
			toast.error("Password must be at least 8 characters long");
			return;
		}

		if (newPassword !== confirmPassword) {
			setError("Passwords do not match");
			toast.error("Passwords do not match");
			return;
		}

		// Check if password is not the same as lastname
		if (newPassword.toLowerCase() === userData.lastname.toLowerCase()) {
			setError("Password cannot be your lastname");
			toast.error("Password cannot be your lastname");
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			const result = await resetPassword(
				userData.userId,
				userData.userType,
				newPassword
			);

			if (result.status === "success") {
				toast.success("Password reset successfully!");
				onBackToLogin();
			} else {
				setError(result.message || "Failed to reset password");
				toast.error(result.message || "Failed to reset password");
			}
		} catch (error) {
			console.error("Reset password error:", error);
			setError("Failed to reset password. Please try again.");
			toast.error("Failed to reset password. Please try again.");
		}

		setIsLoading(false);
	};

	const handleEmailChange = (e) => {
		setEmail(e.target.value);
		setError("");
	};

	const handleOtpChange = (e) => {
		const value = e.target.value.replace(/\D/g, ""); // Only allow digits
		if (value.length <= 6) {
			setOtp(value);
			setError("");
		}
	};

	const handlePasswordChange = (e) => {
		setNewPassword(e.target.value);
		setError("");
	};

	const handleConfirmPasswordChange = (e) => {
		setConfirmPassword(e.target.value);
		setError("");
	};

	return (
		<div className="flex justify-center items-center p-4 w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="flex justify-center mb-4">
						<div className="flex justify-center items-center w-16 h-16 bg-blue-100 rounded-full dark:bg-blue-900">
							<LockKeyhole className="w-8 h-8 text-blue-600 dark:text-blue-400" />
						</div>
					</div>
					<CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
						Forgot Password
					</CardTitle>
					<p className="mt-2 text-gray-600 dark:text-gray-300">
						{step === 1 && "Enter your email address to reset your password"}
						{step === 2 && "Enter the 6-digit OTP sent to your email"}
						{step === 3 && "Create a new password"}
					</p>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Error Message */}
					{error && (
						<div className="p-3 text-sm text-red-700 bg-red-100 rounded-md dark:bg-red-900/20 dark:text-red-300">
							{error}
						</div>
					)}

					{/* Step 1: Enter Email */}
					{step === 1 && (
						<div className="space-y-4">
							<div>
								<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
									Email Address
								</Label>
								<div className="relative mt-1">
									<Input
										type="email"
										value={email}
										onChange={handleEmailChange}
										placeholder="Enter your email address"
										className="pr-10"
									/>
									<Mail className="absolute inset-y-0 right-0 mt-3 mr-3 w-4 h-4 text-gray-400" />
								</div>
							</div>
							<div className="text-center">
								<Button
									onClick={handleEmailSubmit}
									disabled={isLoading || !email.trim()}
									className="w-full"
								>
									{isLoading ? (
										<div className="mx-auto w-5 h-5 rounded-full border-2 border-white animate-spin border-t-transparent" />
									) : (
										"Verify Email & Send OTP"
									)}
								</Button>
							</div>
						</div>
					)}

					{/* Step 2: OTP Verification */}
					{step === 2 && (
						<div className="space-y-4">
							<div className="mb-4 text-center">
								<p className="text-gray-600 dark:text-gray-300">
									We've sent a 6-digit OTP to <strong>{userData?.email}</strong>
								</p>
							</div>
							<div>
								<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
									Enter 6-digit OTP
								</Label>
								<Input
									type="text"
									value={otp}
									onChange={handleOtpChange}
									placeholder="000000"
									className="mt-1 text-lg tracking-widest text-center"
									maxLength={6}
								/>
							</div>
							<div className="text-center">
								<Button
									onClick={handleVerifyOTP}
									disabled={isLoading || otp.length !== 6}
									className="w-full"
								>
									{isLoading ? (
										<div className="mx-auto w-5 h-5 rounded-full border-2 border-white animate-spin border-t-transparent" />
									) : (
										"Verify OTP"
									)}
								</Button>
							</div>
							<div className="text-center">
								<Button
									variant="outline"
									onClick={handleResendOTP}
									disabled={isLoading}
									className="text-sm"
								>
									Resend OTP
								</Button>
							</div>
						</div>
					)}

					{/* Step 3: New Password */}
					{step === 3 && (
						<div className="space-y-4">
							<div>
								<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
									New Password
								</Label>
								<div className="relative mt-1">
									<Input
										type={showPassword ? "text" : "password"}
										value={newPassword}
										onChange={handlePasswordChange}
										placeholder="Enter new password"
										className="pr-10"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="flex absolute inset-y-0 right-0 items-center pr-3"
									>
										{showPassword ? (
											<EyeOff className="w-4 h-4 text-gray-400" />
										) : (
											<Eye className="w-4 h-4 text-gray-400" />
										)}
									</button>
								</div>
								<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
									Must be at least 8 characters long
								</p>
							</div>

							<div>
								<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
									Confirm New Password
								</Label>
								<div className="relative mt-1">
									<Input
										type={showConfirmPassword ? "text" : "password"}
										value={confirmPassword}
										onChange={handleConfirmPasswordChange}
										placeholder="Confirm new password"
										className="pr-10"
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										className="flex absolute inset-y-0 right-0 items-center pr-3"
									>
										{showConfirmPassword ? (
											<EyeOff className="w-4 h-4 text-gray-400" />
										) : (
											<Eye className="w-4 h-4 text-gray-400" />
										)}
									</button>
								</div>
							</div>

							<div className="text-center">
								<Button
									onClick={handleResetPassword}
									disabled={
										isLoading ||
										newPassword.length < 8 ||
										newPassword !== confirmPassword
									}
									className="w-full"
								>
									{isLoading ? (
										<div className="mx-auto w-5 h-5 rounded-full border-2 border-white animate-spin border-t-transparent" />
									) : (
										"Reset Password"
									)}
								</Button>
							</div>
						</div>
					)}

					{/* Back to Login Button */}
					<div className="text-center">
						<Button
							variant="outline"
							onClick={onBackToLogin}
							disabled={isLoading}
							className="text-sm"
						>
							<ArrowLeft className="mr-2 w-4 h-4" />
							Back to Login
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
