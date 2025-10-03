<?php
// Email Configuration for MOGCHS Registrar Office
// Update these settings with your actual SMTP credentials

// SMTP Server Settings
define('SMTP_HOST', 'smtp.gmail.com'); // Your SMTP host
define('SMTP_PORT', 465); // SMTP port (587 for TLS, 465 for SSL)
define('SMTP_SECURE', 'ssl'); // 'tls' or 'ssl'

// Authentication
define('SMTP_USERNAME', 'ralp.pelino11@gmail.com'); // Your email address
define('SMTP_PASSWORD', 'esip bjyt ymrh yhoq'); // Your app password or email password

// Email Settings
define('FROM_EMAIL', 'noreply@mogchs.com'); // From email address
define('FROM_NAME', 'MOGCHS Registrar Office'); // From name

// Office Hours
define('OFFICE_HOURS', '8:00 AM - 5:00 PM (Monday to Friday)');

// Document Retention Policy
define('RETENTION_DAYS', 30); // Days before documents are disposed of

// Email Templates
define('EMAIL_SUBJECT_PREFIX', 'Document Release Schedule - ');

// Debug Mode (set to false in production)
define('EMAIL_DEBUG', false);
?>
