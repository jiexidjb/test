import fs from 'fs'

const dir = 'public/policies/government'
const files = fs
  .readdirSync(dir)
  .filter((f) => f.toLowerCase().endsWith('.pdf'))
  .sort((a, b) => a.localeCompare(b, 'zh-CN'))

const out = `// 云南省政府门户网站公开的旅居相关政策原文（存放于 public/policies/government）
export const GOVERNMENT_POLICIES = [
${files.map((f) => `  ${JSON.stringify(f)}`).join(',\n')}
]

/** 去掉 .pdf 与「_文件_云南省人民政府门户网站」这类来源后缀，得到可展示的标题 */
export function policyTitle(file) {
  return file.replace(/\\.pdf$/i, '').split('_')[0].trim()
}
`

fs.writeFileSync('src/data/policies.js', out, 'utf8')
console.log('wrote', files.length, 'policies')
