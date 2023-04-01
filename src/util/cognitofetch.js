import { API, Auth } from "aws-amplify";

let cognitoToken = null;

export async function cognitoFetch(url, options) {
  return new Promise(async (resolve, reject) => {
    cognitoToken = (await Auth.currentSession()).getIdToken().getJwtToken();
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cognitoToken}`,
    };
    console.log(process.env.API_URL + url);
    const response = fetch(process.env.API_URL + url, {
      ...options,
      headers,
    })
      .then((response) => response.json())
      .then((data) => resolve(data));
  });
}
