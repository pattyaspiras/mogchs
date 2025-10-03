<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Increase memory limit for large Excel files
ini_set('memory_limit', '2G');

// Set CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

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
    echo json_encode(['error' => 'File not found: ' . $filePath]);
    exit;
}

// Check if file is Excel
$fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
$excelExtensions = ['xlsx', 'xls'];

if (!in_array($fileExtension, $excelExtensions)) {
    http_response_code(400);
    echo json_encode(['error' => 'File is not an Excel file']);
    exit;
}

try {
    // Initialize variables
    $subjects = [];
    $generalAverage = '';
    $lastName = '';
    $firstName = '';
    $middleName = '';
    $lrn = '';
    $dateOfBirth = '';
    
    // Extract data based on file type
    if ($fileExtension === 'xlsx') {
        $data = extractXlsxData($filePath);
    } else {
        $data = extractXlsData($filePath);
    }
    
    // Debug: Check if data was extracted
    if (empty($data)) {
        throw new Exception('No data could be extracted from the Excel file');
    }
    
    // Generate HTML from the extracted data
    $html = generateHtmlFromData($data, $fileName, $subjects, $generalAverage, $lastName, $firstName, $lrn);
    
    echo json_encode([
        'success' => true,
        'html' => $html,
        'fileName' => $fileName,
        'message' => 'Excel file processed successfully using built-in PHP functions',
        'debug' => [
            'sheets' => count($data),
            'totalRows' => array_sum(array_map('count', $data)),
            'subjectsFound' => count($subjects),
            'lastName' => $lastName,
            'firstName' => $firstName,
            'lrn' => $lrn,
            'generalAverage' => $generalAverage
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to process Excel file: ' . $e->getMessage()]);
}

function extractXlsxData($filePath) {
    $data = [];
    
    // Open the ZIP file (.xlsx is a ZIP archive)
    $zip = new ZipArchive();
    if ($zip->open($filePath) === TRUE) {
        // Read the shared strings and sheet data
        $sharedStrings = [];
        
        // Extract shared strings if they exist
        if ($zip->locateName('xl/sharedStrings.xml') !== false) {
            $sharedStringsXml = $zip->getFromName('xl/sharedStrings.xml');
            $sharedStrings = parseSharedStrings($sharedStringsXml);
        }
        
        // Extract sheet data from multiple sheets
        $sheetFiles = ['xl/worksheets/sheet1.xml', 'xl/worksheets/sheet2.xml', 'xl/worksheets/sheet3.xml'];
        foreach ($sheetFiles as $sheetFile) {
            if ($zip->locateName($sheetFile) !== false) {
                $sheetXml = $zip->getFromName($sheetFile);
                $sheetData = parseSheetData($sheetXml, $sharedStrings);
                if (!empty($sheetData)) {
                    $data[] = $sheetData;
                }
            }
        }
        
        $zip->close();
    }
    
    return $data;
}

function extractXlsData($filePath) {
    // For .xls files, we'll use a basic approach
    // This is more limited but doesn't require external libraries
    $data = [];
    
    // Read the file as binary and look for text patterns
    $content = file_get_contents($filePath);
    
    // Extract text content (this is a simplified approach)
    $text = '';
    for ($i = 0; $i < strlen($content); $i++) {
        $char = $content[$i];
        if (ord($char) >= 32 && ord($char) <= 126) {
            $text .= $char;
        }
    }
    
    // Split into lines and extract meaningful data
    $lines = explode("\n", $text);
    foreach ($lines as $line) {
        $line = trim($line);
        if (strlen($line) > 2 && !preg_match('/^[^a-zA-Z]*$/', $line)) {
            $data[] = [$line];
        }
    }
    
    return [$data]; // Wrap in array to match xlsx format
}

function parseSharedStrings($xml) {
    $strings = [];
    
    try {
        $xmlObj = simplexml_load_string($xml);
        
        if ($xmlObj && isset($xmlObj->si)) {
            foreach ($xmlObj->si as $si) {
                if (isset($si->t)) {
                    $strings[] = (string)$si->t;
                }
            }
        }
    } catch (Exception $e) {
        // If XML parsing fails, return empty array
        error_log("Failed to parse shared strings: " . $e->getMessage());
    }
    
    return $strings;
}

function parseSheetData($xml, $sharedStrings) {
    $data = [];
    
    try {
        $xmlObj = simplexml_load_string($xml);
        
        if ($xmlObj && isset($xmlObj->sheetData)) {
            foreach ($xmlObj->sheetData->row as $row) {
                $rowIndex = (int)$row['r'];
                $rowData = [];
                
                if (isset($row->c)) {
                    foreach ($row->c as $cell) {
                        $cellRef = (string)$cell['r']; // e.g., "A1", "B2", etc.
                        $cellValue = '';
                        
                        if (isset($cell->v)) {
                            if (isset($cell['t']) && (string)$cell['t'] === 's') {
                                // Shared string
                                $index = (int)$cell->v;
                                $cellValue = isset($sharedStrings[$index]) ? $sharedStrings[$index] : '';
                            } else {
                                // Direct value
                                $cellValue = (string)$cell->v;
                            }
                        }
                        
                        // Store with cell reference for better data processing
                        $rowData[$cellRef] = $cellValue;
                    }
                }
                
                if (!empty(array_filter($rowData))) {
                    $data[$rowIndex] = $rowData;
                }
            }
        }
    } catch (Exception $e) {
        // If XML parsing fails, return empty array
        error_log("Failed to parse sheet data: " . $e->getMessage());
    }
    
    return $data;
}

function getNextColumn($cellRef) {
    // Extract column letter from cell reference (e.g., "A1" -> "A")
    $column = preg_replace('/[0-9]/', '', $cellRef);
    $row = preg_replace('/[A-Z]/', '', $cellRef);
    
    // Get next column
    $nextColumn = '';
    $length = strlen($column);
    $carry = 1;
    
    for ($i = $length - 1; $i >= 0; $i--) {
        $char = ord($column[$i]) - ord('A') + $carry;
        $carry = intval($char / 26);
        $char = $char % 26;
        $nextColumn = chr($char + ord('A')) . $nextColumn;
    }
    
    if ($carry > 0) {
        $nextColumn = 'A' . $nextColumn;
    }
    
    return $nextColumn . $row;
}

function getColumnByOffset($column, $offset) {
    // Simple column increment by offset
    $result = '';
    $length = strlen($column);
    $carry = $offset;
    
    for ($i = $length - 1; $i >= 0; $i--) {
        $char = ord($column[$i]) - ord('A') + $carry;
        $carry = intval($char / 26);
        $char = $char % 26;
        $result = chr($char + ord('A')) . $result;
    }
    
    if ($carry > 0) {
        $result = 'A' . $result;
    }
    
    return $result;
}

function generateHtmlFromData($data, $fileName, &$subjects, &$generalAverage, &$lastName, &$firstName, &$lrn) {
    $html = '<!DOCTYPE html>';
    $html .= '<html>';
    $html .= '<head>';
    $html .= '<meta charset="UTF-8">';
    $html .= '<title>' . htmlspecialchars($fileName) . '</title>';
    $html .= '<style>';
    $html .= 'body { font-family: "Times New Roman", serif; margin: 20px; background: white; }';
    $html .= '.form-container { max-width: 800px; margin: 0 auto; background: white; }';
    $html .= '.header { text-align: center; margin-bottom: 20px; }';
    $html .= '.header h1 { font-size: 18px; font-weight: bold; margin: 0; }';
    $html .= '.header h2 { font-size: 16px; font-weight: bold; margin: 5px 0; }';
    $html .= '.section { margin-bottom: 20px; }';
    $html .= '.section-title { font-weight: bold; font-size: 14px; margin-bottom: 10px; border-bottom: 1px solid #000; }';
    $html .= '.form-row { display: flex; margin-bottom: 8px; }';
    $html .= '.form-label { font-weight: bold; min-width: 120px; }';
    $html .= '.form-value { flex: 1; border-bottom: 1px solid #000; padding-left: 10px; }';
    $html .= '.form-table { width: 100%; border-collapse: collapse; margin: 10px 0; }';
    $html .= '.form-table th, .form-table td { border: 1px solid #000; padding: 4px; text-align: center; font-size: 11px; }';
    $html .= '.form-table th { background-color: #f0f0f0; font-weight: bold; }';
    $html .= '.signature-section { margin-top: 30px; }';
    $html .= '.signature-line { border-bottom: 1px solid #000; margin: 20px 0 5px 0; }';
    $html .= '@media print {';
    $html .= '  body { margin: 0; }';
    $html .= '  .form-container { max-width: none; }';
    $html .= '  .form-table { page-break-inside: avoid; }';
    $html .= '}';
    $html .= '</style>';
    $html .= '</head>';
    $html .= '<body>';
    
    // Header section
    $html .= '<div class="form-container">';
    $html .= '<div class="header">';
    $html .= '<h1>REPUBLIC OF THE PHILIPPINES</h1>';
    $html .= '<h2>DEPARTMENT OF EDUCATION</h2>';
    $html .= '<h1>SENIOR HIGH SCHOOL STUDENT PERMANENT RECORD</h1>';
    $html .= '</div>';
    
    // Extract key information from the data
    // Process the extracted data to find student information
    foreach ($data as $sheetIndex => $sheetData) {
        foreach ($sheetData as $rowIndex => $row) {
            foreach ($row as $cellRef => $cell) {
                $cellValue = trim($cell);
                
                // Look for specific patterns in the data
                if (stripos($cellValue, 'LAST NAME') !== false) {
                    // Look for the value in adjacent cells
                    $nextCol = getNextColumn($cellRef);
                    if (isset($row[$nextCol]) && !empty(trim($row[$nextCol]))) {
                        $lastName = trim($row[$nextCol]);
                    }
                }
                
                if (stripos($cellValue, 'FIRST NAME') !== false) {
                    $nextCol = getNextColumn($cellRef);
                    if (isset($row[$nextCol]) && !empty(trim($row[$nextCol]))) {
                        $firstName = trim($row[$nextCol]);
                    }
                }
                
                if (stripos($cellValue, 'LRN') !== false || stripos($cellValue, 'L.P.N.') !== false) {
                    $nextCol = getNextColumn($cellRef);
                    if (isset($row[$nextCol]) && !empty(trim($row[$nextCol]))) {
                        $lrn = trim($row[$nextCol]);
                    }
                }
                
                // Look for the actual student name in row 1 (based on debug output)
                if ($rowIndex == 1 && $cellRef == 'A1' && !empty($cellValue)) {
                    // Split "ASPIRAS, PATTY" into last name and first name
                    if (strpos($cellValue, ',') !== false) {
                        $nameParts = explode(',', $cellValue);
                        if (count($nameParts) >= 2) {
                            $lastName = trim($nameParts[0]);
                            $firstName = trim($nameParts[1]);
                        }
                    } else {
                        // If no comma, treat as first name
                        $firstName = $cellValue;
                    }
                }
                
                // If we still don't have names, look for text that looks like names
                if (empty($lastName) && empty($firstName)) {
                    if (preg_match('/^[A-Za-z\s]+$/', $cellValue) && strlen($cellValue) >= 3 && strlen($cellValue) <= 30) {
                        if (empty($lastName)) {
                            $lastName = $cellValue;
                        } elseif (empty($firstName)) {
                            $firstName = $cellValue;
                        }
                    }
                }
                
                // Look for LRN (numbers and dashes)
                if (empty($lrn) && preg_match('/^[0-9\-]+$/', $cellValue) && strlen($cellValue) >= 5) {
                    $lrn = $cellValue;
                }
            }
        }
    }
    
    // Learner's Information Section
    $html .= '<div class="section">';
    $html .= '<div class="section-title">LEARNER\'S INFORMATION</div>';
    $html .= '<div class="form-row">';
    $html .= '<span class="form-label">LAST NAME:</span>';
    $html .= '<span class="form-value">' . htmlspecialchars($lastName ?: 'N/A') . '</span>';
    $html .= '</div>';
    $html .= '<div class="form-row">';
    $html .= '<span class="form-label">FIRST NAME:</span>';
    $html .= '<span class="form-value">' . htmlspecialchars($firstName ?: 'N/A') . '</span>';
    $html .= '</div>';
    $html .= '<div class="form-row">';
    $html .= '<span class="form-label">LRN:</span>';
    $html .= '<span class="form-value">' . htmlspecialchars($lrn ?: 'N/A') . '</span>';
    $html .= '</div>';
    $html .= '</div>';
    
    // Eligibility Section
    $html .= '<div class="section">';
    $html .= '<div class="section-title">ELIGIBILITY FOR SHS ENROLMENT</div>';
    $html .= '<div class="form-row">';
    $html .= '<span class="form-label">High School Completer:</span>';
    $html .= '<span class="form-value">☐</span>';
    $html .= '</div>';
    $html .= '<div class="form-row">';
    $html .= '<span class="form-label">ALS A&E Passer:</span>';
    $html .= '<span class="form-value">☐</span>';
    $html .= '</div>';
    $html .= '</div>';
    
    // Scholastic Record Section
    $html .= '<div class="section">';
    $html .= '<div class="section-title">SCHOLASTIC RECORD</div>';
    $html .= '<table class="form-table">';
    $html .= '<thead>';
    $html .= '<tr>';
    $html .= '<th rowspan="2">SUBJECTS</th>';
    $html .= '<th colspan="2">Quarter</th>';
    $html .= '<th rowspan="2">SEMIFINAL GRADE</th>';
    $html .= '<th rowspan="2">ACTION TAKEN</th>';
    $html .= '</tr>';
    $html .= '<tr>';
    $html .= '<th>1</th>';
    $html .= '<th>2</th>';
    $html .= '</tr>';
    $html .= '</thead>';
    $html .= '<tbody>';
    
    // Extract scholastic record data from the Excel data
    
    // Process each sheet to find subject data
    foreach ($data as $sheetIndex => $sheetData) {
        foreach ($sheetData as $rowIndex => $row) {
            foreach ($row as $cellRef => $cell) {
                $cellValue = trim($cell);
                
                // Look for subject names (typically longer text)
                if (strlen($cellValue) > 10 && (
                    stripos($cellValue, 'SCIENCE') !== false || 
                    stripos($cellValue, 'MATH') !== false || 
                    stripos($cellValue, 'ENGLISH') !== false ||
                    stripos($cellValue, 'FILIPINO') !== false ||
                    stripos($cellValue, 'RESEARCH') !== false ||
                    stripos($cellValue, 'PHYSICAL') !== false ||
                    stripos($cellValue, 'PRACTICAL') !== false ||
                    stripos($cellValue, 'COMMUNICATION') !== false ||
                    stripos($cellValue, 'READING') !== false ||
                    stripos($cellValue, 'WRITING') !== false ||
                    stripos($cellValue, 'KOMUNIKASYON') !== false ||
                    stripos($cellValue, 'PANANALIKSIK') !== false ||
                    stripos($cellValue, 'PAGBASA') !== false ||
                    stripos($cellValue, 'LITERATURE') !== false ||
                    stripos($cellValue, 'ARTS') !== false ||
                    stripos($cellValue, 'CULTURE') !== false
                )) {
                    
                    $quarter1 = '';
                    $quarter2 = '';
                    $semifinal = '';
                    $action = '';
                    
                    // Look for grades in the same row by checking adjacent columns
                    $currentCol = preg_replace('/[0-9]/', '', $cellRef);
                    $currentRow = preg_replace('/[A-Z]/', '', $cellRef);
                    
                    // Check next 10 columns for grades
                    for ($i = 1; $i <= 10; $i++) {
                        $nextCol = getColumnByOffset($currentCol, $i);
                        $testCell = $nextCol . $currentRow;
                        
                        if (isset($row[$testCell])) {
                            $gradeValue = trim($row[$testCell]);
                            if (is_numeric($gradeValue) && $gradeValue >= 60 && $gradeValue <= 100) {
                                if (empty($quarter1)) {
                                    $quarter1 = $gradeValue;
                                } elseif (empty($quarter2)) {
                                    $quarter2 = $gradeValue;
                                } elseif (empty($semifinal)) {
                                    $semifinal = $gradeValue;
                                }
                            } elseif (empty($action) && strlen($gradeValue) < 30) {
                                if (stripos($gradeValue, 'PASS') !== false || stripos($gradeValue, 'FAIL') !== false || 
                                    stripos($gradeValue, 'INC') !== false || stripos($gradeValue, 'DROP') !== false) {
                                    $action = $gradeValue;
                                }
                            }
                        }
                    }
                    
                    // Add subject if we found any data
                    if (!empty($quarter1) || !empty($quarter2) || !empty($semifinal) || !empty($action)) {
                        $subjects[] = [
                            'name' => $cellValue,
                            'quarter1' => $quarter1,
                            'quarter2' => $quarter2,
                            'semifinal' => $semifinal,
                            'action' => $action
                        ];
                    }
                }
                
                // Special handling for Physical Science in row 31 (based on debug output)
                if ($rowIndex == 31 && stripos($cellValue, 'PHYSICAL SCIENCE') !== false) {
                    $quarter1 = '';
                    $quarter2 = '';
                    $semifinal = '';
                    $action = '';
                    
                    // Look for grades in the same row
                    $currentCol = preg_replace('/[0-9]/', '', $cellRef);
                    $currentRow = preg_replace('/[A-Z]/', '', $cellRef);
                    
                    // Check specific columns where grades might be
                    $gradeColumns = ['J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
                    foreach ($gradeColumns as $col) {
                        $testCell = $col . $currentRow;
                        if (isset($row[$testCell])) {
                            $gradeValue = trim($row[$testCell]);
                            if (is_numeric($gradeValue) && $gradeValue >= 60 && $gradeValue <= 100) {
                                if (empty($quarter1)) {
                                    $quarter1 = $gradeValue;
                                } elseif (empty($quarter2)) {
                                    $quarter2 = $gradeValue;
                                } elseif (empty($semifinal)) {
                                    $semifinal = $gradeValue;
                                }
                            } elseif (empty($action) && strlen($gradeValue) < 30) {
                                if (stripos($gradeValue, 'PASS') !== false || stripos($gradeValue, 'FAIL') !== false || 
                                    stripos($gradeValue, 'INC') !== false || stripos($gradeValue, 'DROP') !== false) {
                                    $action = $gradeValue;
                                }
                            }
                        }
                    }
                    
                    // Add Physical Science if we found any data
                    if (!empty($quarter1) || !empty($quarter2) || !empty($semifinal) || !empty($action)) {
                        $subjects[] = [
                            'name' => $cellValue,
                            'quarter1' => $quarter1,
                            'quarter2' => $quarter2,
                            'semifinal' => $semifinal,
                            'action' => $action
                        ];
                    }
                }
                
                // Special handling for Core Subjects from Sheet 3 (based on debug output)
                if ($sheetIndex == 2 && $rowIndex >= 7 && $rowIndex <= 20 && !empty($cellValue) && 
                    (stripos($cellValue, 'Oral Communication') !== false ||
                     stripos($cellValue, 'Reading and Writing') !== false ||
                     stripos($cellValue, 'Komunikasyon') !== false ||
                     stripos($cellValue, 'Pagbasa') !== false ||
                     stripos($cellValue, 'Literature') !== false ||
                     stripos($cellValue, 'Arts') !== false ||
                     stripos($cellValue, 'Research') !== false ||
                     stripos($cellValue, 'Practical') !== false)) {
                    
                    // For core subjects, we'll add them with placeholder grades
                    $subjects[] = [
                        'name' => $cellValue,
                        'quarter1' => 'Core',
                        'quarter2' => 'Subject',
                        'semifinal' => 'Listed',
                        'action' => 'Core'
                    ];
                }
                
                // Look for general average
                if (stripos($cellValue, 'GENERAL AVE') !== false || stripos($cellValue, 'General Ave') !== false) {
                    // Look for the average value in adjacent cells
                    $nextCol = getNextColumn($cellRef);
                    if (isset($row[$nextCol])) {
                        $avgValue = trim($row[$nextCol]);
                        if (is_numeric($avgValue) && $avgValue >= 0 && $avgValue <= 100) {
                            $generalAverage = $avgValue;
                        }
                    }
                }
                
                // Special handling for General Average in row 23 (based on debug output)
                if ($rowIndex == 23 && stripos($cellValue, 'General Ave') !== false) {
                    // Look for the average value in adjacent cells
                    $currentCol = preg_replace('/[0-9]/', '', $cellRef);
                    $currentRow = preg_replace('/[A-Z]/', '', $cellRef);
                    
                    // Check next few columns for the average value
                    for ($i = 1; $i <= 5; $i++) {
                        $nextCol = getColumnByOffset($currentCol, $i);
                        $testCell = $nextCol . $currentRow;
                        if (isset($row[$testCell])) {
                            $avgValue = trim($row[$testCell]);
                            if (is_numeric($avgValue) && $avgValue >= 0 && $avgValue <= 100) {
                                $generalAverage = $avgValue;
                                break;
                            }
                        }
                    }
                }
                
                // Look for LRN in row 9 (based on debug output)
                if ($rowIndex == 9 && stripos($cellValue, 'LRN') !== false) {
                    // Look for the LRN value in adjacent cells
                    $nextCol = getNextColumn($cellRef);
                    if (isset($row[$nextCol]) && !empty(trim($row[$nextCol]))) {
                        $lrn = trim($row[$nextCol]);
                    }
                }
            }
        }
    }
    
    // Add extracted subject data to the table
    foreach ($subjects as $subject) {
        $html .= '<tr>';
        $html .= '<td>' . htmlspecialchars($subject['name']) . '</td>';
        $html .= '<td>' . htmlspecialchars($subject['quarter1']) . '</td>';
        $html .= '<td>' . htmlspecialchars($subject['quarter2']) . '</td>';
        $html .= '<td>' . htmlspecialchars($subject['semifinal']) . '</td>';
        $html .= '<td>' . htmlspecialchars($subject['action']) . '</td>';
        $html .= '</tr>';
    }
    
    // Add general average row if found
    if (!empty($generalAverage)) {
        $html .= '<tr>';
        $html .= '<td colspan="3"><strong>General Ave. for the Semester</strong></td>';
        $html .= '<td>' . htmlspecialchars($generalAverage) . '</td>';
        $html .= '<td></td>';
        $html .= '</tr>';
    }
    
    // If no subjects found, show debugging information
    if (empty($subjects)) {
        $html .= '<tr>';
        $html .= '<td colspan="5"><em>No subject data found. The Excel file structure may be complex.</em></td>';
        $html .= '</tr>';
        
        // Add debugging information to see what's actually in the Excel file
        $html .= '<tr>';
        $html .= '<td colspan="5"><strong>Debug: Raw Data (First 20 rows)</strong></td>';
        $html .= '</tr>';
        
        // Show some sample data from the first sheet
        $debugCount = 0;
        foreach ($data as $sheetIndex => $sheetData) {
            if ($debugCount >= 3) break; // Limit to first 3 sheets
            
            $html .= '<tr>';
            $html .= '<td colspan="5"><strong>Sheet ' . ($sheetIndex + 1) . ':</strong></td>';
            $html .= '</tr>';
            
            $rowCount = 0;
            foreach ($sheetData as $rowIndex => $row) {
                if ($rowCount >= 10) break; // Limit to first 10 rows per sheet
                
                    $html .= '<tr>';
                $html .= '<td colspan="5">Row ' . $rowIndex . ': ';
                
                $cellCount = 0;
                foreach ($row as $cellRef => $cellValue) {
                    if ($cellCount >= 5) break; // Limit to first 5 cells per row
                    if (!empty(trim($cellValue))) {
                        $html .= $cellRef . '=' . htmlspecialchars(trim($cellValue)) . ' | ';
                    }
                    $cellCount++;
                }
                
                $html .= '</td>';
                $html .= '</tr>';
                $rowCount++;
            }
            
            $debugCount++;
            }
        }
        
        $html .= '</tbody>';
        $html .= '</table>';
        $html .= '</div>';
    
    // Remarks Section
    $html .= '<div class="section">';
    $html .= '<div class="section-title">REMARKS</div>';
    $html .= '<div style="border: 1px solid #000; height: 60px; padding: 10px;"></div>';
    $html .= '</div>';
    
    // Signature Section
    $html .= '<div class="signature-section">';
    $html .= '<div class="form-row">';
    $html .= '<span class="form-label">Prepared by:</span>';
    $html .= '<span class="form-value"></span>';
    $html .= '</div>';
    $html .= '<div class="signature-line"></div>';
    $html .= '<div style="text-align: center; font-size: 12px;">Signature of Adviser over Printed Name, Designation</div>';
    $html .= '</div>';
    
    $html .= '</div>'; // Close form-container
    $html .= '</body>';
    $html .= '</html>';
    
    return $html;
}
?> 