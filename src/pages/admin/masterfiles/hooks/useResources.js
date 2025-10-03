import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
	getDocuments,
	getRequirementTypes,
	addDocument,
	addRequirementType,
	updateDocument,
	updateRequirementType,
	deleteDocument,
	deleteRequirementType,
	getDocumentRequirements,
	addDocumentRequirement,
	deleteDocumentRequirement,
	updateDocumentRequirements,
	getPurposes,
	addPurpose,
	updatePurpose,
	deletePurpose,
} from "../../../../utils/admin";

export default function useResources() {
	const [documents, setDocuments] = useState([]);
	const [requirementTypes, setRequirementTypes] = useState([]);
	const [documentRequirements, setDocumentRequirements] = useState([]);
	const [purposes, setPurposes] = useState([]);
	const [loading, setLoading] = useState(false);
	const [showAddModal, setShowAddModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showDocumentRequirementModal, setShowDocumentRequirementModal] =
		useState(false);
	const [editingItem, setEditingItem] = useState(null);
	const [deletingItem, setDeletingItem] = useState(null);
	const [modalType, setModalType] = useState("");
	const [formData, setFormData] = useState({ name: "" });
	const [documentRequirementForm, setDocumentRequirementForm] = useState({
		documentId: "",
		requirementTypeIds: [],
	});

	const fetchData = async () => {
		setLoading(true);
		try {
			const [docsData, reqTypesData, docReqsData, purposesData] =
				await Promise.all([
					getDocuments(),
					getRequirementTypes(),
					getDocumentRequirements(),
					getPurposes(),
				]);

			setDocuments(Array.isArray(docsData) ? docsData : []);
			setRequirementTypes(Array.isArray(reqTypesData) ? reqTypesData : []);
			setDocumentRequirements(Array.isArray(docReqsData) ? docReqsData : []);
			setPurposes(Array.isArray(purposesData) ? purposesData : []);
		} catch (error) {
			console.error("Error fetching data:", error);
			toast.error("Failed to load resources");
			setDocuments([]);
			setRequirementTypes([]);
			setDocumentRequirements([]);
			setPurposes([]);
		} finally {
			setLoading(false);
		}
	};

	const handleAdd = (type) => {
		setModalType(type);
		setFormData({ name: "" });
		setShowAddModal(true);
	};

	const handleEdit = (item, type) => {
		setModalType(type);
		setEditingItem(item);
		if (type === "purpose") {
			setFormData({
				name: item.name,
				documentId: item.documentId,
			});
		} else {
			setFormData({
				name: type === "document" ? item.name : item.nameType,
			});
		}
		setShowEditModal(true);
	};

	const handleDelete = (id, type) => {
		setDeletingItem({ id, type });
		setShowDeleteModal(true);
	};

	const handleAddDocumentRequirement = () => {
		setDocumentRequirementForm({
			documentId: "",
			requirementTypeIds: [],
		});
		setShowDocumentRequirementModal(true);
	};

	const handleDeleteDocumentRequirement = (id) => {
		setDeletingItem({ id, type: "documentRequirement" });
		setShowDeleteModal(true);
	};

	const confirmDelete = async () => {
		if (!deletingItem) return;

		try {
			let result;
			if (deletingItem.type === "document") {
				result = await deleteDocument(deletingItem.id);
			} else if (deletingItem.type === "requirement") {
				result = await deleteRequirementType(deletingItem.id);
			} else if (deletingItem.type === "documentRequirement") {
				result = await deleteDocumentRequirement(deletingItem.id);
			} else if (deletingItem.type === "purpose") {
				result = await deletePurpose(deletingItem.id);
			}

			if (result && result.status === "success") {
				toast.success(
					`${
						deletingItem.type === "document"
							? "Document"
							: deletingItem.type === "requirement"
							? "Requirement type"
							: deletingItem.type === "purpose"
							? "Purpose"
							: "Document requirement"
					} deleted successfully`
				);
				fetchData();
			} else {
				toast.error(result?.message || "Failed to delete item");
			}
		} catch (error) {
			console.error("Error deleting item:", error);
			toast.error("Failed to delete item");
		} finally {
			setShowDeleteModal(false);
			setDeletingItem(null);
		}
	};

	const handleSubmit = async (e, userId) => {
		e.preventDefault();

		if (!formData.name?.trim()) {
			toast.error("Name is required");
			return;
		}

		// For purposes, also check documentId
		if (modalType === "purpose" && !formData.documentId) {
			toast.error("Document selection is required");
			return;
		}

		const submitData = {
			...formData,
			userId: userId || null,
		};

		// Debug logging
		console.log("handleSubmit called with:", {
			userId,
			submitData,
			modalType,
			showEditModal,
			editingItem,
		});

		try {
			let result;
			if (showEditModal) {
				if (modalType === "document") {
					console.log("Updating document:", editingItem.id, submitData);
					result = await updateDocument(editingItem.id, submitData);
				} else if (modalType === "purpose") {
					console.log("Updating purpose:", editingItem.id, submitData);
					result = await updatePurpose(editingItem.id, submitData);
				} else {
					console.log("Updating requirement type:", editingItem.id, submitData);
					result = await updateRequirementType(editingItem.id, submitData);
				}
			} else {
				if (modalType === "document") {
					console.log("Adding document:", submitData);
					result = await addDocument(submitData);
				} else if (modalType === "purpose") {
					console.log("Adding purpose:", submitData);
					result = await addPurpose(submitData);
				} else {
					console.log("Adding requirement type:", submitData);
					result = await addRequirementType(submitData);
				}
			}

			console.log("API result:", result);

			if (result && result.status === "success") {
				toast.success(
					`${
						modalType === "document"
							? "Document"
							: modalType === "purpose"
							? "Purpose"
							: "Requirement type"
					} ${showEditModal ? "updated" : "added"} successfully`
				);
				setShowAddModal(false);
				setShowEditModal(false);
				fetchData();
			} else {
				console.error("API returned error:", result);
				toast.error(result?.message || "Failed to save item");
			}
		} catch (error) {
			console.error("Error saving item:", error);
			toast.error("Failed to save item");
		}
	};

	const handleDocumentRequirementSubmit = async (e, userId) => {
		e.preventDefault();

		if (
			!documentRequirementForm.documentId ||
			!documentRequirementForm.requirementTypeIds ||
			documentRequirementForm.requirementTypeIds.length === 0
		) {
			toast.error(
				"Please select both document and at least one requirement type"
			);
			return;
		}

		try {
			// Add multiple requirements in parallel
			const promises = documentRequirementForm.requirementTypeIds.map(
				(requirementTypeId) =>
					addDocumentRequirement(
						documentRequirementForm.documentId,
						requirementTypeId,
						userId
					)
			);

			const results = await Promise.all(promises);
			const successCount = results.filter(
				(result) => result && result.status === "success"
			).length;
			const errorCount = results.length - successCount;

			if (errorCount === 0) {
				toast.success(
					`${successCount} document requirement(s) added successfully`
				);
				setShowDocumentRequirementModal(false);
				setDocumentRequirementForm({
					documentId: "",
					requirementTypeIds: [],
				});
				fetchData();
			} else if (successCount > 0) {
				toast.success(
					`${successCount} requirement(s) added, ${errorCount} failed`
				);
				setShowDocumentRequirementModal(false);
				setDocumentRequirementForm({
					documentId: "",
					requirementTypeIds: [],
				});
				fetchData();
			} else {
				toast.error("Failed to add any document requirements");
			}
		} catch (error) {
			console.error("Error adding document requirements:", error);
			toast.error("Failed to add document requirements");
		}
	};

	const handleUpdateDocumentRequirements = async (
		documentId,
		requirementTypeIds,
		userId
	) => {
		try {
			const result = await updateDocumentRequirements(
				documentId,
				requirementTypeIds,
				userId
			);

			if (result && result.status === "success") {
				fetchData();
				toast.success("Document requirements updated successfully");
				return true;
			} else {
				toast.error(
					result?.message || "Failed to update document requirements"
				);
				return false;
			}
		} catch (error) {
			console.error("Error updating document requirements:", error);
			toast.error("Failed to update document requirements");
			return false;
		}
	};

	const resetForm = () => {
		setFormData({ name: "", documentId: "" });
		setEditingItem(null);
		setShowAddModal(false);
		setShowEditModal(false);
		setShowDeleteModal(false);
		setDeletingItem(null);
		setShowDocumentRequirementModal(false);
		setDocumentRequirementForm({
			documentId: "",
			requirementTypeIds: [],
		});
	};

	useEffect(() => {
		fetchData();
	}, []);

	return {
		// State
		documents,
		requirementTypes,
		documentRequirements,
		purposes,
		loading,
		showAddModal,
		showEditModal,
		showDeleteModal,
		showDocumentRequirementModal,
		editingItem,
		deletingItem,
		modalType,
		formData,
		documentRequirementForm,
		// Actions
		handleAdd,
		handleEdit,
		handleDelete,
		handleAddDocumentRequirement,
		handleDeleteDocumentRequirement,
		confirmDelete,
		handleSubmit,
		handleDocumentRequirementSubmit,
		handleUpdateDocumentRequirements,
		resetForm,
		setFormData,
		setDocumentRequirementForm,
		// Setters for modals
		setShowDeleteModal,
		setDeletingItem,
		setShowDocumentRequirementModal,
	};
}
