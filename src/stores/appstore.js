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
