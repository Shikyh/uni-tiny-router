<template>
	<view>{{ route.query.param }}</view>
</template>
<script setup lang="ts">
// import { useRoute } from '../../../../../packages/uni-tiny-router/src/index'
import { useRoute } from 'uni-tiny-router'

const route = useRoute()
</script>
