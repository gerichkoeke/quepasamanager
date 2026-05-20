require("dotenv").config();
const axios = require("axios");

async function test() {
  try {
    const response = await axios.post("https://app.chatwoot.com/api/v1/accounts/1/inboxes", {
      name: "Test API Inbox",
      channel: {
        type: "api",
        webhook_url: "https://example.com/webhook"
      }
    }, {
      headers: {
        "api_access_token": "dummy" 
      }
    });
    console.log(response.status, response.data);
  } catch(e) {
    console.log("INBOXES API ERROR:", e.response ? e.response.status : e.message, e.response ? e.response.data : "");
  }

  try {
    const response = await axios.post("https://app.chatwoot.com/api/v1/accounts/1/channels/api_channels", {
      name: "Test API Inbox",
      webhook_url: "https://example.com/webhook"
    }, {
      headers: {
        "api_access_token": "dummy" 
      }
    });
    console.log(response.status, response.data);
  } catch(e) {
    console.log("API_CHANNELS API ERROR:", e.response ? e.response.status : e.message, e.response ? e.response.data : "");
  }
}
test();
