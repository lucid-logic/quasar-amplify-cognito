import { boot } from "quasar/wrappers";
import { API, Auth } from "aws-amplify";
import Amplify from "@aws-amplify/core";
import { useAppStore } from "../stores/appstore.js";

import awsConfig from "../aws-exports.js";
// Assuming you have two redirect URIs, and the first is for localhost and second is for production
const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === "[::1]" ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);
console.log("isLocalhost", isLocalhost);
const [localRedirectSignIn, productionRedirectSignIn] =
  awsConfig.oauth.redirectSignIn.split(",");

const [localRedirectSignOut, productionRedirectSignOut] =
  awsConfig.oauth.redirectSignOut.split(",");

const updatedAwsConfig = {
  ...awsConfig,
  oauth: {
    ...awsConfig.oauth,
    redirectSignIn: isLocalhost
      ? localRedirectSignIn
      : productionRedirectSignIn,
    redirectSignOut: isLocalhost
      ? localRedirectSignOut
      : productionRedirectSignOut,
  },
};

Amplify.configure(updatedAwsConfig);

//Amplify.configure(awsconfig);
//if (awsconfig.aws_user_pools_id === "us-east-1_M7n6RNrq9") {
//}
// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ router } /* { app, router, ... } */) => {
  // something to do
  const appStore = useAppStore();
  try {
    const user = await Auth.currentUserPoolUser();

    await appStore.init();
  } catch (e) {}

  router.beforeEach(async function (to, from, next) {
    //        if(localStorage.llat){
    var loggedIn = false;
    try {
      const user = await Auth.currentUserPoolUser();
      loggedIn = user && user.username;
    } catch (e) {
      loggedIn = false;
    }
    appStore.loggedIn = loggedIn;
    if ((to.meta.homePage || to.meta.authPage) && loggedIn) {
      next("/dashboard");
      return;
    }

    if (to.meta.requiresAuth && !loggedIn) {
      next("/auth");
      return;
    }
    if (to.meta.requiresNoAuth && loggedIn) {
      next("/");
      return;
    }
    next();
  });
});
