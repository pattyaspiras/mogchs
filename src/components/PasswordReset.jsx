import React, { useState, useEffect } from "react";
import { LockKeyhole, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { sendPasswordResetOTP, resetPassword } from "../utils/admin";
import toast from "react-hot-toast";

export default function PasswordReset({ user, onPasswordReset, onCancel }) {
	const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify OTP, 3: New Password
	const [otp, setOtp] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [newPinCode, setNewPinCode] = useState("");
	const [confirmPinCode, setConfirmPinCode] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [showPinCode, setShowPinCode] = useState(false);
	const [showConfirmPinCode, setShowConfirmPinCode] = useState(false);
	const [storedOTP, setStoredOTP] = useState(""); // Store OTP in JavaScript

	// Remove automatic OTP sending - user will click button instead
	// useEffect(() => {
	// 	handleSendOTP();
	// }, []);

	const handleSendOTP = async () => {
		setIsLoading(true);
		setError("");

		try {
			const userType = user.userLevel === "Student" ? "student" : "user";
			const result = await sendPasswordResetOTP(user.id, userType);

			if (result.status === "success") {
				// Store the OTP that was sent (we'll get it from the response)
				if (result.otp) {
					setStoredOTP(result.otp);
				}
				toast.success("OTP sent to your email!");
				setStep(2);
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
		const needsPasswordReset = user.needsPasswordReset;
		const needsPinReset = user.needsPinReset;
		let validPassword = true;
		let validPin = true;

		// Validate password if it needs to be reset
		if (needsPasswordReset) {
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
			if (newPassword.toLowerCase() === user.lastname.toLowerCase()) {
				setError("Password cannot be your lastname");
				toast.error("Password cannot be your lastname");
				return;
			}
		}

		// Validate PIN code if it needs to be reset
		if (user.userLevel !== "Student" && needsPinReset) {
			if (newPinCode.length !== 4) {
				setError("PIN code must be 4 digits");
				toast.error("PIN code must be 4 digits");
				return;
			}

			if (!/^\d+$/.test(newPinCode)) {
				setError("PIN code must contain only numbers");
				toast.error("PIN code must contain only numbers");
				return;
			}

			if (newPinCode !== confirmPinCode) {
				setError("PIN codes do not match");
				toast.error("PIN codes do not match");
				return;
			}

			// Check if PIN is not the last 4 digits of ID
			const lastFourDigits = user.id.slice(-4);
			if (newPinCode === lastFourDigits) {
				setError("PIN code cannot be the last 4 digits of your ID");
				toast.error("PIN code cannot be the last 4 digits of your ID");
				return;
			}
		}

		setIsLoading(true);
		setError("");

		try {
			const userType = user.userLevel === "Student" ? "student" : "user";
			const result = await resetPassword(
				user.id,
				userType,
				needsPasswordReset ? newPassword : null,
				needsPinReset ? newPinCode : null
			);

			if (result.status === "success") {
				toast.success(result.message);
				onPasswordReset();
			} else {
				setError(result.message || "Failed to reset credentials");
				toast.error(result.message || "Failed to reset credentials");
			}
		} catch (error) {
			console.error("Reset credentials error:", error);
			setError("Failed to reset credentials. Please try again.");
			toast.error("Failed to reset credentials. Please try again.");
		}

		setIsLoading(false);
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
						{user.needsPasswordReset && user.needsPinReset
							? "Password & PIN Reset Required"
							: user.needsPasswordReset
							? "Password Reset Required"
							: "PIN Reset Required"}
					</CardTitle>
					<p className="mt-2 text-gray-600 dark:text-gray-300">
						{step === 1 && "Click the button below to send OTP to your email"}
						{step === 2 && "Enter the 6-digit OTP sent to your email"}
						{step === 3 && (
							<>
								{user.needsPasswordReset && user.needsPinReset
									? "Create your new password and PIN code"
									: user.needsPasswordReset
									? "Create your new password"
									: "Create your new PIN code"}
							</>
						)}
					</p>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Error Message */}
					{error && (
						<div className="p-3 text-sm text-red-700 bg-red-100 rounded-md dark:bg-red-900/20 dark:text-red-300">
							{error}
						</div>
					)}

					{/* Step 1: Send OTP */}
					{step === 1 && (
						<div className="space-y-4 text-center">
							<p className="text-gray-600 dark:text-gray-300">
								We'll send a 6-digit OTP to <strong>{user.email}</strong>
							</p>
							<Button
								onClick={handleSendOTP}
								disabled={isLoading}
								className="w-full"
							>
								{isLoading ? (
									<div className="mx-auto w-5 h-5 rounded-full border-2 border-white animate-spin border-t-transparent" />
								) : (
									"Send OTP"
								)}
							</Button>
						</div>
					)}

					{/* Step 2: OTP Verification */}
					{step === 2 && (
						<div className="space-y-4">
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
									onClick={handleSendOTP}
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
							{user.needsPasswordReset && (
								<>
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
												onClick={() =>
													setShowConfirmPassword(!showConfirmPassword)
												}
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
								</>
							)}

							{user.userLevel !== "Student" && user.needsPinReset && (
								<>
									<div>
										<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
											New PIN Code
										</Label>
										<div className="relative mt-1">
											<Input
												type={showPinCode ? "text" : "password"}
												value={newPinCode}
												onChange={(e) => {
													const value = e.target.value.replace(/\D/g, "");
													if (value.length <= 4) setNewPinCode(value);
												}}
												placeholder="Enter 4-digit PIN code"
												className="pr-10 text-lg tracking-widest text-center"
												maxLength={4}
											/>
											<button
												type="button"
												onClick={() => setShowPinCode(!showPinCode)}
												className="flex absolute inset-y-0 right-0 items-center pr-3"
											>
												{showPinCode ? (
													<EyeOff className="w-4 h-4 text-gray-400" />
												) : (
													<Eye className="w-4 h-4 text-gray-400" />
												)}
											</button>
										</div>
										<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
											Must be 4 digits
										</p>
									</div>

									<div>
										<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
											Confirm New PIN Code
										</Label>
										<div className="relative mt-1">
											<Input
												type={showConfirmPinCode ? "text" : "password"}
												value={confirmPinCode}
												onChange={(e) => {
													const value = e.target.value.replace(/\D/g, "");
													if (value.length <= 4) setConfirmPinCode(value);
												}}
												placeholder="Confirm 4-digit PIN code"
												className="pr-10 text-lg tracking-widest text-center"
												maxLength={4}
											/>
											<button
												type="button"
												onClick={() =>
													setShowConfirmPinCode(!showConfirmPinCode)
												}
												className="flex absolute inset-y-0 right-0 items-center pr-3"
											>
												{showConfirmPinCode ? (
													<EyeOff className="w-4 h-4 text-gray-400" />
												) : (
													<Eye className="w-4 h-4 text-gray-400" />
												)}
											</button>
										</div>
									</div>
								</>
							)}

							<div className="text-center">
								<Button
									onClick={handleResetPassword}
									disabled={
										isLoading ||
										(user.needsPasswordReset &&
											(newPassword.length < 8 ||
												newPassword !== confirmPassword)) ||
										(user.userLevel !== "Student" &&
											user.needsPinReset &&
											(newPinCode.length !== 4 ||
												newPinCode !== confirmPinCode))
									}
									className="w-full"
								>
									{isLoading ? (
										<div className="mx-auto w-5 h-5 rounded-full border-2 border-white animate-spin border-t-transparent" />
									) : (
										"Reset Credentials"
									)}
								</Button>
							</div>
						</div>
					)}

					{/* Cancel Button */}
					<div className="text-center">
						<Button
							variant="outline"
							onClick={onCancel}
							disabled={isLoading}
							className="text-sm"
						>
							<ArrowLeft className="mr-2 w-4 h-4" />
							Cancel
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
