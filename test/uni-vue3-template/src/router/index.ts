import pages from '@/pages.json'
import { createRouter } from '../../../../packages/uni-tiny-router/src/index'
// import { createRouter } from 'uni-tiny-router'
export const router = createRouter({ routes: pages.pages })

// 需要拦截路由
// const guardList = ['pages/guard/index']

export function setupRouter(app: any) {
	app.use(router)

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	router.beforeEach(async (to: any, from: any, next: any) => {
		// your code
		next()
	})
	// 路由后置守卫

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	router.afterEach((to: any, from: any) => {
		// your code
	})

	return router
}
