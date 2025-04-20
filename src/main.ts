import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

const app = createApp(App)

// 添加错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue Error:', err)
  console.error('Error Info:', info)
}

app.config.warnHandler = (msg, instance, trace) => {
  console.warn('Vue Warning:', msg)
  console.warn('Warning Trace:', trace)
}

app.mount('#app') 