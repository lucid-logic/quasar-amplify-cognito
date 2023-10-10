<template>
  <q-page class="flex flex-center">
    <amplify-login v-if="false" />
    <a v-else :href="fullPath"> Open in the App </a>
  </q-page>
  <q-spinner />
</template>

<script>
import { useQuasar } from "quasar";
import { useRoute, useRouter } from "vue-router";
import AmplifyLogin from "src/components/AmplifyLogin.vue";
import { computed } from "vue";
import { useAppStore } from "src/stores/AppStore";
import { Amplify, Auth } from "aws-amplify";
import * as AmazonCognitoIdentity from "amazon-cognito-identity-js";
import awsConfig from "../aws-exports.js";

export default {
  components: {
    AmplifyLogin,
  },
  // name: 'PageName',
  setup() {
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

    const $q = useQuasar();
    const isCapacitor = $q.platform.is.nativeMobile;

    const route = useRoute();
    const router = useRouter();

    const AppStore = useAppStore();
    AppStore.logMessage("AppLoginPage");
    AppStore.logMessage(route.fullPath);

    Auth._oAuthHandler.handleAuthResponse();

    Auth._oAuthHandler.handleAuthResponse(route.fullPath).then((resp) => {
      // create a CognitoAccessToken using the response accessToken
      const AccessToken = new AmazonCognitoIdentity.CognitoAccessToken({
        AccessToken: resp.accessToken,
      });

      // create a CognitoIdToken using the response idToken
      const IdToken = new AmazonCognitoIdentity.CognitoIdToken({
        IdToken: resp.idToken,
      });

      // create a RefreshToken using the response refreshToken
      const RefreshToken = new AmazonCognitoIdentity.CognitoRefreshToken({
        RefreshToken: resp.refreshToken,
      });

      // create a session object with all the tokens
      const sessionData = {
        IdToken: IdToken,
        AccessToken: AccessToken,
        RefreshToken: RefreshToken,
      };

      // create the CognitoUserSession using the sessionData
      const session = new AmazonCognitoIdentity.CognitoUserSession(sessionData);

      // create an object with the UserPoolId and ClientId
      var poolData = {
        UserPoolId: awsConfig.aws_user_pools_id,
        ClientId: awsConfig.aws_user_pools_web_client_id,
      };

      // pass the poolData object to CognitoUserPool

      var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

      // create an object containing the username and user pool.
      // You can get the username from CognitoAccessToken object
      // we created above.
      var userData = {
        Username: AccessToken.payload.username,
        Pool: userPool,
      };

      // create a cognito user using the userData object
      var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
      // set the cognito user session w/ the CognitoUserSession
      cognitoUser.setSignInUserSession(session);

      // get the Amplify authenticated user
      Auth.currentAuthenticatedUser()
        .then((user) => {
          console.log(user);
          router.push({ name: "start" });
        })
        .catch((err) => console.log(JSON.stringify(err)));
    });

    console.log(route.fullPath);
    const fullPath = computed(
      () =>
        // (window.location.hostname === "app-dev.kasi.run"
        //   ? "https://app-dev.kasi.run"
        //   : "https://app.kasi.run") + route.fullPath
        "https://" + window.location.hostname + route.fullPath
    );

    return {
      isCapacitor,
      fullPath,
      route,
    };
    // name: 'PageName',
  },
};
</script>
