import axios from "@/api/axios"

// 页面访问统计
export const trackPageView = (page: string) => {
    axios.post('/analytics', {
        page,
        event: 'pageview',
        data: {
            referrer: document.referrer,
            url: window.location.href,
            timestamp: Date.now()
        }
    })
}

// js错误上报
export const setupErrorTacking = () => {
    window.onerror = (message, source, line, col, error) => {
        axios.post('/analytics', {
            page: window.location.pathname,
            event: 'error',
            data: { message, source, line, col, stack: error?.stack }
        })
    }
}