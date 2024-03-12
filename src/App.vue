<script setup lang="ts">
import { ref } from 'vue';
import { sleep } from 'vue-public-util';
import { useLoading } from './util';


const data = ref([])

const check = async () => {
  // await sleep(1000)
  return true
}


/**
 * 获取报文12
 */
function getData () {
  const users = [...new Array(10)].map((_, index) => ({id: index}))
  return {
    data: users
  }
}

// 提交接口
const submitAction = async (data: {id: number}[]) => {
  // await sleep(500)
  const getFun = /*#ynqq.log*/ () => {
    const a = {a: "asd"}
  }
  return data
}

/**
 * #ynqq.log
 */
const submit = useLoading(/*#ynqq.log*/async () => {
  const checkValue = await check() 
  if(checkValue){
    const data = getData()
    if(data){
      const laster = data.data.pop()
      const laster2 = data.data.pop()
      const laster3 = data.data.pop()
    }
    submitAction(data.data)
    const a = 2
  }
})


</script>

<template>
  <div @click="submit">1</div>
</template>

<style scoped>

</style>
