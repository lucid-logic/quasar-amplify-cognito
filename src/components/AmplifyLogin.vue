<template>
  <authenticator :initial-state="authState">
    <template v-slot="{ signOut }">
      <q-btn label="Continue..." @click="cont" />
      <button @click="signOut">Sign Out</button>
    </template>
  </authenticator>
</template>

<script>
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-vue";
import "@aws-amplify/ui-vue/styles.css";

import { Amplify, Auth } from "aws-amplify";
import { useRouter } from "vue-router";
import { useAppStore } from "src/stores/AppStore.js";
import { useQuasar } from "quasar";

import awsConfig from "../aws-exports.js";
// Assuming you have two redirect URIs, and the first is for localhost and second is for production
//const isCapacitor = false;

const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === "[::1]" ||
    // 127.0.0.1/8 is considered localhost for IPv4.
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

import {
  defineComponent,
  toRefs,
  watchEffect,
  watch,
  computed,
  ref,
} from "vue";
import { useRoute } from "vue-router";

export default defineComponent({
  components: {
    Authenticator,
  },
  setup() {
    const appStore = useAppStore();
    const router = useRouter();
    const $q = useQuasar();
    const isCapacitor = $q.platform.is.nativeMobile;
    const pageRoute = useRoute();
    var loggedInRedirect = ref(false);

    const updatedAwsConfig = {
      ...awsConfig,
      oauth: {
        ...awsConfig.oauth,
        redirectSignIn: isCapacitor
          ? process.env.APP_COGNITO_REDIRECT
          : isLocalhost && !isCapacitor
          ? localRedirectSignIn
          : productionRedirectSignIn,
        redirectSignOut:
          isLocalhost && !isCapacitor
            ? localRedirectSignOut
            : productionRedirectSignOut,
      },
    };
    //updatedAwsConfig.oauth.domain = "app.signin.kasi.run";

    console.log(updatedAwsConfig);

    Amplify.configure(updatedAwsConfig);

    const { route, user, signOut } = toRefs(useAuthenticator());

    localStorage.setItem("user", JSON.stringify(user.value));

    const authState = computed(() => {
      if (pageRoute.query && pageRoute.query.signup) {
        return "signUp";
      } else {
        return "signIn";
      }
    });

    async function redirectAfterLogin() {
      if (loggedInRedirect.value && loading) {
        return router.push({ name: "dashboard" });
      }
    }

    const loading = computed(() => {
      return appStore.loading;
    });

    watch(
      [loading, loggedInRedirect],
      ([newLoading, newPath], [oldLoading, oldPath]) => {
        redirectAfterLogin();
      }
    );

    function cont() {
      redirectAfterLogin();
    }
    watchEffect(async () => {
      if (user.value) {
        try {
          loggedInRedirect.value = true;
          redirectAfterLogin();
          //router.push({ name: "start" });
        } catch (e) {
          console.log("error", e);
          appStore.logMessage("error 1");
          appStore.logMessage(JSON.stringify(e));
        }
      }
    });
    return {
      authState,
      cont,
    };
  },
});
</script>
<style>
:root {
  /* Colors */
  --amazonOrange: #009900; /* Redefined to dark green */
  --lightAmazonOrange: #ffac31;
  --darkAmazonOrange: #e88b01;
  --squidInk: #232f3e;
  --lightSquidInk: #31465f;
  --deepSquidInk: #152939;
  --grey: #828282;
  --lightGrey: #c4c4c4;
  --silver: #e1e4ea;
  --darkBlue: #31465f;
  --red: #dd3f5b;
  --white: #ffffff;
  --light-blue: #00a1c9;
  --amplify-colors-brand-primary-80: #36ace2; /* Redefined to dark green */
}
</style>
