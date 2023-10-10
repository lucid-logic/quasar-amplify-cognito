const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/IndexPage.vue"),
        meta: { homePage: true },
      },
      {
        path: "auth",
        name: "auth",
        component: () => import("pages/AuthPage.vue"),
        meta: { authPage: true },
      },
      {
        path: "dashboard",
        name: "dashboard",
        component: () => import("pages/DashboardPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "account",
        name: "account",
        component: () => import("pages/AccountPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "applogin",
        name: "applogin",
        component: () => import("pages/AppLoginPage.vue"),
        meta: { authPage: true },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
