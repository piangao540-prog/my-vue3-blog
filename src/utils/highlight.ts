// highlight.js 完整包带约 190 种语言的语法定义（lib/languages 目录约 1.5MB），
// 但博客里只会出现少数几种。从 lib/core 引入并只注册需要的语言，
// 能把这块产物体积降一个数量级。
//
// 各语言模块自带别名（javasript 带 js/jsx，typescript 带 ts/tsx，
// xml 带 html，bash 带 sh，yaml 带 yml，python 带 py，markdown 带 md），
// 所以 markdown 里写这些名字都能正确高亮，不需要额外注册。
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import sql from 'highlight.js/lib/languages/sql'
import yaml from 'highlight.js/lib/languages/yaml'
import markdown from 'highlight.js/lib/languages/markdown'
import python from 'highlight.js/lib/languages/python'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('css', css)
hljs.registerLanguage('json', json)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('python', python)

// xml 已经覆盖 html，但 ```vue 这个写法 hljs 不认识，补一个别名
hljs.registerAliases(['vue'], { languageName: 'xml' })

export default hljs
