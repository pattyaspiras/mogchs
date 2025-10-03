<?php
include "headers.php";

if (!isset($_GET['file']) || empty($_GET['file'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No file specified']);
    exit;
}

$fileName = $_GET['file'];
$filePath = __DIR__ . '/documents/' . $fileName;

// Security check: prevent directory traversal
if (strpos($fileName, '..') !== false || strpos($fileName, '/') !== false || strpos($fileName, '\\') !== false) {
    http_response_code(403);
    echo json_encode(['error' => 'Invalid file name']);
    exit;
}

// Check if file exists
if (!file_exists($filePath)) {
    http_response_code(404);
    echo json_encode(['error' => 'File not found']);
    exit;
}

// Get file info
$fileSize = filesize($filePath);
$fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);

// Set appropriate headers for download
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . $fileName . '"');
header('Content-Length: ' . $fileSize);
header('Cache-Control: must-revalidate');
header('Pragma: public');

// Output the file
readfile($filePath);
exit;
?> 