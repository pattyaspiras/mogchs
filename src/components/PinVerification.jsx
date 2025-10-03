import React, { useState } from "react";
import { LockKeyhole, ArrowRight } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { verifyPin } from "../utils/admin";
import toast from "react-hot-toast";

export default function PinVerification({ user, onPinVerified, onCancel }) {
	const [pin, setPin] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (event) => {
		event.preventDefault();
		setIsLoading(true);
		setError("");

		// Validate PIN format
		if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
			setError("PIN must be exactly 4 digits");
			toast.error("PIN must be exactly 4 digits");
			setIsLoading(false);
			return;
		}

		try {
			// Verify PIN using backend
			const result = await verifyPin(user.id, pin);

			if (result.valid) {
				toast.success("PIN verified successfully!");
				onPinVerified();
			} else {
				setError("Invalid PIN code. Please try again.");
				toast.error("Invalid PIN code. Please try again.");
			}
		} catch (error) {
			console.error("PIN verification error:", error);
			setError("Failed to verify PIN. Please try again.");
			toast.error("Failed to verify PIN. Please try again.");
		}

		setIsLoading(false);
	};

	const handlePinChange = (e) => {
		const value = e.target.value.replace(/\D/g, ""); // Only allow digits
		if (value.length <= 4) {
			setPin(value);
			setError("");
		}
	};

	return (
		<div className="flex justify-center items-center p-4 w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
			<div className="w-full max-w-md">
				<Card className="shadow-lg bg-white/80">
					<CardHeader className="text-center">
						<div className="inline-flex justify-center items-center mx-auto mb-4 w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full">
							<LockKeyhole className="w-6 h-6 text-white" />
						</div>
						<CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
							PIN Verification
						</CardTitle>
						<p className="mt-2 text-sm text-slate-500">
							Hello, {user.firstname} {user.lastname}
						</p>
						<p className="text-sm text-slate-500">
							Please enter your 4-digit PIN to continue
						</p>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-6">
							<div className="space-y-2">
								<Label htmlFor="pin" className="text-sm font-medium text-black">
									PIN Code
								</Label>
								<div className="relative">
									<div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none text-slate-400">
										<LockKeyhole className="w-4 h-4" />
									</div>
									<Input
										id="pin"
										type="password"
										value={pin}
										onChange={handlePinChange}
										placeholder="••••"
										className="pl-10 text-2xl tracking-widest text-center text-black transition-colors bg-slate-50 border-slate-200 focus:bg-white"
										maxLength={4}
										required
									/>
								</div>
								{error && <p className="text-sm text-red-600">{error}</p>}
							</div>

							<div className="flex gap-3">
								<Button
									type="button"
									variant="outline"
									onClick={onCancel}
									className="flex-1"
									disabled={isLoading}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									className="flex flex-1 gap-2 justify-center items-center font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-md transition-all duration-200 cursor-pointer hover:from-blue-700 hover:to-indigo-700"
									disabled={isLoading || pin.length !== 4}
								>
									{isLoading ? (
										<div className="w-4 h-4 rounded-full border-2 border-white animate-spin border-t-transparent" />
									) : (
										<>
											Verify
											<ArrowRight className="w-4 h-4" />
										</>
									)}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
