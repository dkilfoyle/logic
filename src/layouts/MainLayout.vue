<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" />

        <q-toolbar-title>
          Digital Logic Simulation
        </q-toolbar-title>

        <div>
          v0.3
          <a
            href="https://github.com/dkilfoyle/logic"
            rel="noopener"
            target="_blank"
            ><q-btn
              flat
              color="secondary"
              icon="img:statics/icons/GitHub-Mark-32px.png"
            ></q-btn
          ></a>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: "MainLayout",

  data() {
    return {};
  }
};
</script>
