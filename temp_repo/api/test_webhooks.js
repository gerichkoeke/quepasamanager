async function test() {
  try {
    const response = await fetch('https://app.chatwoot.com/api/v1/accounts/1/webhooks', {
      method: 'GET',
      headers: {
        'api_access_token': 'dummy'
      }
    });
    const data = await response.json();
    console.log(response.status, data);
  } catch (err) {
    console.log(err.message);
  }
}
test();
