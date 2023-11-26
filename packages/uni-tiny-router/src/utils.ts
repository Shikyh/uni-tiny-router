/**
 * 是否是对象
 * @param data
 * @returns Boolean
 */
export const isObject = (data: any): data is Record<string, any> => {
	return data !== null && typeof data === 'object' && !Array.isArray(data)
}

/**
 * 是否是数组
 * @param data
 * @returns Boolean
 */
export const isArray = (data: any): data is any[] => {
	return Array.isArray(data)
}

/**
 * 是否是字符串
 * @param data
 * @returns Boolean
 */
export const isString = (data: any): data is string => {
	return typeof data === 'string'
}

/**
 * 深拷贝
 * @param data
 * @returns
 */
export const deepClone = <T>(data: T): T | null => {
	if (typeof data !== 'object' || data === null) return null
	try {
		return JSON.parse(JSON.stringify(data))
	} catch (error) {
		console.warn('深拷贝失败:', error)
		return null
	}
}
