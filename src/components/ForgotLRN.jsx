import React, { useState } from "react";
import { Label } from "@radix-ui/react-label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { AlertCircle, ArrowLeft, Search } from "lucide-react";
import { addForgotLrnRequest } from "../utils/registrar";
import toast from "react-hot-toast";

export default function ForgotLRN({ onBackToLogin }) {
	const [isLoading, setIsLoading] = useState(false);
	const [firstname, setFirstname] = useState("");
	const [lastname, setLastname] = useState("");
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		if (!firstname.trim() || !lastname.trim() || !email.trim()) {
			setError("Please fill in all fields");
			return;
		}

		setIsLoading(true);
		try {
			const response = await addForgotLrnRequest(firstname, lastname, email);
			if (response.success) {
				toast.success(
					"Request submitted successfully. Please check your email."
				);
				onBackToLogin();
			} else {
				setError(response.error || "Failed to submit request");
				toast.error(response.error || "Failed to submit request");
			}
		} catch (err) {
			console.error("Request failed:", err);
			setError("Failed to submit request. Please try again.");
			toast.error("Failed to submit request. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex justify-center items-center p-4 w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="flex justify-center mb-4">
						<div className="flex justify-center items-center w-16 h-16 bg-blue-100 rounded-full dark:bg-blue-900">
							<Search className="w-8 h-8 text-blue-600 dark:text-blue-400" />
						</div>
					</div>
					<CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
						Forgot LRN
					</CardTitle>
					<p className="mt-2 text-gray-600 dark:text-gray-300">
						Enter your details to retrieve your LRN
					</p>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Error Message */}
					{error && (
						<div className="p-3 text-sm text-red-700 bg-red-100 rounded-md dark:bg-red-900/20 dark:text-red-300">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
								First Name
							</Label>
							<Input
								type="text"
								value={firstname}
								onChange={(e) => setFirstname(e.target.value)}
								placeholder="Enter your first name"
								className="mt-1"
								required
							/>
						</div>

						<div>
							<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
								Last Name
							</Label>
							<Input
								type="text"
								value={lastname}
								onChange={(e) => setLastname(e.target.value)}
								placeholder="Enter your last name"
								className="mt-1"
								required
							/>
						</div>

						<div>
							<Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
								Email Address
							</Label>
							<Input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="Enter your email address"
								className="mt-1"
								required
							/>
						</div>

						<div className="text-center">
							<Button
								type="submit"
								disabled={
									isLoading ||
									!firstname.trim() ||
									!lastname.trim() ||
									!email.trim()
								}
								className="w-full"
							>
								{isLoading ? (
									<div className="mx-auto w-5 h-5 rounded-full border-2 border-white animate-spin border-t-transparent" />
								) : (
									"Submit Request"
								)}
							</Button>
						</div>
					</form>

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
