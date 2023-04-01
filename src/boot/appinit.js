import { boot } from "quasar/wrappers";
import { API, Auth } from "aws-amplify";
import Amplify from "@aws-amplify/core";
import awsconfig from "../aws-exports";
import { useAppStore } from "../stores/appstore.js";

Amplify.configure(awsconfig);
//if (awsconfig.aws_user_pools_id === "us-east-1_M7n6RNrq9") {
//}
// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ router } /* { app, router, ... } */) => {
  // something to do
  const appStore = useAppStore();
  await appStore.init();

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
