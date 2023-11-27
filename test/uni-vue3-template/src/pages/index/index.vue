<template>
	<view class="content">
		<image class="logo" src="/static/logo.png" />
		<view @click="handleNavigate" class="btn">跳转</view>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// import { useRouter } from '../../../../../packages/uni-tiny-router/src/index'
import { useRouter } from 'uni-tiny-router'

const router = useRouter()
const handleNavigate = () => {
	router.navigateTo({ url: 'pages/mine/index', query: { param: 'hello' } })
}
</script>

<style>
.content {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.logo {
	height: 200rpx;
	width: 200rpx;
	margin-top: 200rpx;
	margin-left: auto;
	margin-right: auto;
	margin-bottom: 50rpx;
}

.btn {
	width: 50rpx;
	height: 20rpx;
	text-align: center;
	cursor: pointer;
}
</style>
