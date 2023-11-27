import pages from '@/pages.json'
// import { createRouter } from '../../../../packages/uni-tiny-router/src/index'
import { createRouter } from 'uni-tiny-router'

export let router = createRouter({ routes: pages.pages })

export function setupRouter(app: any) {
	app.use(router)

	router.beforeEach(async (to: any, from: any, next: any) => {
		next()
	})
	// 路由后置守卫
	router.afterEach((to: any, from: any) => {
		// your code
	})

	return router
}
