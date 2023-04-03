<template>
  <authenticator>
    <template v-slot="{ user, signOut }">
      <h1>Hello {{ user.username }}!</h1>
      <button @click="signOut">Sign Out</button>
    </template>
  </authenticator>
</template>

<script>
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-vue";
import "@aws-amplify/ui-vue/styles.css";

import { Amplify, Auth } from "aws-amplify";
import { useRouter } from "vue-router";
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
updatedAwsConfig.oauth.domain = "app.signin.housealert.com.au";

Amplify.configure(updatedAwsConfig);

import { defineComponent, toRefs, watchEffect } from "vue";

export default defineComponent({
  components: {
    Authenticator,
  },
  setup() {
    const router = useRouter();

    const { route, user, signOut } = toRefs(useAuthenticator());
    const appStore = useAppStore();

    localStorage.setItem("user", JSON.stringify(user.value));
    watchEffect(async () => {
      if (user.value) {
        try {
          let loginUser = await Auth.currentAuthenticatedUser();
          //          localStorage.setItem("user", JSON.stringify(user.value));
          console.log("loginUser", loginUser); // undefined
          appStore.login();
          router.push("/");
        } catch (e) {
          console.log("error", e);
        }
      }
    });
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
