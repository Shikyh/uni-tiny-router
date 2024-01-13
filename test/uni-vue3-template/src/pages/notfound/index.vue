<template>
	<view class="page-wrapper">
		<view>页面不存在。请返回首页</view>
		<view @click="back" class="back-btn">返回</view>
	</view>
</template>
<script setup lang="ts">
// import { useRouter } from '../../../../../packages/uni-tiny-router/src/index'
import { useRouter } from 'uni-tiny-router'

const router = useRouter()

const back = () => {
	// 回到起始页
	router.redirectTo({ url: 'pages/index/index' })
}
</script>
<style scoped>
.page-wrapper {
	display: flex;
	flex-direction: column;
	align-items: center;
}
.back-btn {
	margin-top: 10rpx;
	border: solid 1rpx #eee;
	padding: 2rpx 10rpx;
	cursor: pointer;
}
</style>
