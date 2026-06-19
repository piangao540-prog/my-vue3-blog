// 底部信息
export interface TechStack {
  name: string
}

export interface ContactInfo {
  icon: string
  text: string
  link: string
}

export const mockTechStack: TechStack[] = [
  { name: 'Vue3'},
  { name: 'TypeScript'},
  { name: 'Express'},
  { name: 'Echarts'},
  { name: 'Pinia'},
  { name: 'MySQL'},
]

export const mockContactInfo: ContactInfo[] = [
  { icon: 'User', text: 'GitHub', link: 'https://github.com/piangao540-prog' },
  { icon: 'Message', text: 'Email', link: 'mailto:piangao540prog@qq.com' },
  { icon: 'MapLocation', text: '城市', link: '#' },
]