import axios from 'axios';
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
  } catch(e: any) {
    console.log("INBOXES API ERROR:", e.response ? e.response.status : e.message, e.response && e.response.data ? e.response.data : "");
  }
}
test();
