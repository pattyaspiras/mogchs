# Password Reset Setup Guide

## Overview

This implementation adds password reset functionality with OTP email verification for users whose passwords are still their lastname (default password).

## Features

- ✅ Detects when user's password is still their lastname
- ✅ Sends 6-digit OTP via email using PHPMailer
- ✅ In-memory OTP storage (fast and simple)
- ✅ 10-minute OTP expiry
- ✅ Password validation (minimum 8 characters, cannot be lastname)
- ✅ Secure password hashing

## Setup Instructions

### 1. Install PHPMailer

Navigate to the `backend` directory and run:

```bash
composer install
```

### 2. Configure Email Settings

The email settings are already configured in `backend/admin.php`:

- SMTP Host: smtp.gmail.com
- SMTP Port: 465
- Username: ralp.pelino11@gmail.com
- Password: esip bjyt ymrh yhoq
- From: noreply@mogchs.com

### 3. How It Works

#### Login Flow:

1. User enters username and password
2. System checks if password matches their lastname (case-insensitive)
3. If password is still lastname, user is redirected to password reset
4. OTP is automatically sent to user's email
5. User enters 6-digit OTP
6. User creates new password (minimum 8 characters, cannot be lastname)
7. Password is updated and user can login normally

#### OTP Storage:

- Uses in-memory PHP array instead of database
- Much faster than database queries
- Automatically cleans up expired OTPs
- OTPs expire after 10 minutes

#### Security Features:

- 6-digit numeric OTP
- 10-minute expiry
- One-time use (marked as used after verification)
- Password validation prevents using lastname as password
- Secure password hashing with `password_hash()`

## Files Modified/Created

### Backend Files:

- `backend/admin.php` - Added password reset functions
- `backend/composer.json` - PHPMailer dependency

### Frontend Files:

- `src/components/PasswordReset.jsx` - Password reset UI component
- `src/utils/admin.js` - Added password reset API functions
- `src/pages/Login.jsx` - Updated to handle password reset flow

## Testing

1. Create a user with password set to their lastname
2. Try to login with that user
3. System should detect password reset requirement
4. Check email for OTP
5. Enter OTP and create new password
6. Login should work with new password

## Notes

- The OTP storage is in-memory, so OTPs will be lost if the server restarts
- For production, consider using Redis or similar for OTP storage
- Email settings are configured for Gmail SMTP
- Make sure the Gmail account has "Less secure app access" enabled or use App Passwords
