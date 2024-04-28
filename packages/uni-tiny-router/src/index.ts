import { AfterEach, BackParams, BeforeEach, CreateOptions, Route, RouteMeta, Router } from './type'
import { deepClone, isObject, isString } from './utils'
import { parseQuery, stringifyQuery } from './qs'

// 常量定义
const DEFAULT_ROUTE_METHODS = ['navigateTo', 'switchTab', 'reLaunch', 'redirectTo', 'navigateBack']
const HOME_PATH = '/'
const EMPTY_PATH = ''
const NOT_FOUND_ROUTE_NAME = 'notfound'

// 路由跳转方法映射
const ROUTE_METHOD_MAP = {
	navigateTo: uni.navigateTo,
	switchTab: uni.switchTab,
	reLaunch: uni.reLaunch,
	redirectTo: uni.redirectTo,
	navigateBack: uni.navigateBack
} as const

export let router: Router

/**
 * 创建路由
 * @param options 创建路由配置
 * @returns {Router}
 */
export const createRouter = (options: CreateOptions) => {
	const pagesRoutes = options.routes || []

	// 处理分包路由
	const subPackagesRoutes: Route[] = []
	if (options.subPackages?.length) {
		options.subPackages.forEach((pkg) => {
			const pages = pkg.pages.map((page: Route) => ({
				...page,
				path: `${pkg.root}/${page.path}`
			}))
			subPackagesRoutes.push(...pages)
		})
	}

	const routes = [...pagesRoutes, ...subPackagesRoutes]
	const routeMethods = options.routeMethods || DEFAULT_ROUTE_METHODS
	const routeMeta: RouteMeta = { to: {}, from: {} }
	const beforeEach: BeforeEach[] = []
	const afterEach: AfterEach[] = []
	let isLaunch = false
	let isOperateAPI = false

	/**
	 * 获取当前页面
	 * @returns 当前页面
	 */
	const getCurrentPage = () => {
		const pages = getCurrentPages()
		return pages.length > 0 ? pages[pages.length - 1] : undefined
	}

	/**
	 * 获取页面路径
	 * @param page 页面对象
	 * @returns 页面路径
	 */
	const getPagePath = (page: any | undefined): string => {
		if (!page) return ''
		return isString(page.route) ? page.route : page.$page?.route || ''
	}

	/**
	 * 运行带有拦截功能的函数队列
	 * @param fnList 拦截函数列表
	 * @param to 目标路由
	 * @param from 来源路由
	 * @returns Promise<Route[]>
	 */
	const callWithNext = (fnList: BeforeEach[], to: Route, from: Route): Promise<(Route | boolean)[]> => {
		const allWithNext = fnList.map((fn: BeforeEach) => {
			return new Promise<Route | boolean>((resolve, reject) => {
				try {
					fn(to, from, (value?: Route | boolean | string) => {
						console.log(value)
						if (typeof value === 'undefined') {
							return resolve(true)
						}
						if (typeof value === 'boolean') {
							if (value) return resolve(true)
							return reject(new Error('路由跳转失败'))
						}
						if (isObject(value)) {
							return resolve({ type: 'navigateTo', ...(value as Route) })
						}
						if (isString(value)) {
							return resolve({ path: value, type: 'navigateTo' } as Route)
						}
						reject(new Error('无效的路由跳转参数'))
					})
				} catch (error) {
					reject(error)
				}
			})
		})
		return Promise.all(allWithNext)
	}

	/**
	 * 运行不带拦截功能的函数队列
	 * @param fnList 拦截函数列表
	 * @param to 目标路由
	 * @param from 来源路由
	 * @returns void
	 */
	const callWithoutNext = (fnList: AfterEach[], to: Route, from: Route): void => {
		if (fnList?.length) {
			fnList.forEach((fn: AfterEach) => {
				try {
					fn(to, from)
				} catch (error) {
					console.warn('路由拦截器执行失败:', error)
				}
			})
		}
	}

	/**
	 * 匹配路由可以通过name或者path匹配
	 * @param route 路由参数
	 * @returns Route | null
	 */
	const matchRoute = (route: Route): Route | null => {
		// eslint-disable-next-line prefer-const
		let { path, name, query } = route
		const _route: Route = { query: {} }

		// 处理路径和查询参数
		if (path) {
			_route.fullPath = path
			const [pathPart, queryPart] = path.split('?')
			path = pathPart
			if (queryPart) {
				_route.query = parseQuery(queryPart)
			}
		}

		if (query) {
			_route.query = { ..._route.query, ...query }
		}

		// 查找匹配的路由
		let targetRoute = routes.find((r: Route) => {
			// 首页匹配
			if (path === HOME_PATH || path === EMPTY_PATH) {
				return true
			}
			// 按名称匹配
			if (name) {
				return r.name === name
			}
			// 按路径匹配
			return r.path === path?.replace(/^\//, '')
		})

		if (targetRoute) {
			const clonedRoute = deepClone(targetRoute)
			return clonedRoute ? { ...clonedRoute, ..._route } : null
		}
		// 尝试匹配404页面
		targetRoute = routes.find((r: Route) => r.name?.toLowerCase() === NOT_FOUND_ROUTE_NAME)
		console.log(targetRoute)
		if (targetRoute) {
			const clonedRoute = deepClone(targetRoute)
			return clonedRoute ? { ...clonedRoute, ..._route } : null
		}
		return null
	}

	/**
	 * 处理路由对象
	 * @param route 路由参数
	 * @returns Route
	 */
	const handleRoute = (route: Route | string): Route => {
		const result: Route = { type: 'navigateTo' }

		if (isString(route)) {
			result.path = route
			return result
		}

		if (isObject(route)) {
			// 兼容 url 和 path写法
			if (route.url && !route.path) {
				route.path = route.url
			}
			return { ...result, ...route }
		}

		return result
	}

	/**
	 * 匹配to路由
	 * @param route 路由参数
	 * @returns void
	 */
	const matchToRoute = (route: Route): void => {
		// eslint-disable-next-line prefer-const
		let { path, name, query, type } = route
		if (type && !routeMethods.includes(type)) {
			throw new Error(`type必须是以下的值: ${routeMethods.join(', ')}`)
		}

		// 处理返回操作
		if (type === 'navigateBack') {
			const { delta = 1 } = route
			const stackRoutes = getCurrentPages()
			if (stackRoutes.length >= 1) {
				const targetIndex = Math.max(0, stackRoutes.length - 1 - delta)
				const targetPage = stackRoutes[targetIndex]
				path = getPagePath(targetPage)
			}
		}

		// 确保路径以 / 开头
		if (path && !path.startsWith('/')) {
			path = '/' + path
		}

		// 匹配路由
		routeMeta.to = matchRoute({ path, name, query })
		if (!routeMeta.to) {
			throw new Error(`找不到对应的路由配置: ${path || name || '未知路径'}`)
		}
	}

	/**
	 * 匹配from路由
	 * @returns void
	 */
	const matchFromRoute = (): void => {
		const stackRoutes = getCurrentPages()

		if (stackRoutes.length > 0) {
			const from = stackRoutes[stackRoutes.length - 1]
			const path = getPagePath(from)
			routeMeta.from = matchRoute({ path })
		} else {
			// 如果没有历史记录，取第一个作为from
			if (routes.length > 0) {
				const firstRoute = deepClone(routes[0])
				if (firstRoute) {
					routeMeta.from = {
						...firstRoute,
						fullPath: firstRoute.path,
						query: {}
					}
				}
			}
		}
	}

	/**
	 * 调用下一步
	 * @returns Promise<Route[]>
	 */
	const next = (): Promise<(Route | boolean)[]> => {
		matchFromRoute()

		if (beforeEach.length > 0 && routeMeta.to && routeMeta.from) {
			return callWithNext(beforeEach, routeMeta.to, routeMeta.from)
		}

		return Promise.resolve([])
	}

	/**
	 * 路由跳转内部方法
	 * @param route 路由对象
	 * @returns Promise<void>
	 */
	const routeTo = (route: Route): Promise<void> => {
		return new Promise((resolve, reject) => {
			if (route.isLaunch) {
				return resolve()
			}

			const { type = 'navigateTo', ...rest } = route
			const jump = ROUTE_METHOD_MAP[type as keyof typeof ROUTE_METHOD_MAP]

			if (!jump) {
				return reject(new Error(`不支持的路由跳转类型: ${type}`))
			}

			if (!routeMeta.to) {
				return reject(new Error('目标路由不存在'))
			}

			const queryStr = stringifyQuery(routeMeta.to.query || {})
			const url = `/${routeMeta.to.path}${queryStr ? `?${queryStr}` : ''}`

			jump({
				...rest,
				url,
				success: resolve,
				fail: reject
			})
		})
	}

	/**
	 * 路由跳转方法
	 * @param route 路由参数
	 * @returns Promise<void>
	 */
	const push = (route: Route | string): Promise<void> => {
		return new Promise((resolve, reject) => {
			try {
				const processedRoute = handleRoute(route)

				// 匹配路由
				matchToRoute(processedRoute)

				// 执行路由拦截器
				next()
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					.then((nextRes: Route | boolean[]) => {
						console.log('next--->', nextRes)
						routeTo(processedRoute)
							.then(() => {
								resolve()
								// 执行后置拦截器
								if (routeMeta.to && routeMeta.from) {
									callWithoutNext(afterEach, routeMeta.to, routeMeta.from)
								}
								// 处理路由重定向拦截
								nextRes.forEach((redirectRoute: Route) => {
									if (isObject(redirectRoute)) {
										const route = handleRoute({ type: 'navigateTo', ...redirectRoute })
										console.log(route)
										// 更新to路由信息
										matchToRoute(route)
										isOperateAPI = true
										push(route).catch((error) => {
											console.warn('重定向路由跳转失败:', error)
										})
									}
								})
							})
							.catch(reject)
					})
					.catch(reject)
			} catch (error) {
				reject(error)
			}
		})
	}

	router = {
		navigateTo(route: Route): Promise<void> {
			isOperateAPI = true
			return push({ ...route, type: 'navigateTo' })
		},
		switchTab(route: Route): Promise<void> {
			isOperateAPI = true
			return push({ ...route, type: 'switchTab' })
		},
		reLaunch(route: Route): Promise<void> {
			isOperateAPI = true
			return push({ ...route, type: 'reLaunch' })
		},
		redirectTo(route: Route): Promise<void> {
			isOperateAPI = true
			return push({ ...route, type: 'redirectTo' })
		},
		navigateBack(route?: BackParams): Promise<void> {
			isOperateAPI = true
			return push({ ...route, type: 'navigateBack' })
		},
		beforeEach(fn: BeforeEach): void {
			beforeEach.push(fn)
		},
		afterEach(fn: AfterEach): void {
			afterEach.push(fn)
		},
		routeMeta,
		install(app: any): void {
			app.mixin({
				onLaunch(options: any) {
					console.log('onLaunch', options)
					router.routeMeta.to!.query = { ...options.query, ...router.routeMeta.to!.query }
				},
				onLoad(options: any) {
					console.log('onLoad', options)
					router.routeMeta.to!.query = { ...options, ...router.routeMeta.to!.query }
				},
				onShow(options: any) {
					console.log('onShow', options)
					// app环境
					if (this.$mpType === 'app') {
						if (options?.query && router.routeMeta.to?.query) {
							router.routeMeta.to.query = {
								...options.query,
								...router.routeMeta.to.query
							}
						}
					}
					if (this.$mpType === 'page') {
						const page = getCurrentPage()
						const path = page?.$page?.fullPath
						if (path) {
							if (!isLaunch && !isOperateAPI) {
								push({ path, type: 'redirectTo', isLaunch: true })
							}
							if (isLaunch && !isOperateAPI && routeMeta.to?.path !== path) {
								push({ path, type: 'redirectTo', isLaunch: true })
							}
						}
						isLaunch = true
						isOperateAPI = false
					}
				}
			})
		}
	}
	return router
}

/**
 * 钩子函数 返回路由操作对象
 * @returns {Router}
 */
export const useRouter = (): Router => {
	if (!router) {
		throw new Error('路由还没初始化')
	}
	return router
}

/**
 * 钩子函数 返回当前路由对象
 * @returns Route
 */
export const useRoute = (): Route => {
	if (!router) {
		throw new Error('路由还没初始化')
	}

	if (router.routeMeta.to && Object.keys(router.routeMeta.to).length > 0) {
		return router.routeMeta.to
	}

	return { query: {}, path: '' }
}
