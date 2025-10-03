<?php
include "headers.php";

// Set timezone to Philippines
date_default_timezone_set('Asia/Manila');

class StudentImporter {
    

    
    function parseFullName($fullName) {
        $parts = explode(',', $fullName);
        $lastName = trim($parts[0] ?? '');
        
        if (count($parts) > 1) {
            $remaining = trim($parts[1]);
            $nameParts = explode(' ', $remaining);
            $firstName = trim($nameParts[0] ?? '');
            $middleName = trim(implode(' ', array_slice($nameParts, 1)) ?? '');
        } else {
            $nameParts = explode(' ', $fullName);
            $firstName = trim($nameParts[0] ?? '');
            $lastName = trim($nameParts[count($nameParts) - 1] ?? '');
            $middleName = count($nameParts) > 2 ? trim(implode(' ', array_slice($nameParts, 1, -1))) : '';
        }
        
        return [
            'firstName' => $firstName,
            'middleName' => $middleName,
            'lastName' => $lastName
        ];
    }
    
    function parseDate($dateString) {
        if (empty($dateString)) return null;
        
        try {
            $date = new DateTime($dateString);
            return $date->format('Y-m-d');
        } catch (Exception $e) {
            return null;
        }
    }
    
    function findSchoolYearId($conn, $schoolYear) {
        if (empty($schoolYear)) return null;
        
        try {
            $sql = "SELECT id FROM tblschoolyear WHERE year = :year";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':year', $schoolYear);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                return $result['id'];
            }
        } catch (Exception $e) {
            error_log("Error finding school year: " . $e->getMessage());
        }
        
        return null;
    }
}

// Get operation from multiple sources
$operation = $_GET['operation'] ?? $_POST['operation'] ?? '';

// Handle JSON input for savePreviewedStudents
$json = null;
if ($operation === 'savePreviewedStudents' || empty($operation)) {
    $input = file_get_contents('php://input');
    if (!empty($input)) {
        $json = json_decode($input, true);
        if ($json && isset($json['operation'])) {
            $operation = $json['operation'];
        }
    }
}

$importer = new StudentImporter();

