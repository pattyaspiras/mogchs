"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import Cookies from "js-cookie";
import { loginUser } from "../utils/security";
import PinVerification from "../components/PinVerification";
import PasswordReset from "../components/PasswordReset";
import ForgotPassword from "../components/ForgotPassword";
import ForgotLRN from "../components/ForgotLRN";
import Captcha from "../components/Captcha";
import ThemeToggle from "../components/ThemeToggle";
import EmailSetup from "../components/EmailSetup";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { getDecryptedApiUrl } from "../utils/apiConfig";

const COOKIE_KEY = "mogchs_user";
const SECRET_KEY = "mogchs_secret_key";

export default function LoginPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showPinVerification, setShowPinVerification] = useState(false);
	const [showPasswordReset, setShowPasswordReset] = useState(false);
	const [showForgotPassword, setShowForgotPassword] = useState(false);
	const [showForgotLRN, setShowForgotLRN] = useState(false);
	const [showEmailSetup, setShowEmailSetup] = useState(false);
	const [pendingUser, setPendingUser] = useState(null);
	const [error, setError] = useState("");
	const [showCaptcha, setShowCaptcha] = useState(false);
	const [captchaVerified, setCaptchaVerified] = useState(false);
	const [captchaError, setCaptchaError] = useState("");

	const navigate = useNavigate();

	useEffect(() => {
		const encrypted = Cookies.get(COOKIE_KEY);
		if (encrypted) {
			try {
				const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
				const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
				if (decrypted && decrypted.userLevel === "Admin") {
					navigate("/AdminDashboard");
				} else if (decrypted && decrypted.userLevel === "Registrar") {
					navigate("/RegistrarDashboard");
				} else if (decrypted && decrypted.userLevel === "Teacher") {
					navigate("/TeacherDashboard");
				} else if (decrypted && decrypted.userLevel === "Student") {
					navigate("/StudentDashboard");
				}
			} catch (e) {
				// Invalid cookie, ignore
			}
		}
	}, [navigate]);

	const handleCaptchaVerify = (isValid, userInput) => {
		if (isValid) {
			setCaptchaVerified(true);
			setCaptchaError("");
			toast.success("CAPTCHA verified successfully!");
		} else {
			setCaptchaVerified(false);
			setCaptchaError("Incorrect CAPTCHA. Please try again.");
			toast.error("Incorrect CAPTCHA. Please try again.");
		}
	};

	const handlePinVerified = () => {
		if (pendingUser) {
			// Store user data in cookie after successful PIN verification
			const encrypted = CryptoJS.AES.encrypt(
				JSON.stringify(pendingUser),
				SECRET_KEY
			).toString();
			Cookies.set(COOKIE_KEY, encrypted, { expires: 1 }); // 1 day expiry

			// Navigate to appropriate dashboard
			if (pendingUser.userLevel === "Admin") {
				toast.success("Welcome to Admin Dashboard!");
				navigate("/AdminDashboard");
			} else if (pendingUser.userLevel === "Registrar") {
				toast.success("Welcome to Registrar Dashboard!");
				navigate("/RegistrarDashboard");
			} else if (pendingUser.userLevel === "Teacher") {
				toast.success("Welcome to Teacher Dashboard!");
				navigate("/TeacherDashboard");
			}
		}
	};

	const handlePinCancel = () => {
		setShowPinVerification(false);
		setPendingUser(null);
		setIsLoading(false);
		// Reset form state
		setShowCaptcha(false);
		setCaptchaVerified(false);
		setCaptchaError("");
		toast.error("Login cancelled");
	};

	const handlePasswordReset = () => {
		// Password reset completed, go back to login
		setShowPasswordReset(false);
		setPendingUser(null);
		setIsLoading(false);
		// Reset form state
		setShowCaptcha(false);
		setCaptchaVerified(false);
		setCaptchaError("");
		setUsername("");
		setPassword("");
		setError("");
		toast.success(
			"Password reset completed. Please login with your new password."
		);
	};

	const handlePasswordResetCancel = () => {
		setShowPasswordReset(false);
		setPendingUser(null);
		setIsLoading(false);
		// Reset form state
		setShowCaptcha(false);
		setCaptchaVerified(false);
		setCaptchaError("");
		toast.error("Password reset cancelled");
	};

	const handleForgotPassword = () => {
		setShowForgotPassword(true);
	};

	const handleBackToLogin = () => {
		setShowForgotPassword(false);
		setShowForgotLRN(false);
		setShowPasswordReset(false);
		setShowEmailSetup(false);
		setPendingUser(null);
		setIsLoading(false);
		// Reset form state
		setShowCaptcha(false);
		setCaptchaVerified(false);
		setCaptchaError("");
		setUsername("");
		setPassword("");
		setError("");
	};

	const checkStudentEmail = async (userId) => {
		try {
			const apiUrl = getDecryptedApiUrl();
			const formData = new FormData();
			formData.append("operation", "checkStudentEmail");
			formData.append("json", JSON.stringify({ userId }));

			const response = await axios.post(`${apiUrl}/admin.php`, formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			console.log("Check email response:", response.data);
			return response.data;
		} catch (error) {
			console.error("Error checking student email:", error);
			throw error;
		}
	};

	const handleEmailSetupComplete = async (updatedUser) => {
		// Email setup completed, now check if password reset is needed
		console.log("Email setup completed for user:", updatedUser);
		setShowEmailSetup(false);

		// Check if password matches lastname (needs reset)
		const lastnameLower = updatedUser.lastname.toLowerCase();
		const inputPasswordLower = password.toLowerCase();

		if (inputPasswordLower === lastnameLower) {
			// Password matches lastname, needs reset
			console.log("Password matches lastname, proceeding to password reset");
			setPendingUser(updatedUser);
			setShowPasswordReset(true);
			toast.success("Email verified! Now please reset your password.");
		} else {
			// Password doesn't match lastname, proceed to dashboard
			console.log("Password doesn't match lastname, proceeding to dashboard");
			const encrypted = CryptoJS.AES.encrypt(
				JSON.stringify(updatedUser),
				SECRET_KEY
			).toString();
			Cookies.set(COOKIE_KEY, encrypted, { expires: 1 }); // 1 day expiry
			toast.success("Email verified! Welcome to Student Dashboard!");
			navigate("/StudentDashboard");
		}
		setIsLoading(false);
	};

	const handleEmailSetupCancel = () => {
		setShowEmailSetup(false);
		setPendingUser(null);
		setIsLoading(false);
		// Reset form state
		setShowCaptcha(false);
		setCaptchaVerified(false);
		setCaptchaError("");
		toast.error("Email setup cancelled");
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		// Validate username and password first
		if (!username.trim() || !password.trim()) {
			setError("Please enter both username and password.");
			toast.error("Please enter both username and password.");
			return;
		}

		// First click: Show CAPTCHA
		if (!showCaptcha) {
			setShowCaptcha(true);
			setError(""); // Clear any previous errors
			toast.success("Please complete the CAPTCHA verification to continue.");
			return;
		}

		// Second click: Check CAPTCHA and proceed with login
		if (!captchaVerified) {
			setCaptchaError("Please complete the CAPTCHA verification first.");
			toast.error("Please complete the CAPTCHA verification first.");
			return;
		}

		setIsLoading(true);
		setError(""); // Clear any previous errors
		console.log("user");

		try {
			const user = await loginUser(username, password);
			console.log("user", user);

			// Debug logging
			console.log("Login response:", user);
			console.log("needsPasswordReset:", user?.needsPasswordReset);
			console.log("needsEmailSetup:", user?.needsEmailSetup);
			console.log("userLevel:", user?.userLevel);

			if (user && user.needsEmailSetup) {
				// Student needs to set up email first
				console.log("Student needs email setup");
				setPendingUser(user);
				setShowEmailSetup(true);
				setIsLoading(false);
				toast.success("Please set up your email address to continue.");
			} else if (user && (user.needsPasswordReset || user.needsPinReset)) {
				// User needs password or PIN reset
				console.log("User needs password/PIN reset");
				setPendingUser(user);
				setShowPasswordReset(true);
				setIsLoading(false);
				toast.success(
					"Password/PIN reset required. Please check your email for OTP."
				);
			} else if (user && user.userLevel === "Admin") {
				// Admin needs PIN verification
				console.log("Redirecting to PIN verification for Admin");
				setPendingUser(user);
				setShowPinVerification(true);
				setIsLoading(false);
				toast.success("Login successful! Please enter your PIN.");
			} else if (user && user.userLevel === "Registrar") {
				// Registrar needs PIN verification
				console.log("Redirecting to PIN verification for Registrar");
				setPendingUser(user);
				setShowPinVerification(true);
				setIsLoading(false);
				toast.success("Login successful! Please enter your PIN.");
			} else if (user && user.userLevel === "Teacher") {
				// Teacher needs PIN verification
				console.log("Redirecting to PIN verification for Teacher");
				setPendingUser(user);
				setShowPinVerification(true);
				setIsLoading(false);
				toast.success("Login successful! Please enter your PIN.");
			} else if (user && user.userLevel === "Student") {
				// Student goes directly to dashboard (no PIN required)
				console.log("Redirecting to Student Dashboard");
				const encrypted = CryptoJS.AES.encrypt(
					JSON.stringify(user),
					SECRET_KEY
				).toString();
				Cookies.set(COOKIE_KEY, encrypted, { expires: 1 }); // 1 day expiry
				toast.success("Welcome to Student Dashboard!");
				navigate("/StudentDashboard");
			} else {
				// Invalid credentials - reset everything
				console.log("Login failed - invalid credentials");
				setError(
					"Invalid credentials or unauthorized access. Please check your username and password."
				);
				toast.error("Login failed");
				setShowCaptcha(false);
				setCaptchaVerified(false);
				setCaptchaError("");
				setIsLoading(false);
			}
		} catch (err) {
			console.error("Login error:", err);
			setError("Login failed. Please try again.");
			toast.error("Login failed. Please try again.");
			// Reset everything on error
			setShowCaptcha(false);
			setCaptchaVerified(false);
			setCaptchaError("");
			setIsLoading(false);
		}
	};

	// Show password reset screen if needed
	if (showPasswordReset && pendingUser) {
		return (
			<>
				<Toaster position="top-right" />
				<PasswordReset
					user={pendingUser}
					onPasswordReset={handlePasswordReset}
					onCancel={handlePasswordResetCancel}
				/>
			</>
		);
	}

	// Show forgot password screen if needed
	if (showForgotPassword) {
		return (
			<>
				<Toaster position="top-right" />
				<ForgotPassword onBackToLogin={handleBackToLogin} />
			</>
		);
	}

	if (showForgotLRN) {
		return (
			<>
				<Toaster position="top-right" />
				<ForgotLRN onBackToLogin={handleBackToLogin} />
			</>
		);
	}

	// Show email setup screen if needed
	if (showEmailSetup && pendingUser) {
		return (
			<>
				<Toaster position="top-right" />
				<EmailSetup
					user={pendingUser}
					onEmailSetupComplete={handleEmailSetupComplete}
					onCancel={handleEmailSetupCancel}
				/>
			</>
		);
	}

	// Show PIN verification screen if needed
	if (showPinVerification && pendingUser) {
		return (
			<>
				<Toaster position="top-right" />
				<PinVerification
					user={pendingUser}
					onPinVerified={handlePinVerified}
					onCancel={handlePinCancel}
				/>
			</>
		);
	}

	return (
		<>
			<Toaster position="top-right" />
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
										Senior High School Online Document Requisition System
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Right side: Login form */}
				<div className="flex flex-col justify-center px-8 py-12 w-full bg-white dark:bg-slate-900 md:w-1/2">
					<div className="mx-auto w-full max-w-sm">
						{/* Theme Toggle - Top Right */}
						<div className="flex justify-end mb-4">
							<ThemeToggle />
						</div>

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
										Senior High School Online Document Requisition System
									</p>
								</div>
							</div>
						</div>

						<div className="mb-8 text-center">
							<h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
								Login
							</h1>
							<p className="text-gray-600 dark:text-gray-300">
								Enter your credentials below to login to your account
							</p>
						</div>

						{/* Error Message Display */}
						{error && (
							<div className="flex items-start p-3 mb-4 space-x-2 bg-red-50 rounded-md border border-red-200 dark:bg-red-900/20 dark:border-red-800">
								<AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
								<div>
									<p className="text-sm font-medium text-red-700 dark:text-red-300">
										Login Failed
									</p>
									<p className="text-sm text-red-600 dark:text-red-400">
										{error}
									</p>
								</div>
							</div>
						)}

						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="space-y-2">
								<Label
									htmlFor="username"
									className="text-sm font-medium text-gray-700 dark:text-gray-300"
								>
									Username (Employee ID or School ID)
								</Label>
								<Input
									id="username"
									type="text"
									value={username}
									onChange={(e) => {
										setUsername(e.target.value);
										setError(""); // Clear error when user starts typing
									}}
									placeholder="Enter your Employee ID or School ID"
									className="px-3 py-2 w-full rounded-md border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
									required
								/>
							</div>

							<div className="space-y-2">
								<div className="flex justify-between items-center">
									<Label
										htmlFor="password"
										className="text-sm font-medium text-gray-700 dark:text-gray-300"
									>
										Password
									</Label>
									<div className="space-x-4">
										<a
											href="#"
											onClick={(e) => {
												e.preventDefault();
												handleForgotPassword();
											}}
											className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
										>
											Forgot Password?
										</a>
										<a
											href="#"
											onClick={(e) => {
												e.preventDefault();
												setShowForgotLRN(true);
											}}
											className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline"
										>
											Forgot LRN?
										</a>
									</div>
								</div>
								<div className="relative">
									<Input
										id="password"
										type={showPassword ? "text" : "password"}
										value={password}
										onChange={(e) => {
											setPassword(e.target.value);
											setError(""); // Clear error when user starts typing
										}}
										placeholder="Enter your password"
										className="px-3 py-2 pr-10 w-full rounded-md border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
										required
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="flex absolute inset-y-0 right-0 items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
									>
										{showPassword ? (
											<EyeOff className="w-5 h-5" />
										) : (
											<Eye className="w-5 h-5" />
										)}
									</button>
								</div>
							</div>

							{/* CAPTCHA Component - Only show after first login click */}
							{showCaptcha && (
								<Captcha onVerify={handleCaptchaVerify} error={captchaError} />
							)}

							<Button
								type="submit"
								className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 ${
									showCaptcha && !captchaVerified
										? "bg-gray-400 text-gray-200 cursor-not-allowed"
										: "bg-black text-white hover:bg-gray-800"
								}`}
								disabled={isLoading || (showCaptcha && !captchaVerified)}
							>
								{isLoading ? (
									<div className="mx-auto w-5 h-5 rounded-full border-2 border-white animate-spin border-t-transparent" />
								) : showCaptcha && !captchaVerified ? (
									"Complete CAPTCHA to Login"
								) : showCaptcha && captchaVerified ? (
									"Proceed with Login"
								) : (
									"Login"
								)}
							</Button>
						</form>
					</div>
				</div>
			</div>
		</>
	);
}
