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
    console.error(e.response ? e.response.status : e.message, e.response ? e.response.data : "");
  }
}
test();
