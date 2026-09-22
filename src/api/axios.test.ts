import { describe, it, expect, afterEach, vi } from 'vitest'
import { createServer, type Server, type ServerResponse } from 'node:http'
import instance from './axios'

// vitest 的 node 环境没有 localStorage，而请求拦截器每次都要读 token
vi.stubGlobal('localStorage', {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
})

const servers: Server[] = []

// 起一个本地服务：不调 res.end() 就把请求挂住，模拟跨境链路卡死直到客户端超时
const startStallingServer = (respond?: (res: ServerResponse) => void) =>
  new Promise<{ port: number; hits: () => number }>((resolve) => {
    let count = 0
    const server = createServer((_req, res) => {
      count += 1
      respond?.(res)
    })
    servers.push(server)
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address()
      resolve({ port: typeof addr === 'object' && addr ? addr.port : 0, hits: () => count })
    })
  })

afterEach(() => {
  servers.splice(0).forEach((s) => {
    s.closeAllConnections()
    s.close()
  })
})

describe('axios 实例的重试逻辑', () => {
  it('GET 超时后重试一次，服务端一共收到两次', async () => {
    const { port, hits } = await startStallingServer()

    await expect(instance.get(`http://127.0.0.1:${port}/x`, { timeout: 200 })).rejects.toBeTruthy()

    expect(hits()).toBe(2)
  })

  it('POST 超时不重试，服务端只收到一次', async () => {
    const { port, hits } = await startStallingServer()

    await expect(
      instance.post(`http://127.0.0.1:${port}/x`, {}, { timeout: 200 }),
    ).rejects.toBeTruthy()

    expect(hits()).toBe(1)
  })

  it('服务端返回 500 不重试，只收到一次', async () => {
    const { port, hits } = await startStallingServer((res) => {
      res.writeHead(500)
      res.end('boom')
    })

    await expect(instance.get(`http://127.0.0.1:${port}/x`, { timeout: 2000 })).rejects.toBeTruthy()

    expect(hits()).toBe(1)
  })
})
