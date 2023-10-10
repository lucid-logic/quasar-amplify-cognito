import { defineStore } from "pinia";
import { initCustomFormatter } from "vue";
import { cognitoFetch } from "../util/cognitofetch.js";

export const useAppStore = defineStore("counter", {
  state: () => ({
    counter: 0,
    extensionId: "",
    loggedIn: false,
  }),

  getters: {
    doubleCount(state) {
      return state.counter * 2;
    },
    isLoggedIn(state) {
      console.log("login", this.loggedIn);
      return state.loggedIn;
    },
  },

  actions: {
    increment() {
      this.counter++;
    },
    async checkSynchUpdate(wait = false) {
      //   const response = await cognitoFetch("user/synchupdate", {
      //     method: "POST",
      //   });
      //   const newSynchUpdate = response.synchUpdated;
      //   if (this.synchUpdate != newSynchUpdate || newSynchUpdate == 0) {
      //     this.synchUpdate = newSynchUpdate;
      //     if (wait) {
      //       await this.init(true);
      //     } else {
      //       this.init(true);
      //     }
      //   } else {
      //   }
      //   this.synchUpdate = newSynchUpdate;
    },
    async login() {
      const response = await cognitoFetch("prop/login", {
        method: "POST",
      });
      this.extensionId = response.extensionId;
      localStorage.setItem("haExtensionId", response.extensionId);
      console.log("login", response);
      this.loggedIn = true;

      console.log("login", this.loggedIn);
    },
    async logout() {
      this.extensionId = "";
      localStorage.removeItem("haExtensionId");
      this.loggedIn = false;
    },
    async init() {
      const extensionId = localStorage.getItem("haExtensionId");
      if (extensionId) {
        this.extensionId = extensionId;
      }
    },
  },
});
