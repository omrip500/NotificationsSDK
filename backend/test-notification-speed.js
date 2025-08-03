import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.notificationspanel.com';

/**
 * Test script to measure notification delivery speed
 * Usage: node test-notification-speed.js <appId> <title> <body>
 */
async function testNotificationSpeed() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('Usage: node test-notification-speed.js <appId> <title> <body>');
    console.log('Example: node test-notification-speed.js 507f1f77bcf86cd799439011 "Test" "Speed test notification"');
    process.exit(1);
  }

  const [appId, title, body] = args;
  
  console.log('🚀 Starting notification speed test...');
  console.log(`📱 App ID: ${appId}`);
  console.log(`📝 Title: ${title}`);
  console.log(`📄 Body: ${body}`);
  console.log(`🌐 API URL: ${API_BASE_URL}`);
  console.log('');

  const startTime = Date.now();
  console.log(`⏰ Send time: ${new Date(startTime).toISOString()}`);

  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        body,
        appId,
        filters: {}
      })
    });

    const endTime = Date.now();
    const serverProcessingTime = endTime - startTime;

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Server response received in: ${serverProcessingTime}ms`);
      console.log(`📊 Result:`, result);
      console.log('');
      console.log('📱 Now check your device for the notification arrival time');
      console.log('⏱️  Compare the device receive time with the send time above');
      console.log('🔍 Check the device logs for delivery delay information');
    } else {
      console.error(`❌ Server error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`❌ Error details: ${errorText}`);
    }
  } catch (error) {
    console.error(`❌ Network error:`, error.message);
  }
}

testNotificationSpeed();
