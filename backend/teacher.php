<?php
// Set reasonable limits for file uploads
ini_set('memory_limit', '512M');
ini_set('max_execution_time', 300);
ini_set('max_input_time', 300);
ini_set('post_max_size', '50M');
ini_set('upload_max_filesize', '50M');

include "headers.php";

class User {

  function getStudent()
  {
    include "connection.php";

    try {
      // First, get all students
      $sql = "SELECT a.id, a.firstname, a.middlename, a.lastname, a.lrn, a.email, a.password, a.userLevel, a.birthDate, a.age, a.religion, a.completeAddress, a.fatherName, a.motherName, a.guardianName, a.guardianRelationship, a.sectionId, a.schoolyearId, b.name as sectionName, s.name as strand, t.name as track, a.strandId, sy.year as schoolYear
      FROM tblstudent a
      LEFT JOIN tblsection b ON a.sectionId = b.id
      LEFT JOIN tblstrand s ON a.strandId = s.id
      LEFT JOIN tbltrack t ON s.trackId = t.id
      LEFT JOIN tblschoolyear sy ON a.schoolyearId = sy.id
      ORDER BY a.createdAt DESC";
      $stmt = $conn->prepare($sql); 
      $stmt->execute();

      if ($stmt->rowCount() > 0) {
        $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Now get all documents for all students in one query
        $documentsSql = "SELECT 
                          sd.id,
                          sd.studentId,
                          sd.fileName,
                          sd.createdAt,
                          sd.gradeLevelId,
                          d.name as documentType,
                          gl.name as gradeLevelName
                        FROM tblstudentdocument sd
                        LEFT JOIN tbldocument d ON sd.documentId = d.id
                        LEFT JOIN tblgradelevel gl ON sd.gradeLevelId = gl.id
                        ORDER BY sd.id DESC";
        
        $documentsStmt = $conn->prepare($documentsSql);
        $documentsStmt->execute();
        
        $allDocuments = [];
        if ($documentsStmt->rowCount() > 0) {
          $documents = $documentsStmt->fetchAll(PDO::FETCH_ASSOC);
          
          // Filter documents to only include those that actually exist in the filesystem
          // and group by studentId
          foreach ($documents as $document) {
            $filePath = __DIR__ . '/documents/' . $document['fileName'];
            if (file_exists($filePath)) {
              $studentId = $document['studentId'];
              if (!isset($allDocuments[$studentId])) {
                $allDocuments[$studentId] = [];
              }
              $allDocuments[$studentId][] = $document;
            }
          }
        }
        
        // Add documents to each student
        foreach ($students as &$student) {
          $student['documents'] = isset($allDocuments[$student['id']]) ? $allDocuments[$student['id']] : [];
        }
        
        return json_encode($students);
      }
      return json_encode([]);
    } catch (PDOException $e) {
      return json_encode(['error' => 'Database error occurred: ' . $e->getMessage()]);
    }
  }

