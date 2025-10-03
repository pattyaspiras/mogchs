import React, { useState, useEffect } from "react";
import { AlertCircle, Mail, Lock, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "@radix-ui/react-label";
import axios from "axios";
import { getDecryptedApiUrl } from "../utils/apiConfig";
import toast from "react-hot-toast";

export default function EmailSetup({ user, onEmailSetupComplete, onCancel }) {
	const [step, setStep] = useState(1); // 1: Enter email, 2: Verify OTP
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [sentOtp, setSentOtp] = useState("");
	const [countdown, setCountdown] = useState(0);
	const [emailCheckLoading, setEmailCheckLoading] = useState(false);
	const [emailAvailable, setEmailAvailable] = useState(null);

	// Countdown timer for resend OTP
	useEffect(() => {
		let timer;
		if (countdown > 0) {
			timer = setTimeout(() => setCountdown(countdown - 1), 1000);
		}
		return () => clearTimeout(timer);
	}, [countdown]);

	// Debounced email availability check
	useEffect(() => {
		const checkEmailAvailability = async () => {
			if (!email.trim() || email.length < 5) {
				setEmailAvailable(null);
				return;
			}

			// Basic email format validation
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				setEmailAvailable(null);
				return;
			}

			setEmailCheckLoading(true);

			try {
				const apiUrl = getDecryptedApiUrl();
				const formData = new FormData();
				formData.append("operation", "checkEmailAvailability");
				formData.append(
					"json",
					JSON.stringify({
						email: email.trim(),
						excludeUserId: user.id,
					})
				);

				const response = await axios.post(`${apiUrl}/admin.php`, formData, {
					headers: { "Content-Type": "multipart/form-data" },
				});

				if (response.data.status === "success") {
					setEmailAvailable(response.data.available);
					if (!response.data.available) {
						setError(response.data.message);
					} else {
						setError("");
					}
				}
			} catch (err) {
				console.error("Email availability check error:", err);
				setEmailAvailable(null);
			} finally {
				setEmailCheckLoading(false);
			}
		};

		const timer = setTimeout(checkEmailAvailability, 1000); // 1 second debounce
		return () => clearTimeout(timer);
	}, [email, user.id]);

	const handleSendOTP = async () => {
		if (!email.trim()) {
			setError("Please enter your email address.");
			toast.error("Please enter your email address.");
			return;
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			setError("Please enter a valid email address.");
			toast.error("Please enter a valid email address.");
			return;
		}

		// Check email availability
		if (emailAvailable === false) {
			setError(
				"This email is already in use. Please choose a different email."
			);
			toast.error(
				"This email is already in use. Please choose a different email."
			);
			return;
		}

		if (emailAvailable === null || emailCheckLoading) {
			setError("Please wait while we check email availability.");
			toast.error("Please wait while we check email availability.");
			return;
		}

		// Additional email validation
		const emailLower = email.trim().toLowerCase();

		// Check for common invalid patterns
		if (
			emailLower.includes("..") ||
			emailLower.startsWith(".") ||
			emailLower.endsWith(".")
		) {
			setError("Please enter a valid email address.");
			toast.error("Please enter a valid email address.");
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			const apiUrl = getDecryptedApiUrl();
			const formData = new FormData();
			formData.append("operation", "setupStudentEmail");
			formData.append(
				"json",
				JSON.stringify({
					userId: user.id,
					email: email.trim(),
				})
			);

			const response = await axios.post(`${apiUrl}/admin.php`, formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			console.log("Email setup response:", response.data);

			if (response.data.status === "success") {
				setSentOtp(response.data.otp);
				setStep(2);
				setCountdown(300); // 5 minutes countdown
				toast.success("OTP sent to your email successfully!");
			} else {
				setError(response.data.message || "Failed to send OTP");
				toast.error(response.data.message || "Failed to send OTP");
			}
		} catch (err) {
			console.error("Email setup error:", err);
			setError("Failed to send OTP. Please try again.");
			toast.error("Failed to send OTP. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleVerifyOTP = async () => {
		if (!otp.trim()) {
			setError("Please enter the OTP.");
			toast.error("Please enter the OTP.");
			return;
		}

		if (otp.trim() !== sentOtp) {
			setError("Invalid OTP. Please check your email and try again.");
			toast.error("Invalid OTP. Please check your email and try again.");
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			const apiUrl = getDecryptedApiUrl();
			const formData = new FormData();
			formData.append("operation", "verifyEmailSetupOTP");
			formData.append(
				"json",
				JSON.stringify({
					userId: user.id,
					email: email.trim(),
					otp: sentOtp,
					inputOtp: otp.trim(),
				})
			);

			const response = await axios.post(`${apiUrl}/admin.php`, formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			console.log("OTP verification response:", response.data);

			if (response.data.status === "success") {
				toast.success("Email verified successfully!");
				// Update user object with new email
				const updatedUser = { ...user, email: email.trim() };
				onEmailSetupComplete(updatedUser);
			} else {
				setError(response.data.message || "Failed to verify OTP");
				toast.error(response.data.message || "Failed to verify OTP");
			}
		} catch (err) {
			console.error("OTP verification error:", err);
			setError("Failed to verify OTP. Please try again.");
			toast.error("Failed to verify OTP. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleResendOTP = () => {
		if (countdown > 0) return;

		setOtp("");
		setError("");
		handleSendOTP();
	};

	const formatTime = (seconds) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	};

	return (
		<div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
			<div className="hidden relative flex-col justify-center items-center w-1/2 text-white bg-gradient-to-br md:flex from-slate-900 to-slate-800">
				<div className="flex flex-col justify-center items-center w-full h-full">
					<div className="flex flex-col items-center">
						<img
							src="/images/mogchs.jpg"
							alt="MOGCHS Logo"
							className="object-contain mb-6 w-48 h-48 rounded-full border-4 border-white shadow-xl bg-white/90"
							style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)" }}
						/>
						<div className="text-center">
							<h2 className="mb-1 text-2xl font-bold tracking-wide text-white drop-shadow">
								Misamis Oriental General Comprehensive High School
							</h2>
							<p className="text-sm italic drop-shadow text-slate-200">
								Cagayan de Oro City
							</p>
							<div className="px-6 py-3 mt-4 rounded-lg border backdrop-blur-sm bg-white/10 border-white/20">
								<p className="text-lg font-semibold tracking-wide text-white drop-shadow">
									Email Setup Required
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="flex flex-col justify-center px-8 py-12 w-full bg-white dark:bg-slate-900 md:w-1/2">
				<div className="mx-auto w-full max-w-sm">
					{/* Mobile header with logo - Only visible on small screens */}
					<div className="flex flex-col items-center mb-8 md:hidden">
						<img
							src="/images/mogchs.jpg"
							alt="MOGCHS Logo"
							className="object-contain mb-4 w-24 h-24 bg-white rounded-full border-2 border-gray-300 shadow-lg"
						/>
						<div className="text-center">
							<div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 dark:bg-slate-800 dark:border-slate-700">
								<p className="text-sm font-semibold text-gray-800 dark:text-white">
									Email Setup Required
								</p>
							</div>
						</div>
					</div>

					<div className="mb-8 text-center">
						<div className="flex items-center justify-center mb-4">
							{step === 1 ? (
								<Mail className="w-12 h-12 text-blue-600" />
							) : (
								<Lock className="w-12 h-12 text-green-600" />
							)}
						</div>
						<h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
							{step === 1 ? "Setup Your Email" : "Verify Your Email"}
						</h1>
						<p className="text-gray-600 dark:text-gray-300">
							{step === 1
								? "Please enter your personal email address to continue"
								: "Enter the OTP sent to your email address"}
						</p>
					</div>

					{/* User Info */}
					<div className="p-4 mb-6 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
						<p className="text-sm text-blue-700 dark:text-blue-300">
							<strong>Student:</strong> {user.firstname} {user.lastname}
						</p>
						<p className="text-sm text-blue-700 dark:text-blue-300">
							<strong>Student ID:</strong> {user.id}
						</p>
					</div>

					{/* Error Message Display */}
					{error && (
						<div className="flex items-start p-3 mb-4 space-x-2 bg-red-50 rounded-md border border-red-200 dark:bg-red-900/20 dark:border-red-800">
							<AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
							<div>
								<p className="text-sm font-medium text-red-700 dark:text-red-300">
									Error
								</p>
								<p className="text-sm text-red-600 dark:text-red-400">
									{error}
								</p>
							</div>
						</div>
					)}

					{step === 1 ? (
						// Step 1: Enter Email
						<form
							onSubmit={(e) => {
								e.preventDefault();
								handleSendOTP();
							}}
							className="space-y-6"
						>
							<div className="space-y-2">
								<Label
									htmlFor="email"
									className="text-sm font-medium text-gray-700 dark:text-gray-300"
								>
									Personal Email Address
								</Label>
								<div className="relative">
									<Input
										id="email"
										type="email"
										value={email}
										onChange={(e) => {
											setEmail(e.target.value);
											setError("");
										}}
										placeholder="Enter your personal email"
										className={`px-3 py-2 pr-10 w-full rounded-md border focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-white ${
											emailAvailable === false
												? "border-red-300 focus:ring-red-500 dark:border-red-600"
												: emailAvailable === true
												? "border-green-300 focus:ring-green-500 dark:border-green-600"
												: "border-gray-300 focus:ring-blue-500 dark:border-slate-600"
										}`}
										required
									/>
									<div className="flex absolute inset-y-0 right-0 items-center pr-3">
										{emailCheckLoading ? (
											<div className="w-4 h-4 rounded-full border-2 border-blue-500 animate-spin border-t-transparent" />
										) : emailAvailable === true ? (
											<div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
												<svg
													className="w-2.5 h-2.5 text-white"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														fillRule="evenodd"
														d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
														clipRule="evenodd"
													/>
												</svg>
											</div>
										) : emailAvailable === false ? (
											<div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
												<svg
													className="w-2.5 h-2.5 text-white"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														fillRule="evenodd"
														d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
														clipRule="evenodd"
													/>
												</svg>
											</div>
										) : null}
									</div>
								</div>
								<div className="flex items-center space-x-2">
									<p className="text-xs text-gray-500 dark:text-gray-400">
										This email will be used for password reset and system
										notifications.
									</p>
									{emailAvailable === true && (
										<p className="text-xs text-green-600 dark:text-green-400 font-medium">
											✓ Available
										</p>
									)}
									{emailAvailable === false && (
										<p className="text-xs text-red-600 dark:text-red-400 font-medium">
											✗ Already in use
										</p>
									)}
								</div>
							</div>

							<div className="flex space-x-3">
								<Button
									type="button"
									onClick={onCancel}
									className="flex-1 py-2 px-4 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 dark:bg-slate-800 dark:text-gray-300 dark:border-slate-600 dark:hover:bg-slate-700"
								>
									<ArrowLeft className="w-4 h-4 mr-2" />
									Cancel
								</Button>
								<Button
									type="submit"
									className={`flex-1 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
										isLoading || emailAvailable !== true
											? "bg-gray-400 text-gray-200 cursor-not-allowed"
											: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
									}`}
									disabled={isLoading || emailAvailable !== true}
								>
									{isLoading ? (
										<div className="mx-auto w-5 h-5 rounded-full border-2 border-white animate-spin border-t-transparent" />
									) : emailCheckLoading ? (
										"Checking availability..."
									) : emailAvailable === false ? (
										"Email not available"
									) : emailAvailable === true ? (
										"Send OTP"
									) : (
										"Enter valid email"
									)}
								</Button>
							</div>
						</form>
					) : (
						// Step 2: Verify OTP
						<form
							onSubmit={(e) => {
								e.preventDefault();
								handleVerifyOTP();
							}}
							className="space-y-6"
						>
							<div className="p-4 bg-green-50 rounded-lg border border-green-200 dark:bg-green-900/20 dark:border-green-800">
								<p className="text-sm text-green-700 dark:text-green-300">
									OTP sent to: <strong>{email}</strong>
								</p>
								{countdown > 0 && (
									<p className="text-xs text-green-600 dark:text-green-400 mt-1">
										OTP expires in: {formatTime(countdown)}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<Label
									htmlFor="otp"
									className="text-sm font-medium text-gray-700 dark:text-gray-300"
								>
									Enter OTP
								</Label>
								<Input
									id="otp"
									type="text"
									value={otp}
									onChange={(e) => {
										setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
										setError("");
									}}
									placeholder="Enter 6-digit OTP"
									className="px-3 py-2 w-full rounded-md border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white text-center text-lg tracking-widest"
									maxLength={6}
									required
								/>
							</div>

							<div className="flex items-center justify-center">
								<button
									type="button"
									onClick={handleResendOTP}
									disabled={countdown > 0 || isLoading}
									className={`text-sm ${
										countdown > 0
											? "text-gray-400 cursor-not-allowed"
											: "text-blue-600 hover:text-blue-800 hover:underline"
									} dark:text-blue-400 dark:hover:text-blue-300`}
								>
									{countdown > 0
										? `Resend OTP in ${formatTime(countdown)}`
										: "Resend OTP"}
								</button>
							</div>

							<div className="flex space-x-3">
								<Button
									type="button"
									onClick={() => setStep(1)}
									className="flex-1 py-2 px-4 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 dark:bg-slate-800 dark:text-gray-300 dark:border-slate-600 dark:hover:bg-slate-700"
								>
									<ArrowLeft className="w-4 h-4 mr-2" />
									Back
								</Button>
								<Button
									type="submit"
									className="flex-1 py-2 px-4 rounded-md bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
									disabled={isLoading || otp.length !== 6}
								>
									{isLoading ? (
										<div className="mx-auto w-5 h-5 rounded-full border-2 border-white animate-spin border-t-transparent" />
									) : (
										"Verify Email"
									)}
								</Button>
							</div>
						</form>
					)}
				</div>
			</div>
		</div>
	);
}
