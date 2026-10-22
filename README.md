# 岁序工坊 SuiWorks

> 岁有其序，作有其物。

岁序工坊是一个人的软件工坊，介绍和索引课思库、智链中枢、岁岁时光、岁音、岁岁食光小厨房与岁影。

正式项目采用 **Vue 3 + TypeScript + Vite SSG**。页面在构建期预渲染，生产服务器只需要 Nginx，不需要 Node、Java、MySQL 或 Redis。原型归档保留在 `docs/prototype/`。

## 本地运行

需要 Node.js 22.12+（建议 Node 22 LTS）与 npm。若使用 nvm，先执行 `nvm use`；当前终端若仍使用 Node 16，需要切换后再安装依赖。

```bash
npm ci
npm run dev
```

浏览器访问终端输出的本地地址，默认 `http://127.0.0.1:5173`。

## 构建与预览

```bash
npm run build
npm run preview
```

生产产物位于 `dist/`，预览默认地址为 `http://127.0.0.1:4173`。预览服务器遵循静态目录规则，不存在的页面返回 HTTP 404。

构建会执行类型检查、内容校验、SSG 和资源完整性检查，生成首页、关于页、六个作品详情页、404、robots.txt 与 sitemap.xml。页面正文无需 JavaScript 即可阅读；分类筛选、移动菜单与快捷预览由 Vue 增强。

## 打包部署

```bash
npm run package:deploy
```

输出 `artifacts/suiworks-<版本>.tar.gz`，包含 `web/` 静态产物、Nginx 模板、中文部署说明及版本元数据。不含 node_modules、SSH/TLS 私钥；打包不会连接或修改阿里云服务器。

正式上线前设置真实 HTTPS 域名，再重新打包：

```bash
SITE_URL=https://你的正式域名 RELEASE_ID=20261022-001 npm run package:deploy
```

未设置 `SITE_URL` 仍可运行与打包，生成的 robots 禁止收录，sitemap 为空，不输出虚构 canonical。域名确定后必须重新构建。

阿里云部署、Nginx 配置、原子版本切换和回滚步骤见 [deploy/README.md](deploy/README.md)。服务器只安装 Nginx，安装包下载继续指向各作品的 GitHub Releases。

## 内容维护

- 修改 [content/works.ts](content/works.ts) 维护作品、版本、能力和下载链接；类型在 `content/types.ts`。
- 品牌图放 `public/brand/`，截图放 `public/shots/`，数据中使用根路径引用。
- `available` 提供下载入口，`source` 提供源码，`soon` 只展示“即将开放”。
- 图标、版本与下载状态沿用原型；未收录截图的作品保留真实空状态，安装包以作品自身的 Releases 为准。
- 更新后重新构建并发布，不用修改数据库。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | Vite 开发服务器 |
| `npm run typecheck` | Vue 与 TypeScript 类型检查 |
| `npm run content:validate` | 作品内容、外链与素材校验 |
| `npm run build` | 完整静态构建与产物检查 |
| `npm run preview` | 生产产物预览与真实 404 |
| `npm run test:e2e` | 使用本机 Chrome 验证主要页面和交互（需先构建） |
| `npm run package:deploy` | 构建并生成阿里云部署包 |

## 工程结构

```text
content/          作品数据与类型
src/              Vue 页面、组件、路由与纸感样式
public/           品牌图标和截图
scripts/          内容/产物校验、预览与打包
tests/            浏览器端到端验证
deploy/           Nginx 模板与中文部署说明
docs/             原型、架构与设计文档
```

## 视觉与说明

沿用原型的纸感编辑风：暖白纸底、墨色正文、朱砂红强调、宋体大标题、编号区块及细线排版。支持手机、平板、桌面布局，保留快捷预览抽屉，并增加可直接刷新与分享的 `/work/<slug>/` 详情页。

“岁序工坊 / SuiWorks”与 Sui 公链、Mysten Labs 及其相关产品无关联。域名、备案、TLS 证书、正式品牌素材和许可证仍需上线前确定。

架构与资源预算见 [docs/architecture.md](docs/architecture.md)，架构图见 [docs/architecture/overview.html](docs/architecture/overview.html)，原型说明见 [docs/README.md](docs/README.md)。
