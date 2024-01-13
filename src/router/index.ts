// Composables
import { createRouter, createWebHistory } from "vue-router";
import { auth } from "@/firebase/firebase";

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
        component: () => import("@/views/HomeView.vue"),
      },
      {
        path: "/login",
        name: "login",
        component: () => import("@/views/LoginView.vue"),
        meta: {
          hideForAuth: true,
        },
      },
      {
        path: "/logout",
        name: "logout",
        component: () => import("@/views/LogoutView.vue"),
        meta: {
          requiresAuth: true,
        },
      },
      {
        path: "online",
        name: "Online",
        component: () => import("@/views/OnlineView.vue"),
        meta: {
          requiresAuth: true,
        },
      },
      // {
      //   path: "/online-fail",
      //   name: "onlineFail",
      //   component: OnlineFailView,
      //   meta: {
      //     requiresAuth: true,
      //   },
      // },
      {
        path: "/online/:id",
        name: "onlineMatch",
        component: () => import("@/views/Online/OnlineMatchView.vue"),
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
        next({ path: "/online" });
      } else {
        next();
      }
    } else {
      next();
    }
  });
});

export default router;
