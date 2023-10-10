import { boot } from "quasar/wrappers";
import { API, Auth } from "aws-amplify";
import Amplify from "@aws-amplify/core";
import { useAppStore } from "../stores/AppStore.js";
import { App, URLOpenListenerEvent } from "@capacitor/app";
import { Platform } from "quasar";

import awsConfig from "../aws-exports.js";
// import LogRocket from "logrocket";
// console.log("Init LogRocket");
// LogRocket.init("iyw17r/frunning");
import { StatusBar, Style } from "@capacitor/status-bar";
if (Platform.is.capacitor) {
  StatusBar.setBackgroundColor({ color: "#1976D2" });
}

const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === "[::1]" ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname === "192.168.10.20" ||
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

var [localRedirectSignIn, productionRedirectSignIn] =
  awsConfig.oauth.redirectSignIn.split(",");

var [localRedirectSignOut, productionRedirectSignOut] =
  awsConfig.oauth.redirectSignOut.split(",");

if (window.location.hostname.startsWith("app-dev.")) {
  productionRedirectSignIn = productionRedirectSignIn.replace(
    "app.",
    "app-dev."
  );
  productionRedirectSignOut = productionRedirectSignOut.replace(
    "app.",
    "app-dev."
  );
}

const updatedAwsConfig = {
  ...awsConfig,
  oauth: {
    ...awsConfig.oauth,
    redirectSignIn: isLocalhost //&& !$q.platform.is.capacitor
      ? localRedirectSignIn
      : productionRedirectSignIn,
    redirectSignOut: isLocalhost //&& !$q.platform.is.capacitor
      ? localRedirectSignOut
      : productionRedirectSignOut,
  },
};

Amplify.configure(updatedAwsConfig);

const appStore = useAppStore();

export default boot(async ({ router, app } /* { app, router, ... } */) => {
  // something to do
  var initalInitPerformed = false;
  const appStore = useAppStore();
  App.addListener("appUrlOpen", (event) => {
    const slug = event.url.split(".run").pop();
    // We only push to the route if there is a slug present

    const query = {};
    if (event.url.split("?").length > 1) {
      const urlParams = new URLSearchParams(event.url.split("?")[1]);
      appStore.logMessage("URL is: " + JSON.stringify(event.url.split("?")[1]));
      urlParams.forEach((value, key) => {
        query[key] = value;
        appStore.logMessage(`key=${key}, value=${value}`);
      });
    }

    if (slug) {
      router.push({
        path: slug,
        query: query,
      });
    } else {
      router.push("/test/slugfail");
    }
  });

  try {
    await Auth.currentUserPoolUser();

    await appStore.checkSynchUpdate(true);
    initalInitPerformed = true;
  } catch (e) {
    console.log(e);
    if (e == 403) {
      await Auth.signOut();
    }
  }

  router.beforeEach(async function (to, from, next) {
    appStore.checkSynchUpdate();
    if (to.meta.requiresSetup && appStore.loading && initalInitPerformed) {
      try {
        appStore.init();
      } catch (e) {
        console.log(e);
      }
    }
    const user = appStore.getUser;

    var loggedIn = false;
    try {
      const user = await Auth.currentUserPoolUser();
      loggedIn = user && user.username;
    } catch (e) {
      loggedIn = false;
    }
    appStore.loggedIn = loggedIn;

    if ((to.meta.homePage || to.meta.authPage) && loggedIn) {
      next("dashboard");
      return;
    }

    if (to.meta.requiresAuth && !loggedIn) {
      if (to.meta.unAuthName) {
        return next({ name: to.meta.unAuthName, params: to.params });
      }
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