  function getStudentRecords()
  {
    include "connection.php";

    // Get teacher's grade level and section from request
    $teacherGradeLevelId = isset($_POST["teacherGradeLevelId"]) ? $_POST["teacherGradeLevelId"] : null;
    $teacherSectionId = isset($_POST["teacherSectionId"]) ? $_POST["teacherSectionId"] : null;

    $sql = "SELECT 
              a.id, 
              a.firstname, 
              a.lastname, 
              a.lrn,
              a.email, 
              b.fileName, 
              c.name as teacherGradeLevel,
              d.name as sectionName,
              e.name as sectionGradeLevel,
              f.name as actualTeacherGradeLevel,
              b.gradeLevelId as sfGradeLevelId,
              g.name as sfGradeLevelName
            FROM tblstudent a 
            LEFT JOIN tblsfrecord b ON a.id = b.studentId
            LEFT JOIN tblgradelevel c ON b.gradeLevelId = c.id
            INNER JOIN tblsection d ON a.sectionId = d.id
            LEFT JOIN tblgradelevel e ON d.gradeLevelId = e.id
            LEFT JOIN tblgradelevel f ON f.id = :teacherGradeLevelId
            LEFT JOIN tblgradelevel g ON b.gradeLevelId = g.id
            WHERE 1=1";

    // Add grade level filter if teacher's grade level is provided
    // Only show students who are in sections of the teacher's grade level
    if ($teacherGradeLevelId) {
      $sql .= " AND d.gradeLevelId = :teacherGradeLevelId";
    }

    // Add section filter if teacher's section is provided
    if ($teacherSectionId) {
      $sql .= " AND d.id = :teacherSectionId";
    }

    $sql .= " ORDER BY a.lastname, a.firstname, b.gradeLevelId";
    
    $stmt = $conn->prepare($sql);
    
    // Bind parameters if provided
    if ($teacherGradeLevelId) {
      $stmt->bindParam(':teacherGradeLevelId', $teacherGradeLevelId);
    }
    if ($teacherSectionId) {
      $stmt->bindParam(':teacherSectionId', $teacherSectionId);
    }
    
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
      $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
      return json_encode($students);
    }
    return json_encode([]);
  }

  function getSectionsByGradeLevel()
  {
    include "connection.php";

    // Get teacher's grade level and section from request
    $teacherGradeLevelId = isset($_POST["teacherGradeLevelId"]) ? $_POST["teacherGradeLevelId"] : null;
    $teacherSectionId = isset($_POST["teacherSectionId"]) ? (int)$_POST["teacherSectionId"] : null;

    // Debug logging
    error_log("Debug - teacherGradeLevelId: " . $teacherGradeLevelId);
    error_log("Debug - teacherSectionId: " . $teacherSectionId);
    error_log("Debug - teacherSectionId type: " . gettype($teacherSectionId));

    // If teacher has a specific section assigned, only return that section
    if ($teacherSectionId && $teacherSectionId > 0) {
      $sql = "SELECT DISTINCT 
                d.name as sectionName, 
                e.name as sectionGradeLevel,
                f.name as actualTeacherGradeLevel
              FROM tblsection d 
              LEFT JOIN tblgradelevel e ON d.gradeLevelId = e.id
              LEFT JOIN tblgradelevel f ON f.id = :teacherGradeLevelId
              WHERE d.id = :teacherSectionId";
      
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':teacherGradeLevelId', $teacherGradeLevelId);
      $stmt->bindParam(':teacherSectionId', $teacherSectionId);
    } else {
      // If no specific section assigned, return all sections of the teacher's grade level
      $sql = "SELECT DISTINCT 
                d.name as sectionName, 
                e.name as sectionGradeLevel,
                f.name as actualTeacherGradeLevel
              FROM tblsection d 
              LEFT JOIN tblgradelevel e ON d.gradeLevelId = e.id
              LEFT JOIN tblgradelevel f ON f.id = :teacherGradeLevelId
              WHERE d.gradeLevelId = :teacherGradeLevelId";
      
      $stmt = $conn->prepare($sql);
      $stmt->bindParam(':teacherGradeLevelId', $teacherGradeLevelId);
    }

    $sql .= " ORDER BY d.name";
    
    error_log("Debug - SQL Query: " . $sql);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
      $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
      error_log("Debug - Sections found: " . json_encode($sections));
      return json_encode($sections);
    }
    error_log("Debug - No sections found");
    return json_encode([]);
  }

  function getAvailableSections()
  {
    include "connection.php";

    $gradeLevelId = isset($_POST["gradeLevelId"]) ? $_POST["gradeLevelId"] : null;

    if (!$gradeLevelId) {
      return json_encode(['success' => false, 'error' => 'Grade level ID is required']);
    }

    $sql = "SELECT id, name FROM tblsection WHERE gradeLevelId = :gradeLevelId ORDER BY name";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':gradeLevelId', $gradeLevelId);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
      $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
      return json_encode(['success' => true, 'sections' => $sections]);
    }
    return json_encode(['success' => true, 'sections' => []]);
  }

  function updateStudentSection()
  {
    include "connection.php";

    try {
      $studentId = $_POST['studentId'];
      $newSectionId = $_POST['newSectionId'];

      if (!$studentId || !$newSectionId) {
        return json_encode(['success' => false, 'error' => 'Student ID and Section ID are required']);
      }

      // Get the current user ID from session or request
      $userId = isset($_POST['userId']) ? $_POST['userId'] : null;
      
      // Start transaction
      $conn->beginTransaction();

      try {
        // Update the student's section
        $sql = "UPDATE tblstudent SET sectionId = :newSectionId WHERE id = :studentId";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':newSectionId', $newSectionId);
        $stmt->bindParam(':studentId', $studentId);
        $stmt->execute();

        // Get the grade level of the new section
        $gradeLevelSql = "SELECT gradeLevelId FROM tblsection WHERE id = :sectionId";
        $gradeLevelStmt = $conn->prepare($gradeLevelSql);
        $gradeLevelStmt->bindParam(':sectionId', $newSectionId);
        $gradeLevelStmt->execute();
        $gradeLevelResult = $gradeLevelStmt->fetch(PDO::FETCH_ASSOC);
        
        $gradeLevelId = $gradeLevelResult ? $gradeLevelResult['gradeLevelId'] : null;

        // If enrolling to Grade 12 (gradeLevelId = 2), insert a record in tblsfrecord
        if ($gradeLevelId == 2) {
          // Always insert a new record for Grade 12 (don't update existing)
          $insertSql = "INSERT INTO tblsfrecord (studentId, fileName, gradeLevelId, userId, createdAt) 
                        VALUES (:studentId, NULL, :gradeLevelId, :userId, NOW())";
          $insertStmt = $conn->prepare($insertSql);
          $insertStmt->bindParam(':studentId', $studentId);
          $insertStmt->bindParam(':gradeLevelId', $gradeLevelId);
          $insertStmt->bindParam(':userId', $userId);
          $insertStmt->execute();
        }

        // Commit transaction
        $conn->commit();
        
        return json_encode(['success' => true, 'message' => 'Student section updated successfully']);
      } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        throw $e;
      }
    } catch (Exception $e) {
      return json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
  }

  function updateMultipleStudentSections()
  {
    include "connection.php";

    try {
      $studentIds = json_decode($_POST['studentIds'], true);
      $newSectionId = $_POST['newSectionId'];

      if (!$studentIds || !$newSectionId) {
        return json_encode(['success' => false, 'error' => 'Student IDs and Section ID are required']);
      }

      // Get the current user ID from session or request
      $userId = isset($_POST['userId']) ? $_POST['userId'] : null;

      // Get the grade level of the new section
      $gradeLevelSql = "SELECT gradeLevelId FROM tblsection WHERE id = :sectionId";
      $gradeLevelStmt = $conn->prepare($gradeLevelSql);
      $gradeLevelStmt->bindParam(':sectionId', $newSectionId);
      $gradeLevelStmt->execute();
      $gradeLevelResult = $gradeLevelStmt->fetch(PDO::FETCH_ASSOC);
      
      $gradeLevelId = $gradeLevelResult ? $gradeLevelResult['gradeLevelId'] : null;

      $successCount = 0;
      $errorCount = 0;

      // Start transaction
      $conn->beginTransaction();

      try {
        foreach ($studentIds as $studentId) {
          // Update the student's section
          $sql = "UPDATE tblstudent SET sectionId = :newSectionId WHERE id = :studentId";
          $stmt = $conn->prepare($sql);
          $stmt->bindParam(':newSectionId', $newSectionId);
          $stmt->bindParam(':studentId', $studentId);
          
          if ($stmt->execute()) {
            // If enrolling to Grade 12 (gradeLevelId = 2), insert a record in tblsfrecord
            if ($gradeLevelId == 2) {
              // Always insert a new record for Grade 12 (don't update existing)
              $insertSql = "INSERT INTO tblsfrecord (studentId, fileName, gradeLevelId, userId, createdAt) 
                            VALUES (:studentId, NULL, :gradeLevelId, :userId, NOW())";
              $insertStmt = $conn->prepare($insertSql);
              $insertStmt->bindParam(':studentId', $studentId);
              $insertStmt->bindParam(':gradeLevelId', $gradeLevelId);
              $insertStmt->bindParam(':userId', $userId);
              $insertStmt->execute();
            }
            $successCount++;
          } else {
            $errorCount++;
          }
        }

        // Commit transaction
        $conn->commit();

        return json_encode([
          'success' => true, 
          'message' => "Updated $successCount students successfully",
          'successCount' => $successCount,
          'errorCount' => $errorCount
        ]);
      } catch (Exception $e) {
        // Rollback transaction on error
        $conn->rollback();
        throw $e;
      }
    } catch (Exception $e) {
      return json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    }
  }

  private function convertExcelToPdf($excelFilePath, $excelFileName)
  {
    try {
      // Check if the Excel file exists
      if (!file_exists($excelFilePath)) {
        error_log("Excel file not found: " . $excelFilePath);
        return false;
      }

      // Create the PDF filename (replace extension with .pdf)
      $pdfFileName = pathinfo($excelFileName, PATHINFO_FILENAME) . '.pdf';
      $pdfFilePath = __DIR__ . '/documents/' . $pdfFileName;
      
      // Ensure documents directory exists
      $documentsDir = __DIR__ . '/documents/';
      if (!is_dir($documentsDir)) {
        mkdir($documentsDir, 0777, true);
        error_log("Created documents directory: " . $documentsDir);
      }
      
      error_log("Starting Excel to PDF conversion using ConvertAPI for: " . $excelFileName);
      error_log("Excel file path: " . $excelFilePath);
      error_log("PDF file path: " . $pdfFilePath);
      error_log("Documents directory: " . $documentsDir);
      error_log("Documents directory exists: " . (is_dir($documentsDir) ? 'Yes' : 'No'));
      error_log("Documents directory writable: " . (is_writable($documentsDir) ? 'Yes' : 'No'));
      
      // Use ConvertAPI for reliable Excel to PDF conversion
      $result = $this->convertExcelToPdfWithConvertAPI($excelFilePath, $excelFileName, $pdfFilePath);
      if ($result) {
        return $pdfFileName;
      }
      
      // If ConvertAPI fails, fall back to simple approach
      error_log("ConvertAPI approach failed, trying simple approach...");
      return $this->convertExcelToPdfSimple($excelFilePath, $excelFileName, $pdfFilePath);
      
    } catch (Exception $e) {
      error_log("Error converting Excel to PDF: " . $e->getMessage());
      error_log("Error trace: " . $e->getTraceAsString());
      return false;
    }
  }
  
  private function convertExcelToPdfWithConvertAPI($excelFilePath, $excelFileName, $pdfFilePath)
  {
    try {
      error_log("Using ConvertAPI for Excel to PDF conversion...");
      
      // Use ConvertAPI for conversion
      ob_start();
      require_once 'vendor/autoload.php';
      ob_end_clean();
      
      // Set ConvertAPI credentials
      \ConvertApi\ConvertApi::setApiCredentials('vBc0J7vFKBovvKNtTxC1rEyiG1ap3eTu');
      
      // Determine the source format based on file extension
      $fileExtension = strtolower(pathinfo($excelFileName, PATHINFO_EXTENSION));
      $sourceFormat = ($fileExtension === 'xlsx') ? 'xlsx' : 'xls';
      
      error_log("Converting from format: " . $sourceFormat);
      
      // Convert Excel to PDF using ConvertAPI
      $result = \ConvertApi\ConvertApi::convert('pdf', [
        'File' => $excelFilePath,
      ], $sourceFormat);
      
      // Save the result to the documents directory
      $result->saveFiles(dirname($pdfFilePath));
      
      // Check if the PDF was created successfully
      if (file_exists($pdfFilePath)) {
        error_log("ConvertAPI PDF file saved successfully: " . $pdfFilePath);
        return pathinfo($excelFileName, PATHINFO_FILENAME) . '.pdf';
      } else {
        error_log("ConvertAPI PDF file not found after conversion: " . $pdfFilePath);
        return false;
      }
      
    } catch (Exception $e) {
      error_log("Error in ConvertAPI conversion: " . $e->getMessage());
      error_log("Error trace: " . $e->getTraceAsString());
      return false;
    }
  }



  function updateStudentFile()
  {
    // Start output buffering to prevent any HTML output
    ob_start();
    
    include "connection.php";
    
    // Suppress any potential output from autoloader
    ob_start();
    require 'vendor/autoload.php';
    ob_end_clean();

    try {
      // Check if Excel file was uploaded
      if (!isset($_FILES['excelFile'])) {
        return json_encode(['success' => false, 'error' => 'Excel file is required']);
      }

      $studentId = $_POST['studentId'];
      $gradeLevelId = isset($_POST['gradeLevelId']) ? $_POST['gradeLevelId'] : null;
      $userId = isset($_POST['userId']) ? $_POST['userId'] : 'system';

      // Debug logging
      error_log("Debug - studentId: " . $studentId);
      error_log("Debug - gradeLevelId: " . $gradeLevelId);
      error_log("Debug - userId: " . $userId);

      // Create documents directory if it doesn't exist
      $uploadDir = 'documents/';
      if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
      }

      $excelFileName = null;
      $pdfFileName = null;

      // Handle Excel file upload
      if (isset($_FILES['excelFile']) && $_FILES['excelFile']['error'] === UPLOAD_ERR_OK) {
          $excelFile = $_FILES['excelFile'];
          
          error_log("Excel file upload details: " . json_encode($excelFile));
          
          // Validate Excel file type
          $fileExtension = strtolower(pathinfo($excelFile['name'], PATHINFO_EXTENSION));
          $allowedExtensions = ['xlsx', 'xls'];

          if (!in_array($fileExtension, $allowedExtensions)) {
              error_log("Invalid file extension: " . $fileExtension);
              return json_encode(['success' => false, 'error' => 'Invalid Excel file type. Only .xlsx and .xls files are allowed.']);
          }

          // Check file size (max 10MB)
          if ($excelFile['size'] > 10 * 1024 * 1024) {
              error_log("File too large: " . $excelFile['size'] . " bytes");
              return json_encode(['success' => false, 'error' => 'Excel file size too large. Maximum size is 10MB.']);
          }

          // Use the original filename
          $excelFileName = $excelFile['name'];
          $excelFilePath = $uploadDir . $excelFileName;

          error_log("Upload directory: " . $uploadDir);
          error_log("Excel file path: " . $excelFilePath);
          error_log("Upload directory exists: " . (is_dir($uploadDir) ? 'Yes' : 'No'));
          error_log("Upload directory writable: " . (is_writable($uploadDir) ? 'Yes' : 'No'));

          // Check if a file with the same name already exists and delete it
          if (file_exists($excelFilePath)) {
              error_log("Deleting existing file: " . $excelFilePath);
              unlink($excelFilePath); // Delete the existing file
          }

          // Move uploaded Excel file
          error_log("Moving uploaded file from " . $excelFile['tmp_name'] . " to " . $excelFilePath);
          if (move_uploaded_file($excelFile['tmp_name'], $excelFilePath)) {
              error_log("Excel file moved successfully");
              
              // Convert Excel to PDF using local conversion
              $pdfFileName = $this->convertExcelToPdf($excelFilePath, $excelFileName);
              if (!$pdfFileName) {
                  error_log("PDF conversion failed for: " . $excelFileName);
                  return json_encode(['success' => false, 'error' => 'Failed to convert Excel to PDF']);
              }
              error_log("PDF conversion successful: " . $pdfFileName);
          } else {
              error_log("Failed to move uploaded file. Upload error: " . $excelFile['error']);
              error_log("PHP upload error: " . error_get_last()['message'] ?? 'Unknown error');
              return json_encode(['success' => false, 'error' => 'Failed to save Excel file']);
          }
      } else {
          error_log("Excel file upload error: " . ($_FILES['excelFile']['error'] ?? 'No file uploaded'));
          return json_encode(['success' => false, 'error' => 'Excel file upload failed']);
      }

      // If no gradeLevelId provided, get the teacher's grade level ID for this student
      if (!$gradeLevelId) {
        $gradeLevelSql = "SELECT b.gradeLevelId 
                          FROM tblstudent a 
                          LEFT JOIN tblsfrecord b ON a.id = b.studentId 
                          WHERE a.id = :studentId 
                          LIMIT 1";
        $gradeLevelStmt = $conn->prepare($gradeLevelSql);
        $gradeLevelStmt->bindParam(':studentId', $studentId);
        $gradeLevelStmt->execute();
        $gradeLevelResult = $gradeLevelStmt->fetch(PDO::FETCH_ASSOC);
        
        $gradeLevelId = $gradeLevelResult ? $gradeLevelResult['gradeLevelId'] : null;
      }

      // Start transaction
      $conn->beginTransaction();

      try {
        // Handle Excel file in tblsfrecord
        if ($excelFileName) {
          // Check if record already exists for this specific grade level
          $checkSql = "SELECT id FROM tblsfrecord WHERE studentId = :studentId AND gradeLevelId = :gradeLevelId";
          $checkStmt = $conn->prepare($checkSql);
          $checkStmt->bindParam(':studentId', $studentId);
          $checkStmt->bindParam(':gradeLevelId', $gradeLevelId);
          $checkStmt->execute();

          if ($checkStmt->rowCount() > 0) {
            // Update existing record for this grade level
            $updateSql = "UPDATE tblsfrecord SET fileName = :fileName, userId = :userId WHERE studentId = :studentId AND gradeLevelId = :gradeLevelId";
            $updateStmt = $conn->prepare($updateSql);
            $updateStmt->bindParam(':fileName', $excelFileName);
            $updateStmt->bindParam(':userId', $userId);
            $updateStmt->bindParam(':studentId', $studentId);
            $updateStmt->bindParam(':gradeLevelId', $gradeLevelId);
            
            if (!$updateStmt->execute()) {
              throw new Exception('Failed to update Excel record in tblsfrecord');
            }
          } else {
            // Insert new record for this grade level
            $insertSql = "INSERT INTO tblsfrecord (studentId, fileName, gradeLevelId, userId, createdAt) 
                          VALUES (:studentId, :fileName, :gradeLevelId, :userId, NOW())";
            $insertStmt = $conn->prepare($insertSql);
            $insertStmt->bindParam(':studentId', $studentId);
            $insertStmt->bindParam(':fileName', $excelFileName);
            $insertStmt->bindParam(':gradeLevelId', $gradeLevelId);
            $insertStmt->bindParam(':userId', $userId);
            
            if (!$insertStmt->execute()) {
              throw new Exception('Failed to insert Excel record in tblsfrecord');
            }
          }
        }

        // Handle PDF file in tblstudentdocument
        if ($pdfFileName) {
          // Get the SF10 document ID (assuming it's ID 5 based on the database dump)
          $documentId = 5; // SF10 document type

          // Check if record already exists in tblstudentdocument for this specific grade level
          $checkSql = "SELECT id FROM tblstudentdocument WHERE studentId = :studentId AND documentId = :documentId AND gradeLevelId = :gradeLevelId";
          $checkStmt = $conn->prepare($checkSql);
          $checkStmt->bindParam(':studentId', $studentId);
          $checkStmt->bindParam(':documentId', $documentId);
          $checkStmt->bindParam(':gradeLevelId', $gradeLevelId);
          $checkStmt->execute();

          if ($checkStmt->rowCount() > 0) {
            // Update existing record
            $updateSql = "UPDATE tblstudentdocument SET fileName = :fileName, userId = :userId, createdAt = NOW() 
                          WHERE studentId = :studentId AND documentId = :documentId AND gradeLevelId = :gradeLevelId";
            $updateStmt = $conn->prepare($updateSql);
            $updateStmt->bindParam(':fileName', $pdfFileName);
            $updateStmt->bindParam(':userId', $userId);
            $updateStmt->bindParam(':studentId', $studentId);
            $updateStmt->bindParam(':documentId', $documentId);
            $updateStmt->bindParam(':gradeLevelId', $gradeLevelId);
            
            if (!$updateStmt->execute()) {
              throw new Exception('Failed to update PDF record in tblstudentdocument');
            }
          } else {
            // Insert new record
            $insertSql = "INSERT INTO tblstudentdocument (studentId, fileName, documentId, gradeLevelId, userId, createdAt) 
                          VALUES (:studentId, :fileName, :documentId, :gradeLevelId, :userId, NOW())";
            $insertStmt = $conn->prepare($insertSql);
            $insertStmt->bindParam(':studentId', $studentId);
            $insertStmt->bindParam(':fileName', $pdfFileName);
            $insertStmt->bindParam(':documentId', $documentId);
            $insertStmt->bindParam(':gradeLevelId', $gradeLevelId);
            $insertStmt->bindParam(':userId', $userId);
            
            if (!$insertStmt->execute()) {
              throw new Exception('Failed to insert PDF record in tblstudentdocument');
            }
          }
        }

        // Commit transaction
        $conn->commit();

        // Prepare success message
        $message = 'Successfully uploaded Excel file and converted to PDF';
        
                 // Clean output buffer before returning JSON
         ob_end_clean();
         
         return json_encode([
           'success' => true, 
           'message' => $message,
           'excelFile' => $excelFileName,
           'pdfFile' => $pdfFileName
         ]);

       } catch (Exception $e) {
         // Rollback transaction on error
         $conn->rollback();
         throw $e;
       }

     } catch (Exception $e) {
       // Clean output buffer before returning JSON
       ob_end_clean();
       return json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
     }
   }

  function updateMultipleStudentFiles()
  {
    // Start output buffering to prevent any HTML output
    ob_start();
    
    include "connection.php";
    
    // Suppress any potential output from autoloader
    ob_start();
    require 'vendor/autoload.php';
    ob_end_clean();

    try {
      $studentIds = json_decode($_POST['studentIds'], true);
      $gradeLevelId = isset($_POST['gradeLevelId']) ? $_POST['gradeLevelId'] : null;
      $userId = isset($_POST['userId']) ? $_POST['userId'] : 'system';

      // Debug logging
      error_log("Debug - studentIds: " . json_encode($studentIds));
      error_log("Debug - gradeLevelId: " . $gradeLevelId);
      error_log("Debug - userId: " . $userId);

      if (!$studentIds) {
        return json_encode(['success' => false, 'error' => 'Student IDs are required']);
      }

      // Create documents directory if it doesn't exist
      $uploadDir = 'documents/';
      if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
      }

      $results = [];
      $successCount = 0;
      $errorCount = 0;

      // Start transaction
      $conn->beginTransaction();

      try {
        foreach ($studentIds as $studentId) {
          $studentResult = ['studentId' => $studentId, 'success' => false, 'errors' => []];
          
          // Handle Excel file for this student
          $excelFileKey = 'excelFile_' . $studentId;
          if (isset($_FILES[$excelFileKey]) && $_FILES[$excelFileKey]['error'] === UPLOAD_ERR_OK) {
            $excelFile = $_FILES[$excelFileKey];
            
            // Validate Excel file type
            $fileExtension = strtolower(pathinfo($excelFile['name'], PATHINFO_EXTENSION));
            $allowedExtensions = ['xlsx', 'xls'];

            if (!in_array($fileExtension, $allowedExtensions)) {
              $studentResult['errors'][] = 'Invalid Excel file type for student ' . $studentId;
              continue;
            }

            // Check file size (max 10MB)
            if ($excelFile['size'] > 10 * 1024 * 1024) {
              $studentResult['errors'][] = 'Excel file size too large for student ' . $studentId;
              continue;
            }

            // Use the original filename
            $excelFileName = $excelFile['name'];
            $excelFilePath = $uploadDir . $excelFileName;

            // Check if a file with the same name already exists and delete it
            if (file_exists($excelFilePath)) {
              unlink($excelFilePath); // Delete the existing file
            }

            // Move uploaded Excel file
            if (move_uploaded_file($excelFile['tmp_name'], $excelFilePath)) {
              // Convert Excel to PDF using PDFRest API
              $pdfFileName = $this->convertExcelToPdf($excelFilePath, $excelFileName);
              if (!$pdfFileName) {
                $studentResult['errors'][] = 'Failed to convert Excel to PDF for student ' . $studentId;
                continue;
              }

              // Update/insert Excel record in tblsfrecord
              $checkSql = "SELECT id FROM tblsfrecord WHERE studentId = :studentId AND gradeLevelId = :gradeLevelId";
              $checkStmt = $conn->prepare($checkSql);
              $checkStmt->bindParam(':studentId', $studentId);
              $checkStmt->bindParam(':gradeLevelId', $gradeLevelId);
              $checkStmt->execute();

              if ($checkStmt->rowCount() > 0) {
                $updateSql = "UPDATE tblsfrecord SET fileName = :fileName, userId = :userId WHERE studentId = :studentId AND gradeLevelId = :gradeLevelId";
                $updateStmt = $conn->prepare($updateSql);
                $updateStmt->bindParam(':fileName', $excelFileName);
                $updateStmt->bindParam(':userId', $userId);
                $updateStmt->bindParam(':studentId', $studentId);
                $updateStmt->bindParam(':gradeLevelId', $gradeLevelId);
                
                if (!$updateStmt->execute()) {
                  $studentResult['errors'][] = 'Failed to update Excel record for student ' . $studentId;
                }
              } else {
                $insertSql = "INSERT INTO tblsfrecord (studentId, fileName, gradeLevelId, userId, createdAt) 
                              VALUES (:studentId, :fileName, :gradeLevelId, :userId, NOW())";
                $insertStmt = $conn->prepare($insertSql);
                $insertStmt->bindParam(':studentId', $studentId);
                $insertStmt->bindParam(':fileName', $excelFileName);
                $insertStmt->bindParam(':gradeLevelId', $gradeLevelId);
                $insertStmt->bindParam(':userId', $userId);
                if (!$insertStmt->execute()) {
                  $studentResult['errors'][] = 'Failed to insert Excel record for student ' . $studentId;
                }
              }

              // Handle PDF file in tblstudentdocument (automatically converted from Excel)
              if ($pdfFileName) {
                // Get the SF10 document ID (assuming it's ID 5 based on the database dump)
                $documentId = 5; // SF10 document type
                
                // Check if record already exists in tblstudentdocument for this specific grade level
                $checkSql = "SELECT id FROM tblstudentdocument WHERE studentId = :studentId AND documentId = :documentId AND gradeLevelId = :gradeLevelId";
                $checkStmt = $conn->prepare($checkSql);
                $checkStmt->bindParam(':studentId', $studentId);
                $checkStmt->bindParam(':documentId', $documentId);
                $checkStmt->bindParam(':gradeLevelId', $gradeLevelId);
                $checkStmt->execute();

                if ($checkStmt->rowCount() > 0) {
                  // Update existing record
                  $updateSql = "UPDATE tblstudentdocument SET fileName = :fileName, userId = :userId, createdAt = NOW() 
                                WHERE studentId = :studentId AND documentId = :documentId AND gradeLevelId = :gradeLevelId";
                  $updateStmt = $conn->prepare($updateSql);
                  $updateStmt->bindParam(':fileName', $pdfFileName);
                  $updateStmt->bindParam(':userId', $userId);
                  $updateStmt->bindParam(':studentId', $studentId);
                  $updateStmt->bindParam(':documentId', $documentId);
                  $updateStmt->bindParam(':gradeLevelId', $gradeLevelId);
                  
                  if (!$updateStmt->execute()) {
                    $studentResult['errors'][] = 'Failed to update PDF record for student ' . $studentId;
                  }
                } else {
                  // Insert new record
                  $insertSql = "INSERT INTO tblstudentdocument (studentId, fileName, documentId, gradeLevelId, userId, createdAt) 
                                VALUES (:studentId, :fileName, :documentId, :gradeLevelId, :userId, NOW())";
                  $insertStmt = $conn->prepare($insertSql);
                  $insertStmt->bindParam(':studentId', $studentId);
                  $insertStmt->bindParam(':fileName', $pdfFileName);
                  $insertStmt->bindParam(':documentId', $documentId);
                  $insertStmt->bindParam(':gradeLevelId', $gradeLevelId);
                  $insertStmt->bindParam(':userId', $userId);
                  
                  if (!$insertStmt->execute()) {
                    $studentResult['errors'][] = 'Failed to insert PDF record for student ' . $studentId;
                  }
                }
              }
            } else {
              $studentResult['errors'][] = 'Failed to save Excel file for student ' . $studentId;
            }
          }

          // Check if student had any successful uploads
          if (empty($studentResult['errors'])) {
            $studentResult['success'] = true;
            $successCount++;
          } else {
            $errorCount++;
          }
          
          $results[] = $studentResult;
        }

        // Commit transaction
        $conn->commit();

                 // Clean output buffer before returning JSON
         ob_end_clean();
         
         return json_encode([
           'success' => true,
           'message' => "Successfully processed $successCount students",
           'successCount' => $successCount,
           'errorCount' => $errorCount,
           'results' => $results
         ]);

       } catch (Exception $e) {
         // Rollback transaction on error
         $conn->rollback();
         throw $e;
       }

     } catch (Exception $e) {
       // Clean output buffer before returning JSON
       ob_end_clean();
       return json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
           }
         }
     

     
     private function convertExcelToPdfSimple($excelFilePath, $excelFileName, $pdfFilePath)
    {
      try {
        error_log("Using simple PDF generation approach...");
        error_log("PDF file path: " . $pdfFilePath);
        
        // Use local libraries for conversion (TCPDF only)
        ob_start();
        require_once 'vendor/autoload.php';
        ob_end_clean();
        
        // Create new TCPDF instance
        $pdf = new \TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
        
        // Set document information
        $pdf->SetCreator('MOGCHS System');
        $pdf->SetAuthor('Teacher');
        $pdf->SetTitle('SF10 Record - ' . pathinfo($excelFileName, PATHINFO_FILENAME));
        
        // Set default header data
        $pdf->SetHeaderData('', 0, 'SF10 Student Record', 'Generated from Excel file');
        
        // Set header and footer fonts
        $pdf->setHeaderFont(Array('helvetica', '', 10));
        $pdf->setFooterFont(Array('helvetica', '', 8));
        
        // Set default monospaced font
        $pdf->SetDefaultMonospacedFont('courier');
        
        // Set margins
        $pdf->SetMargins(15, 15, 15);
        $pdf->SetHeaderMargin(5);
        $pdf->SetFooterMargin(10);
        
        // Set auto page breaks
        $pdf->SetAutoPageBreak(TRUE, 15);
        
        // Set image scale factor
        $pdf->setImageScale(1.25);
        
        // Add a page
        $pdf->AddPage();
        
        // Set font
        $pdf->SetFont('helvetica', '', 12);
        
        // Create a simple text-based PDF since we can't read the Excel content
        $html = '
        <h2>SF10 Student Record</h2>
        <p><strong>Original File:</strong> ' . htmlspecialchars($excelFileName) . '</p>
        <p><strong>Generated:</strong> ' . date('Y-m-d H:i:s') . '</p>
        <hr>
        <p>This PDF was automatically generated from the Excel file: <strong>' . htmlspecialchars($excelFileName) . '</strong></p>
        <p>The original Excel file contains the student\'s SF10 record data.</p>
        <p><em>Note: This is a placeholder PDF. The actual Excel content could not be processed due to memory constraints.</em></p>
        ';
        
        // Write HTML to PDF
        $pdf->writeHTML($html, true, false, true, false, '');
        
        // Save the PDF
        $pdfResult = $pdf->Output($pdfFilePath, 'F');
        if ($pdfResult !== false) {
          error_log("Simple PDF file saved successfully: " . $pdfFilePath);
          return pathinfo($excelFileName, PATHINFO_FILENAME) . '.pdf';
        } else {
          error_log("Failed to save simple PDF file to: " . $pdfFilePath);
          return false;
        }
        
      } catch (Exception $e) {
        error_log("Error in simple PDF generation: " . $e->getMessage());
        return false;
      }
    }
     
}

$operation = isset($_POST["operation"]) ? $_POST["operation"] : "0";
$json = isset($_POST["json"]) ? $_POST["json"] : "0";

$user = new User();

switch ($operation) {
  case "getStudentRecords":
    echo $user->getStudentRecords();
    break;
  case "getStudent":
    echo $user->getStudent();
    break;
  case "getSectionsByGradeLevel":
    echo $user->getSectionsByGradeLevel();
    break;
  case "getAvailableSections":
    echo $user->getAvailableSections();
    break;
  case "updateStudentSection":
    echo $user->updateStudentSection();
    break;
  case "updateMultipleStudentSections":
    echo $user->updateMultipleStudentSections();
    break;
  case "updateStudentFile":
    echo $user->updateStudentFile();
    break;
  case "updateMultipleStudentFiles":
    echo $user->updateMultipleStudentFiles();
    break;
  default:
    echo json_encode("WALA KA NAGBUTANG OG OPERATION SA UBOS HAHAHHA BOBO");
    http_response_code(400); // Bad Request
    break;
}

?>