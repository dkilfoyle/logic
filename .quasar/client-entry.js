/**
 * THIS FILE IS GENERATED AUTOMATICALLY.
 * DO NOT EDIT.
 *
 * You are probably looking on adding startup/initialization code.
 * Use "quasar new boot <name>" and add it there.
 * One boot file per concern. Then reference the file(s) in quasar.conf.js > boot:
 * boot: ['file', ...] // do not add ".js" extension to it.
 *
 * Boot files are your "main.js"
 **/



import '@quasar/extras/roboto-font/roboto-font.css'

import '@quasar/extras/material-icons/material-icons.css'




// We load Quasar stylesheet file
import 'quasar/dist/quasar.sass'




import 'src/css/app.sass'


import Vue from 'vue'
import createApp from './app.js'










Vue.config.devtools = true
Vue.config.productionTip = false



console.info('[Quasar] Running SPA.')





const publicPath = ``


async function start () {
  const { app, store, router } = await createApp()

  

  

  

    

    

    
      new Vue(app)
    

    

    

  

}

start()
