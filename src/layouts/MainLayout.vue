<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          v-if="loggedIn"
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> App </q-toolbar-title>

        <div>
          <q-btn
            color="primary"
            :label="loggedIn ? 'Sign Out' : 'Login'"
            @click="loginClick"
          ></q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered v-if="loggedIn">
      <q-list>
        <q-item-label header> Menu </q-item-label>
        <q-item clickable @click="loginClick">
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Sign Out</q-item-label>
            <q-item-label caption>Logout of the site</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable @click="go('dashboard')">
          <q-item-section avatar>
            <q-icon name="Dashboard" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Dashboard</q-item-label>
            <q-item-label caption>Your dashboard</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable @click="go('account')">
          <q-item-section avatar>
            <q-icon name="settings            " />
          </q-item-section>

          <q-item-section>
            <q-item-label>Account</q-item-label>
            <q-item-label caption>Your account settings</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>
    <q-footer elevated>
      <q-toolbar>
        <q-toolbar-title></q-toolbar-title>
      </q-toolbar>
    </q-footer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, toRefs, computed, watchEffect } from "vue";

import { Authenticator, useAuthenticator } from "@aws-amplify/ui-vue";
import { useAppStore } from "../stores/appstore.js";
import { useRouter } from "vue-router";
import { Amplify, Auth } from "aws-amplify";
const { route, user, signOut } = toRefs(useAuthenticator());

export default defineComponent({
  name: "MainLayout",

  setup() {
    const appStore = useAppStore();
    const router = useRouter();
    const leftDrawerOpen = ref(false);
    const { route, user, signOut } = toRefs(useAuthenticator());
    console.log(appStore.isLoggedIn);
    const userId = computed(() => {
      return user.value ? user.value.username : "";
    });

    watchEffect(async () => {
      try {
        let loginUser = await Auth.currentAuthenticatedUser();
        console.log(loginUser);
        if (loginUser) {
          console.log("loginUser", loginUser); // undefined
          appStore.login();
        }
      } catch (e) {
        console.log("error", e);
      }
    });

    const loggedIn = computed(() => {
      return appStore.isLoggedIn;
    });

    async function loginClick() {
      if (loggedIn.value) {
        try {
          await Auth.signOut();
        } catch (error) {
          console.log("error signing out: ", error);
        }
      } else {
        router.push({ name: "auth" });
      }
    }

    function go(page) {
      router.push({ name: page });
    }

    return {
      go,
      loginClick,
      loggedIn,
      userId,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>