// Handle savePreviewedStudents operation
if ($operation === 'savePreviewedStudents') {
    include "connection.php";
    
    $data = $json['data'] ?? [];
    $headers = $json['headers'] ?? [];
    $sectionId = $json['sectionId'] ?? '';
    $schoolYearId = $json['schoolYearId'] ?? '';
    $importUserId = $json['userId'] ?? '';
    $strandId = $json['strandId'] ?? '';
    $gradeLevelId = $json['gradeLevelId'] ?? '';
    
    if (empty($data) || empty($headers)) {
        echo json_encode([
            'success' => false,
            'error' => 'No data or headers provided'
        ]);
        exit;
    }
    
    if (empty($sectionId)) {
        echo json_encode([
            'success' => false,
            'error' => 'Section ID is required'
        ]);
        exit;
    }
    
    if (empty($schoolYearId)) {
        echo json_encode([
            'success' => false,
            'error' => 'School Year ID is required'
        ]);
        exit;
    }
    
    if (empty($importUserId)) {
        echo json_encode([
            'success' => false,
            'error' => 'User ID is required'
        ]);
        exit;
    }

    if (empty($strandId)) {
        echo json_encode([
            'success' => false,
            'error' => 'Strand ID is required'
        ]);
        exit;
    }
    if (empty($gradeLevelId)) {
        echo json_encode([
            'success' => false,
            'error' => 'Grade Level ID is required'
        ]);
        exit;
    }
    
    $importedCount = 0;
    $errors = [];
    
    // Helper function to find header value by partial match
    function findHeader($rowAssoc, $searchTerms) {
        foreach ($searchTerms as $term) {
            foreach ($rowAssoc as $key => $value) {
                if (strpos($key, strtoupper($term)) !== false) {
                    return $value;
                }
            }
        }
        return '';
    }
    
    try {
        $conn->beginTransaction();
        $defaultUserLevel = 4;
        
        // Default values for tblsfrecord
        $defaultFileName = 'SF-10-SHS-Senior-High-School-Student-Permanent-Record.xlsx';
        $defaultGradeLevelId = 1;
        
        // Use the selected school year ID directly
        $schoolYearId = $schoolYearId;
        
        foreach ($data as $rowIndex => $row) {
            // Map columns by header name (flexible)
            $rowAssoc = array();
            foreach ($headers as $i => $header) {
                $rowAssoc[strtoupper(trim($header))] = isset($row[$i]) ? trim($row[$i]) : '';
            }
            
            $lrn = findHeader($rowAssoc, ['LRN']);
            $fullName = findHeader($rowAssoc, ['NAME']);
            $birthDate = findHeader($rowAssoc, ['BIRTH DATE']);
            $age = findHeader($rowAssoc, ['AGE']);
            $religion = findHeader($rowAssoc, ['RELIGIOUS']);
            $completeAddress = findHeader($rowAssoc, ['HOUSE', 'ADDRESS']);
            $fatherName = findHeader($rowAssoc, ['FATHER']);
            $motherName = findHeader($rowAssoc, ['MOTHER']);
            $guardianName = findHeader($rowAssoc, ['GUARDIAN']);
            $relationship = findHeader($rowAssoc, ['RELATIONSHIP']);
            $emailFromCSV = findHeader($rowAssoc, ['EMAIL']);

            // Validate required fields
            if (empty($lrn) || empty($fullName)) {
                $errors[] = "Row " . ($rowIndex + 1) . ": LRN and Name are required";
                continue;
            }

            // Parse the full name into components
            $nameParts = $importer->parseFullName($fullName);
            $firstName = $nameParts['firstName'];
            $middleName = $nameParts['middleName'];
            $lastName = $nameParts['lastName'];

            // Set email to null if not provided in CSV, otherwise use the CSV value
            $email = (!empty($emailFromCSV)) ? $emailFromCSV : null;
            
            // Generate default password using lastName
            $defaultPassword = password_hash($lastName, PASSWORD_DEFAULT);
            
            // Generate fileName with student's last name
            $studentFileName = 'SF-10-SHS-Senior-High-School-Student-Permanent-Record' . '.xlsx';
            
            // Check if student already exists
            $checkSql = "SELECT id FROM tblstudent WHERE lrn = :lrn";
            $checkStmt = $conn->prepare($checkSql);
            $checkStmt->bindParam(':lrn', $lrn);
            $checkStmt->execute();

            $studentExists = $checkStmt->rowCount() > 0;
            $isUpdate = false;

            // Use selected grade level ID from UI instead of deriving from section
            $sectionGradeLevelId = $gradeLevelId;

            if ($studentExists) {
                // Update existing student - preserve existing email if present
                $sql = "UPDATE tblstudent SET
                    firstname = :firstname,
                    middlename = :middlename,
                    lastname = :lastname,
                    email = CASE WHEN email IS NOT NULL AND email != '' THEN email ELSE :email END,
                    birthDate = :birthDate,
                    age = :age,
                    religion = :religion,
                    completeAddress = :completeAddress,
                    fatherName = :fatherName,
                    motherName = :motherName,
                    guardianName = :guardianName,
                    guardianRelationship = :guardianRelationship,
                    sectionId = :sectionId,
                    schoolyearId = :schoolyearId,
                    strandId = :strandId,
                    gradeLevelId = :gradeLevelId
                    WHERE lrn = :lrn";

                $stmt = $conn->prepare($sql);
                $stmt->bindParam(':firstname', $firstName);
                $stmt->bindParam(':middlename', $middleName);
                $stmt->bindParam(':lastname', $lastName);
                $stmt->bindParam(':email', $email);
                $stmt->bindParam(':birthDate', $birthDate);
                $stmt->bindParam(':age', $age);
                $stmt->bindParam(':religion', $religion);
                $stmt->bindParam(':completeAddress', $completeAddress);
                $stmt->bindParam(':fatherName', $fatherName);
                $stmt->bindParam(':motherName', $motherName);
                $stmt->bindParam(':guardianName', $guardianName);
                $stmt->bindParam(':guardianRelationship', $relationship);
                $stmt->bindParam(':sectionId', $sectionId);
                $stmt->bindParam(':schoolyearId', $schoolYearId);
                $stmt->bindParam(':strandId', $strandId);
                $stmt->bindParam(':gradeLevelId', $sectionGradeLevelId);
                $stmt->bindParam(':lrn', $lrn);

                $isUpdate = true;
            } else {
                // Insert new student
                $sql = "INSERT INTO tblstudent (
                    id, firstname, middlename, lastname, lrn, email, password,
                    userLevel, birthDate, age, religion,
                    completeAddress, fatherName, motherName, guardianName,
                    guardianRelationship, sectionId, schoolyearId, strandId, gradeLevelId, createdAt
                ) VALUES (
                    :id, :firstname, :middlename, :lastname, :lrn, :email, :password,
                    :userLevel, :birthDate, :age, :religion,
                    :completeAddress, :fatherName, :motherName, :guardianName,
                    :guardianRelationship, :sectionId, :schoolyearId, :strandId, :gradeLevelId, NOW()
                )";

                $stmt = $conn->prepare($sql);
                $studentId = $lrn;
                $stmt->bindParam(':id', $studentId);
                $stmt->bindParam(':firstname', $firstName);
                $stmt->bindParam(':middlename', $middleName);
                $stmt->bindParam(':lastname', $lastName);
                $stmt->bindParam(':lrn', $lrn);
                $stmt->bindParam(':email', $email);
                $stmt->bindParam(':password', $defaultPassword);
                $stmt->bindParam(':userLevel', $defaultUserLevel);
                $stmt->bindParam(':birthDate', $birthDate);
                $stmt->bindParam(':age', $age);
                $stmt->bindParam(':religion', $religion);
                $stmt->bindParam(':completeAddress', $completeAddress);
                $stmt->bindParam(':fatherName', $fatherName);
                $stmt->bindParam(':motherName', $motherName);
                $stmt->bindParam(':guardianName', $guardianName);
                $stmt->bindParam(':guardianRelationship', $relationship);
                $stmt->bindParam(':sectionId', $sectionId);
                $stmt->bindParam(':schoolyearId', $schoolYearId);
                $stmt->bindParam(':strandId', $strandId);
                $stmt->bindParam(':gradeLevelId', $sectionGradeLevelId);
            }

            if ($stmt->execute()) {
                if (!$isUpdate) {
                    // Only create SF record for new students
                    $sfRecordSql = "INSERT INTO tblsfrecord (
                        fileName, studentId, gradeLevelId, userId, createdAt
                    ) VALUES (
                        :fileName, :studentId, :gradeLevelId, :userId, NOW()
                    )";

                    $sfRecordStmt = $conn->prepare($sfRecordSql);
                    $sfRecordStmt->bindParam(':fileName', $studentFileName);
                    $sfRecordStmt->bindParam(':studentId', $lrn);
                    $sfRecordStmt->bindParam(':gradeLevelId', $sectionGradeLevelId);
                    $sfRecordStmt->bindParam(':userId', $importUserId);

                    if (!$sfRecordStmt->execute()) {
                        $errors[] = "Row " . ($rowIndex + 1) . ": Student $fullName " . ($isUpdate ? "updated" : "inserted") . " but failed to create SF record";
                    }
                }

                $importedCount++;
                if ($isUpdate) {
                    $errors[] = "Row " . ($rowIndex + 1) . ": Student $fullName updated successfully";
                }
            } else {
                $errors[] = "Row " . ($rowIndex + 1) . ": Failed to " . ($isUpdate ? "update" : "insert") . " student $fullName";
            }
        }
        
        $conn->commit();
        
        // Get school year name for the response
        $schoolYearName = '';
        if ($schoolYearId) {
            try {
                $schoolYearSql = "SELECT year FROM tblschoolyear WHERE id = :id";
                $schoolYearStmt = $conn->prepare($schoolYearSql);
                $schoolYearStmt->bindParam(':id', $schoolYearId);
                $schoolYearStmt->execute();
                
                if ($schoolYearStmt->rowCount() > 0) {
                    $schoolYearResult = $schoolYearStmt->fetch(PDO::FETCH_ASSOC);
                    $schoolYearName = $schoolYearResult['year'];
                }
            } catch (Exception $e) {
                error_log("Error getting school year name: " . $e->getMessage());
            }
        }
        
        echo json_encode([
            'success' => true,
            'imported' => $importedCount,
            'errors' => $errors,
            'message' => "Successfully imported $importedCount students",
            'schoolYear' => $schoolYearName,
            'schoolYearId' => $schoolYearId
        ]);
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode([
            'success' => false,
            'error' => 'Import failed: ' . $e->getMessage()
        ]);
    }
    exit;
}

switch ($operation) {
    case "downloadTemplate":
        $importer->generateCSVTemplate();
        break;
    default:
        echo json_encode(['error' => 'Invalid operation']);
        http_response_code(400);
        break;
}
?> 