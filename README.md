# uni-tiny-router

[![](https://img.shields.io/badge/npm-v1.0.6-blue)](https://www.npmjs.com/package/uni-tiny-router)

>一个基于uni-app的原生钩子实现和方法，使用typescript+uniapp构建更贴合uniapp的router插件，适配vue3

## 特性

1. 适配uniapp(vue3)
2. 使用Typescript构建
3. 基于uni-app自身的钩子和属性实现, 支持app、h5、微信小程序等平台，兼容性较好
4. 直接使用uni等原生方法进行跳转
5. 支持全局的前置导航守卫和后置导航守卫

### 开始

```bash
# uni-tiny-router 适配Vue 3
npm i uni-tiny-router --save
# 或者
yarn add uni-tiny-router
```

>注册路由对象（router/index.ts示例）

```js
import pages from '@/pages.json' // 路由配置(uniapp项目工程)
import { createRouter } from 'uni-tiny-router'
import { App } from 'vue'

// 创建路由对象
export let router = createRouter({ routes: pages.pages })

// 注册路由
export function setupRouter(app: App) {
 app.use(router)

 // 路由前置守卫
 router.beforeEach(async (to: any, from: any, next: any) => {
  // your code
  next()
 })

 // 路由后置守卫
 router.afterEach((to: any, from: any) => {
    // your code
 })

 return router
}
```

### Notice注意

路由对象的生成注册需要传入uniapp项目pages.json配置的路由

>项目注册路由
main.js

```js
import { createSSRApp } from 'vue'
import App from '@/App.vue'
import { setupRouter } from './router/index' // 这里为你刚才创建路由的入口文件，自行按实际项目开发配置

export const createApp = () => {
 const app = createSSRApp(App)
 // 初始化路由
 setupRouter(app)

 return {
  app
 }
}
```

>组件，页面使用路由

```html
<template>
    <view @click="handleNavigate">路由跳转</view>
</template>
<script setup lang="ts">
    import { useRoute, useRouter } from 'uni-tiny-router'

    const route = useRoute() // 路由元对象
    const router = useRouter() // 路由对象

    // 导航跳转
    const handleNavigate = ()=>{
        router.navigateTo({url: 'pages/test/index', query: {a: 'xxx'}})
    }
    // 携带的路由参数可以通过路由元对象进行获取, 类型Uniapp的onload生命周期的option参数
  console.log(_route.query)
</script>

```

### API(路由对象)

| 方法                        | 说明                                                                                              | 类型          | 默认值                       |
| --------------------------- | ------------------------------------------------------------------------------------------------- | ------------- | ---------------------------- |
| navigateTo                     | 参数同[uniapp](https://uniapp.dcloud.net.cn/api/router.html#navigateto),额外支持query参数，便于参数传递与获取。该方法会返回一个promise对象                                                                       |object
| redirectTo                      | 参数同[uniapp](https://uniapp.dcloud.net.cn/api/router.html#redirectto),额外支持query参数，便于参数传递与获取。该方法会返回一个promise对象                                         |object
| relaunch                      | 参数同[uniapp](https://uniapp.dcloud.net.cn/api/router.html#relaunch),额外支持query参数，便于参数传递与获取。该方法会返回一个promise对象                                         |object
| switchtab                      | 参数同[uniapp](https://uniapp.dcloud.net.cn/api/router.html#switchtab),额外支持query参数，便于参数传递与获取。该方法会返回一个promise对象                                     |object
| navigateBack                      | 参数同[uniapp](https://uniapp.dcloud.net.cn/api/router.html#navigateback),额外支持query参数，便于参数传递与获取。该方法会返回一个promise对象                                     |object

### 路由守卫钩子函数

>与vue-router的使用方式相似

| 函数                        | 说明                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------- |
| beforeEach                      | 前置守卫的next用法跟vue-router有所不同，调用next代表不拦截，beforeEach接受的函数参数是个async函数，需要使用await来获取异步的结果，如果需要使用异步操作则需包装成promise形式，不能直接使用setTimeout等具有回调性质的异步操作，完成操作必须要调用`next`方法执行放行
| afterEach                       |

### 404路由页面配置
>当路由配置表(pages.json)中没有与跳转路径对应的路由时，会出现报错，此时可以配置一个404页面(如有需要)。404路由name为notfound,不区分英文大小写

```json
{
  "path": "你的路径",
  "name": "notfound",
  "style": {
    "navigationBarTitleText": "404"
  }
}
```
