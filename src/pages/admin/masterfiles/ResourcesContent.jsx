import React, { useState } from "react";
import DocumentsTab from "./components/DocumentsTab";
import RequirementTypesTab from "./components/RequirementTypesTab";
import DocumentRequirementsTab from "./components/DocumentRequirementsTab";
import PurposeTab from "./components/PurposeTab";
import ResourceModal from "./components/ResourceModal";
import PurposeModal from "./components/PurposeModal";
import DocumentRequirementModal from "./components/DocumentRequirementModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import useResources from "./hooks/useResources";
import { getUserIdFromCookie } from "./utils/cookieUtils";

export default function ResourcesContent() {
	const [activeTab, setActiveTab] = useState("documents");
	const {
		documents,
		requirementTypes,
		documentRequirements,
		purposes,
		loading,
		showAddModal,
		showEditModal,
		showDeleteModal,
		showDocumentRequirementModal,
		deletingItem,
		modalType,
		formData,
		documentRequirementForm,
		handleAdd,
		handleEdit,
		handleDelete,
		handleAddDocumentRequirement,
		handleDeleteDocumentRequirement,
		handleUpdateDocumentRequirements,
		confirmDelete,
		handleSubmit,
		handleDocumentRequirementSubmit,
		resetForm,
		setFormData,
		setDocumentRequirementForm,
		setShowDeleteModal,
		setDeletingItem,
		setShowDocumentRequirementModal,
	} = useResources();

	// Get userId from cookie
	const userId = getUserIdFromCookie();

	// Debug logging
	console.log("ResourcesContent - userId from cookie:", userId);

	const handleFormSubmit = (e) => {
		console.log("handleFormSubmit called with userId:", userId);
		handleSubmit(e, userId);
	};

	const handleDocumentRequirementFormSubmit = (e) => {
		console.log(
			"handleDocumentRequirementFormSubmit called with userId:",
			userId
		);
		handleDocumentRequirementSubmit(e, userId);
	};

	return (
		<>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex flex-col gap-4">
					<h2 className="text-2xl font-bold">Resources Management</h2>
					<p className="text-slate-600 dark:text-slate-400">
						Manage documents, requirement types, and document requirements used
						in the system
					</p>
				</div>

				{/* Tabs */}
				<div className="border-b border-slate-200 dark:border-slate-700">
					<nav className="flex space-x-8">
						<button
							onClick={() => setActiveTab("documents")}
							className={`py-2 px-1 border-b-2 font-medium text-sm ${
								activeTab === "documents"
									? "border-blue-500 text-blue-600"
									: "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
							}`}
						>
							Documents
						</button>
						<button
							onClick={() => setActiveTab("requirement-types")}
							className={`py-2 px-1 border-b-2 font-medium text-sm ${
								activeTab === "requirement-types"
									? "border-blue-500 text-blue-600"
									: "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
							}`}
						>
							Requirement Types
						</button>
						<button
							onClick={() => setActiveTab("document-requirements")}
							className={`py-2 px-1 border-b-2 font-medium text-sm ${
								activeTab === "document-requirements"
									? "border-blue-500 text-blue-600"
									: "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
							}`}
						>
							Document Requirements
						</button>
						<button
							onClick={() => setActiveTab("purposes")}
							className={`py-2 px-1 border-b-2 font-medium text-sm ${
								activeTab === "purposes"
									? "border-blue-500 text-blue-600"
									: "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
							}`}
						>
							Purposes
						</button>
					</nav>
				</div>

				{/* Tab Content */}
				<div className="mt-6">
					{activeTab === "documents" && (
						<DocumentsTab
							documents={documents}
							loading={loading}
							onAdd={handleAdd}
							onEdit={handleEdit}
							onDelete={handleDelete}
						/>
					)}
					{activeTab === "requirement-types" && (
						<RequirementTypesTab
							requirementTypes={requirementTypes}
							loading={loading}
							onAdd={handleAdd}
							onEdit={handleEdit}
							onDelete={handleDelete}
						/>
					)}
					{activeTab === "document-requirements" && (
						<DocumentRequirementsTab
							documentRequirements={documentRequirements}
							documents={documents}
							requirementTypes={requirementTypes}
							loading={loading}
							onAdd={handleAddDocumentRequirement}
							onDelete={handleDeleteDocumentRequirement}
							onUpdate={handleUpdateDocumentRequirements}
							userId={userId}
						/>
					)}
					{activeTab === "purposes" && (
						<PurposeTab
							purposes={purposes}
							documents={documents}
							loading={loading}
							onAdd={handleAdd}
							onEdit={handleEdit}
							onDelete={handleDelete}
						/>
					)}
				</div>
			</div>
			{/* Modals */}
			<ResourceModal
				showModal={(showAddModal || showEditModal) && modalType !== "purpose"}
				modalType={modalType}
				showEditModal={showEditModal}
				formData={formData}
				onFormDataChange={setFormData}
				onSubmit={handleFormSubmit}
				onCancel={resetForm}
			/>

			<PurposeModal
				showModal={(showAddModal || showEditModal) && modalType === "purpose"}
				modalType={modalType}
				showEditModal={showEditModal}
				formData={formData}
				documents={documents}
				onFormDataChange={setFormData}
				onSubmit={handleFormSubmit}
				onCancel={resetForm}
			/>

			<DocumentRequirementModal
				showModal={showDocumentRequirementModal}
				documents={documents}
				requirementTypes={requirementTypes}
				formData={documentRequirementForm}
				onFormDataChange={setDocumentRequirementForm}
				onSubmit={handleDocumentRequirementFormSubmit}
				onCancel={() => {
					setShowDocumentRequirementModal(false);
					setDocumentRequirementForm({
						documentId: "",
						requirementTypeIds: [],
					});
				}}
			/>

			<DeleteConfirmModal
				showModal={showDeleteModal}
				deletingItem={deletingItem}
				onConfirm={confirmDelete}
				onCancel={() => {
					setShowDeleteModal(false);
					setDeletingItem(null);
				}}
			/>
		</>
	);
}
