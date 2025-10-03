import React from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Plus } from "lucide-react";

export default function UsersContent({
	users,
	loading,
	onAddUser,
	onViewProfile,
}) {
	return (
		<>
			{/* Users List */}
			<Card className="dark:bg-slate-800 dark:border-slate-700">
				<CardContent className="p-4 lg:p-6">
					<div className="flex justify-between items-center mb-4">
						<div className="text-base font-semibold lg:text-lg text-slate-900 dark:text-white">
							Users Management
						</div>
						<div className="flex gap-2">
							<Button
								onClick={onAddUser}
								className="text-white bg-blue-600 hover:bg-blue-700"
							>
								<Plus className="mr-2 w-4 h-4" />
								Add User
							</Button>
						</div>
					</div>

					{loading ? (
						<div className="py-8 text-center text-slate-500 dark:text-slate-400">
							Loading users...
						</div>
					) : users.length === 0 ? (
						<div className="py-8 text-center text-slate-500 dark:text-slate-400">
							No users found
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full border-collapse">
								<thead>
									<tr className="border-b border-slate-200 dark:border-slate-600">
										<th className="px-4 py-3 font-medium text-left text-slate-700 dark:text-white">
											User ID
										</th>
										<th className="px-4 py-3 font-medium text-left text-slate-700 dark:text-white">
											Name
										</th>
										<th className="px-4 py-3 font-medium text-left text-slate-700 dark:text-white">
											Email
										</th>
										<th className="px-4 py-3 font-medium text-left text-slate-700 dark:text-white">
											User Level
										</th>
									</tr>
								</thead>
								<tbody>
									{users.map((user, index) => (
										<tr
											key={user.id}
											onClick={() => onViewProfile(user.id, "user")}
											className={`border-b border-slate-100 dark:border-slate-600 cursor-pointer transition-colors duration-200 hover:bg-slate-100 dark:hover:bg-slate-600 ${
												index % 2 === 0
													? "bg-slate-50 dark:bg-slate-700"
													: "bg-white dark:bg-slate-700"
											}`}
										>
											<td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
												{user.id}
											</td>
											<td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
												{user.firstname} {user.lastname}
											</td>
											<td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
												{user.email}
											</td>
											<td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
													{user.userLevel}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>
		</>
	);
}
