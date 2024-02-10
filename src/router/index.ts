// Composables
import { createRouter, createWebHistory } from "vue-router";
import { auth } from "@/firebase/firebase";
import HomeView from "@/views/Home/HomeView.vue";
import LoginView from "@/views/LoginView.vue";
import LogoutView from "@/views/LogoutView.vue";
import OnlineMatchView from "@/views/Online/OnlineMatchView.vue";

const routes = [
  {
    path: "/",
    component: () => import("@/layouts/default/Default.vue"),
    children: [
      {
        path: "/",
        redirect: "/home",
      },
      {
        path: "/home",
        name: "home",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: HomeView,
      },
      {
        path: "/login",
        name: "login",
        component: LoginView,
        meta: {
          hideForAuth: true,
        },
      },
      {
        path: "/logout",
        name: "logout",
        component: LogoutView,
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "/online/:id",
        name: "onlineMatch",
        component: OnlineMatchView,
        meta: {
          requiresAuth: true,
        },
        props: true,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Router Guard for Authentication
router.beforeEach((to, from, next) => {
  auth.onAuthStateChanged(function (user) {
    if (to.matched.some((record) => record.meta.requiresAuth)) {
      if (!user) {
        next({ path: "/login" });
        return;
      } else {
        next();
        return;
      }
    }

    if (to.matched.some((record) => record.meta.hideForAuth)) {
      if (user) {
        next({ path: "/home" });
      } else {
        next();
      }
    } else {
      next();
    }
  });
});

export default router;
