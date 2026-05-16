// 底部信息
export interface TechStack {
  name: string
  level: string
}

export interface ContactInfo {
  icon: string
  text: string
  link: string
}

export const mockTechStack: TechStack[] = [
  { name: 'Vue3', level: '熟练' },
  { name: 'TypeScript', level: '熟练' },
  { name: 'JavaScript', level: '熟练' },
  { name: 'Node.js', level: '熟练' },
  { name: 'Pinia', level: '掌握' },
  { name: 'ElementPlus', level: '了解' },
]

export const mockContactInfo: ContactInfo[] = [
  { icon: 'User', text: 'GitHub', link: 'https://github.com/piangao540-prog' },
  { icon: 'Message', text: 'Email', link: 'mailto:piangao540prog@qq.com' },
  { icon: 'MapLocation', text: '城市', link: '#' },
]