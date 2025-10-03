import React from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Plus, Edit, Trash2, Tag } from "lucide-react";

export default function RequirementTypesTab({
	requirementTypes,
	loading,
	onAdd,
	onEdit,
	onDelete,
}) {
	if (loading) {
		return <div className="text-center py-8">Loading...</div>;
	}

	if (requirementTypes.length === 0) {
		return (
			<Card>
				<CardContent className="p-8 text-center text-slate-500">
					<Tag className="w-12 h-12 mx-auto mb-4 text-slate-300" />
					<p>No requirement types found</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h3 className="text-lg font-semibold">Requirement Types</h3>
				<Button
					onClick={() => onAdd("requirement")}
					className="flex gap-2 items-center"
				>
					<Plus className="w-4 h-4" />
					Add Requirement Type
				</Button>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{requirementTypes.map((reqType) => (
					<Card key={reqType.id} className="hover:shadow-md transition-shadow">
						<CardContent className="p-4">
							<div className="flex justify-between items-start mb-3">
								<Tag className="w-8 h-8 text-green-500" />
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => onEdit(reqType, "requirement")}
									>
										<Edit className="w-4 h-4" />
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={() => onDelete(reqType.id, "requirement")}
										className="text-red-600 hover:text-red-700"
									>
										<Trash2 className="w-4 h-4" />
									</Button>
								</div>
							</div>
							<h4 className="font-semibold mb-2">{reqType.nameType}</h4>
							<p className="text-sm text-slate-600">
								Created: {new Date(reqType.createdAt).toLocaleDateString()}
							</p>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
