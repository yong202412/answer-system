<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

interface Group {
  id: number
  name: string
  remainingTime: number
  isActive: boolean
  giftTarget: string | number
  giftTime: number
}

// 默认小组名称
const defaultGroupNames = [
  '诗词达人队',
  '文言高手队',
  '阅读能手队',
  '写作之星队'
]

// 状态管理
const defaultTime = 600 // 默认10分钟 = 600秒
const giftTimeOptions = [5, 10, 15, 20, 30, 45, 60] // 赠送时间选项（秒）
const defaultGiftTime = 15 // 默认赠送15秒
const groups = reactive<Group[]>([])
const isSetupMode = ref(true)
const timer = ref<number | null>(null)
const activeGroupId = ref<number | null>(null)

// 初始化默认小组
const initDefaultGroups = () => {
  defaultGroupNames.forEach((name, index) => {
    groups.push({
      id: Date.now() + index,
      name,
      remainingTime: defaultTime,
      isActive: false,
      giftTarget: '',
      giftTime: defaultGiftTime
    })
  })
  console.log('Initialized default groups:', JSON.stringify(groups))
}

// 添加小组
const addGroup = () => {
  const groupNumber = groups.length + 1
  const newGroup: Group = {
    id: Date.now(),
    name: `小组${groupNumber}`,
    remainingTime: defaultTime,
    isActive: false,
    giftTarget: '',
    giftTime: defaultGiftTime
  }
  
  groups.push(newGroup)
  console.log('Added group:', newGroup)
  console.log('Current groups:', JSON.stringify(groups))
}

// 删除小组
const removeGroup = (id: number) => {
  const index = groups.findIndex(g => g.id === id)
  if (index > -1) {
    groups.splice(index, 1)
    console.log('Removed group, remaining groups:', JSON.stringify(groups))
  }
}

// 开始抢答模式
const startAnswerMode = () => {
  console.log('Starting answer mode...')
  console.log('Groups before start:', JSON.stringify(groups))
  
  if (groups.length === 0) {
    alert('请至少保留一个小组！')
    return
  }
  
  // 重置所有小组状态
  groups.forEach(group => {
    group.isActive = false
    group.remainingTime = defaultTime
    group.giftTarget = ''
    group.giftTime = defaultGiftTime
  })
  
  // 重置计时器状态
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
  activeGroupId.value = null
  
  // 切换到抢答模式
  isSetupMode.value = false
  console.log('Switched to answer mode, groups:', JSON.stringify(groups))
}

// 返回设置模式
const backToSetup = () => {
  console.log('Returning to setup mode...')
  stopTimer()
  
  // 重置所有小组状态
  groups.forEach(group => {
    group.isActive = false
    group.remainingTime = defaultTime
    group.giftTarget = ''
    group.giftTime = defaultGiftTime
  })
  
  activeGroupId.value = null
  isSetupMode.value = true
  console.log('Back to setup mode, groups:', JSON.stringify(groups))
}

// 开始计时
const startTimer = (groupId: number) => {
  console.log('Starting timer for group:', groupId)
  
  if (timer.value !== null) {
    console.log('Timer already running')
    return
  }
  
  const group = groups.find(g => g.id === groupId)
  if (!group || group.remainingTime <= 0) {
    console.log('Invalid group or no time remaining')
    return
  }
  
  activeGroupId.value = groupId
  group.isActive = true
  
  timer.value = setInterval(() => {
    const currentGroup = groups.find(g => g.id === groupId)
    if (currentGroup && currentGroup.remainingTime > 0) {
      currentGroup.remainingTime--
      console.log(`Time remaining for ${currentGroup.name}: ${currentGroup.remainingTime}`)
    } else {
      stopTimer()
    }
  }, 1000)
  
  console.log('Started timer for group:', group.name)
}

// 停止计时
const stopTimer = () => {
  console.log('Stopping timer...')
  
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
  
  const activeGroup = groups.find(g => g.id === activeGroupId.value)
  if (activeGroup) {
    activeGroup.isActive = false
  }
  
  activeGroupId.value = null
  console.log('Timer stopped')
}

// 赠送时间
const giftTime = (fromGroupId: number, toGroupId: string | number) => {
  console.log('Gifting time from', fromGroupId, 'to', toGroupId)
  
  if (typeof toGroupId !== 'number') {
    console.log('Invalid target group')
    return
  }
  
  const fromGroup = groups.find(g => g.id === fromGroupId)
  const toGroup = groups.find(g => g.id === toGroupId)
  
  if (!fromGroup || !toGroup) {
    console.log('Groups not found')
    return
  }
  
  if (fromGroup.remainingTime < fromGroup.giftTime) {
    alert('剩余时间不足，无法赠送！')
    return
  }
  
  fromGroup.remainingTime -= fromGroup.giftTime
  toGroup.remainingTime += fromGroup.giftTime
  fromGroup.giftTarget = ''
  
  console.log(`Gifted ${fromGroup.giftTime}s from ${fromGroup.name} to ${toGroup.name}`)
  console.log('Updated groups:', JSON.stringify(groups))
}

