const __APIURL = "https://javierpugliese.github.io/rallyarg-eurekalabs-api/api/rally-argentina.json";

function pretty(json) {
  return JSON.stringify(json, null, '  ');
}

function handleResponse(response) {
  return response.json()
    .then(json => {
      if (response.ok) return json;
      else return Promise.reject(json);
    })
}