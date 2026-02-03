@echo off
REM Telegram Bot Webhook Setup Script for Windows
REM This script helps you set up the Telegram webhook for your bot

echo.
echo 🤖 Telegram Bot Webhook Setup
echo ================================
echo.

REM Check if .env exists
if not exist "backend\.env" (
    echo ❌ Error: backend\.env file not found!
    echo Please create the .env file first.
    pause
    exit /b 1
)

REM Note: This is a simplified version. You'll need to manually extract values from .env
echo Please enter your configuration:
echo.

set /p BOT_TOKEN="Enter your TELEGRAM_BOT_TOKEN: "
set /p BASE_URL="Enter your BASE_URL (e.g., http://localhost:5000): "

if "%BOT_TOKEN%"=="" (
    echo ❌ Error: Bot token cannot be empty
    pause
    exit /b 1
)

if "%BASE_URL%"=="" (
    echo ❌ Error: Base URL cannot be empty
    pause
    exit /b 1
)

echo.
echo ✅ Configuration:
echo    Base URL: %BASE_URL%
echo.

REM Construct webhook URL
set WEBHOOK_URL=%BASE_URL%/api/telegram/webhook

echo 🔗 Setting webhook to: %WEBHOOK_URL%
echo.

REM Set webhook using curl (requires curl to be installed)
curl -X POST "https://api.telegram.org/bot%BOT_TOKEN%/setWebhook" -d "url=%WEBHOOK_URL%" -d "allowed_updates=[\"message\"]"

echo.
echo.
echo 📊 Getting webhook info...
curl "https://api.telegram.org/bot%BOT_TOKEN%/getWebhookInfo"

echo.
echo.
echo ✅ Setup complete! You can now:
echo    1. Send /start to your bot in Telegram
echo    2. Go to Profile page in the app
echo    3. Link your Telegram account
echo.

pause