// 格式化时间
const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 组件挂载时的初始化
onMounted(() => {
  console.log('Component mounted')
  initDefaultGroups()
})
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <h1>语文课堂抢答器</h1>
      <div class="mode-indicator">
        {{ isSetupMode ? '设置模式' : '抢答模式' }}
      </div>
    </header>

    <main class="main-content">
      <!-- 设置模式 -->
      <div v-if="isSetupMode" class="setup-mode">
        <div class="groups-list" v-if="groups.length > 0">
          <div v-for="group in groups" :key="group.id" class="group-item">
            <span>{{ group.name }}</span>
            <button type="button" @click="removeGroup(group.id)" class="btn-remove">删除</button>
          </div>
        </div>
        <div v-else class="empty-state">
          还没有添加小组
        </div>

        <div class="setup-controls">
          <button type="button" @click="addGroup" class="btn-add">
            添加小组
          </button>
          <button 
            type="button"
            @click="startAnswerMode" 
            class="btn-start"
            :disabled="groups.length === 0"
          >
            开始抢答
          </button>
        </div>
      </div>

      <!-- 抢答模式 -->
      <div v-else class="answer-mode">
        <div class="answer-mode-header">
          <button type="button" @click="backToSetup" class="btn-back">返回设置</button>
          <div class="group-count">共 {{ groups.length }} 个小组</div>
        </div>
        
        <div v-if="groups.length > 0" class="groups-grid">
          <div 
            v-for="group in groups" 
            :key="group.id" 
            class="group-card"
            :class="{ active: group.isActive }"
          >
            <h3>{{ group.name }}</h3>
            <div class="time-display">{{ formatTime(group.remainingTime) }}</div>
            
            <div class="controls">
              <button 
                type="button"
                @click="startTimer(group.id)"
                :disabled="timer !== null || group.remainingTime <= 0"
                class="btn-timer"
              >
                {{ group.remainingTime <= 0 ? '时间已用完' : '开始计时' }}
              </button>
              
              <div class="gift-controls" v-if="groups.length > 1">
                <div class="gift-time-select">
                  <label>赠送时间：</label>
                  <select v-model="group.giftTime">
                    <option v-for="time in giftTimeOptions" :key="time" :value="time">
                      {{ time }}秒
                    </option>
                  </select>
                </div>
                <div class="gift-target-select">
                  <label>赠送对象：</label>
                  <select v-model="group.giftTarget">
                    <option value="">请选择</option>
                    <option 
                      v-for="otherGroup in groups.filter(g => g.id !== group.id)" 
                      :key="otherGroup.id" 
                      :value="otherGroup.id"
                    >
                      {{ otherGroup.name }}
                    </option>
                  </select>
                  <button 
                    type="button"
                    @click="giftTime(group.id, group.giftTarget)"
                    :disabled="!group.giftTarget || group.remainingTime < group.giftTime"
                    class="btn-gift"
                  >
                    赠送
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          type="button"
          v-if="timer !== null" 
          @click="stopTimer" 
          class="btn-stop"
        >
          停止计时
        </button>
      </div>
    </main>

    <footer class="app-footer">
      <p>陈绮老师专用</p>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.app-header {
  background-color: #ff6b6b;
  color: white;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.mode-indicator {
  font-size: 0.9rem;
  margin-top: 0.5rem;
  opacity: 0.9;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.setup-mode {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
}

.setup-controls {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.empty-state {
  color: #666;
  font-style: italic;
  margin: 2rem 0;
}

.groups-list {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-add {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-remove {
  background-color: #ff4444;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-start {
  background-color: #2196F3;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: background-color 0.2s;
}

.btn-start:hover {
  background-color: #1976D2;
}

.btn-start:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.answer-mode {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  width: 100%;
}

.answer-mode-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.group-count {
  color: #666;
  font-size: 0.9rem;
}

.btn-back {
  background-color: #757575;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-back:hover {
  background-color: #616161;
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  width: 100%;
}

.group-card {
  background-color: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.3s ease;
}

.group-card.active {
  border: 2px solid #4CAF50;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.time-display {
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
  color: #333;
  font-family: monospace;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn-timer {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background-color 0.2s;
}

.btn-timer:hover {
  background-color: #388E3C;
}

.btn-timer:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.gift-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #eee;
}

.gift-time-select,
.gift-target-select {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.gift-time-select label,
.gift-target-select label {
  font-size: 0.9rem;
  color: #666;
  white-space: nowrap;
}

.gift-controls select {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.btn-gift {
  background-color: #9C27B0;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s;
}

.btn-gift:hover {
  background-color: #7B1FA2;
}

.btn-gift:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-stop {
  background-color: #ff4444;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background-color 0.2s;
}

.btn-stop:hover {
  background-color: #d32f2f;
}

.app-footer {
  text-align: center;
  padding: 1rem;
  background-color: #333;
  color: white;
  margin-top: auto;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
  
  .gift-controls {
    flex-direction: column;
  }
  
  .time-display {
    font-size: 2rem;
  }
  
  .gift-time-select,
  .gift-target-select {
    flex-direction: column;
    align-items: stretch;
  }
  
  .gift-time-select label,
  .gift-target-select label {
    margin-bottom: 0.25rem;
  }
}
</style>