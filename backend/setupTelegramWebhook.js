/**
 * Script to set up Telegram webhook for production
 * Run this once after deploying to set the webhook URL
 */

require('dotenv').config();
const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BASE_URL = process.env.BASE_URL || 'https://expenses-mauve.vercel.app';
const WEBHOOK_URL = `${BASE_URL}/api/telegram/webhook`;

async function setupWebhook() {
    try {
        console.log('Setting up Telegram webhook...');
        console.log('Webhook URL:', WEBHOOK_URL);

        // Set the webhook
        const response = await axios.post(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
            {
                url: WEBHOOK_URL,
                allowed_updates: ['message'],
            }
        );

        if (response.data.ok) {
            console.log('✅ Webhook set successfully!');
            console.log('Response:', response.data);

            // Get webhook info to verify
            const infoResponse = await axios.get(
                `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`
            );

            console.log('\n📋 Current webhook info:');
            console.log(JSON.stringify(infoResponse.data.result, null, 2));
        } else {
            console.error('❌ Failed to set webhook');
            console.error('Response:', response.data);
        }
    } catch (error) {
        console.error('❌ Error setting webhook:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

async function deleteWebhook() {
    try {
        console.log('Deleting Telegram webhook...');

        const response = await axios.post(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`
        );

        if (response.data.ok) {
            console.log('✅ Webhook deleted successfully!');
        } else {
            console.error('❌ Failed to delete webhook');
        }
    } catch (error) {
        console.error('❌ Error deleting webhook:', error.message);
    }
}

async function getWebhookInfo() {
    try {
        const response = await axios.get(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`
        );

        console.log('📋 Current webhook info:');
        console.log(JSON.stringify(response.data.result, null, 2));
    } catch (error) {
        console.error('❌ Error getting webhook info:', error.message);
    }
}

// Parse command line arguments
const command = process.argv[2];

switch (command) {
    case 'set':
        setupWebhook();
        break;
    case 'delete':
        deleteWebhook();
        break;
    case 'info':
        getWebhookInfo();
        break;
    default:
        console.log('Usage:');
        console.log('  node setupTelegramWebhook.js set     - Set webhook');
        console.log('  node setupTelegramWebhook.js delete  - Delete webhook');
        console.log('  node setupTelegramWebhook.js info    - Get webhook info');
        break;
}
