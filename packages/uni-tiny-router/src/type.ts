/**
 * Query 参数
 */
export interface Query {
	[key: string]: any
}

/**
 * 路由类型定义
 */
export interface Route {
	path?: string
	name?: string
	fullPath?: string
	query?: Query
	isLaunch?: boolean // 是否app运行初始化执行
	type?: string
	url?: string // 同path一样，兼容uni app字段
	[key: string]: any
}

/**
 * 分包的路由配置
 */
export interface SubPackages {
	root: string
	pages: Route
	[key: string]: any
}

/**
 * 初始化路由Options
 */
export interface CreateOptions {
	routes: Route[] // 路由配置
	subPackages?: SubPackages[]
	routeMethods?: string[] // 路由具有的方法
}

/**
 * 下一步回调函数
 */
export type Next = (value?: any) => void

/**
 * 路由跳转前拦截函数
 */
export type BeforeEach = (to: Route, from: Route, next: Next) => void

/**
 * 路由跳转后拦截函数
 */
export type AfterEach = (to: Route, from: Route) => void

/**
 * 返回参数
 */
export interface BackParams {
	delta?: number // 返回的页面数
	[key: string]: any
}

/**
 * 路由元数据
 */
export interface RouteMeta {
	to: Route | null
	from: Route | null
	[key: string]: any
}

/**
 * 路由实例
 */
export interface Router {
	navigateTo: (params: Route) => Promise<void>
	switchTab: (params: Route) => Promise<void>
	reLaunch: (params: Route) => Promise<void>
	redirectTo: (params: Route) => Promise<void>
	navigateBack: (params?: BackParams) => Promise<void>
	beforeEach: (beforeEach: BeforeEach) => void
	afterEach: (afterEach: AfterEach) => void
	install(App: any): void
	routeMeta: RouteMeta
}

/**
 * global
 */
declare global {
	let uni: any
	let getCurrentPages: () => any
}
