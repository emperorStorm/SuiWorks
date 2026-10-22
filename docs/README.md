# SuiWorks 原型说明

岁序工坊 SuiWorks 的静态 HTML 原型，用于保留视觉方向、信息结构与交互验收基线。正式站已采用 Vue 3 + TypeScript + Vite SSG，构建为静态文件并由 Nginx 托管；无需后端、数据库或 Redis。

## 原型入口

- 页面：[`prototype/index.html`](prototype/index.html)
- 直接打开：`open docs/prototype/index.html`
- 本地服务器（推荐）：

```bash
python3 -m http.server 4310 --directory docs/prototype
# http://127.0.0.1:4310/
```

原型只使用 HTML、CSS 与原生 JavaScript，无需安装依赖；不加载网络字体、第三方图片或 CDN 资源，因此 `file://` 与本地 HTTP 两种方式均可使用。

## 本轮目标

1. 确认“纸感编辑风”的视觉基调与品牌印记方向。
2. 确认六件作品在门户中的呈现顺序、分类与能力摘要。
3. 验证“单页 + 右侧详情抽屉”的信息架构，以及筛选、深链接、移动端菜单等关键交互。
4. 为正式项目沉淀稳定的作品数据字段与页面结构。

本目录原型**不包含** `server/`、数据库、接口或 Vue 构建工程；正式工程位于项目根目录。

## 页面结构

| 区块 | 内容 |
| --- | --- |
| Header | 品牌、01 作品 / 02 下载 / 03 关于锚点、GitHub 外链；移动端折叠菜单 |
| Hero | 眉题、主标题「岁有其序，作有其物。」、简介、统计、CTA、竖排题记与朱砂印记 |
| 01 作品 | 编号区块标题、形态筛选、六张作品卡片 |
| 02 下载与入口 | 账本式索引表：作品、形态、版本、获取 |
| 03 关于 | 工坊自述、三条原则、正式版技术栈说明、GitHub 入口 |
| Footer | 品牌、题记、导航、版权与原型版本 |
| 详情抽屉 | 作品简介、六项能力、平台与形态、技术栈、界面截图、下载 / GitHub / 在线原型 |

作品分类按**主要使用形态**归类，每件作品只计一次：

- 桌面端 3：课思库、岁岁时光、岁影
- 移动端 2：岁音、岁岁食光小厨房
- Web 服务 1：智链中枢

多端能力仍然完整展示在卡片平台行与详情抽屉中。

## 视觉规范

```css
--paper: #f5efe3;      /* 纸底 */
--card: #fbf7ee;       /* 卡片 */
--paper-deep: #ede3d2; /* 深纸色 */
--ink: #211d18;        /* 墨色 */
--cinnabar: #b33a2b;   /* 朱砂 */
--pine: #2e5a4c;       /* 松绿 */
--gold: #b0823f;       /* 赭金 */
```

- 中文标题使用宋体（Songti SC / Noto Serif SC），英文衬线使用 Iowan Old Style 系列，编号与版本使用等宽字体。
- 编号区块 `01 / 作品 / SELECTED WORKS`、`02 / 下载 / DOWNLOADS`、`03 / 关于 / ABOUT`。
- 纸底叠加低透明噪点与柔和径向光；产品主色只用于图标淡底、卡片 3px 顶线和少量标记。
- 形状克制：标签 2px、按钮 4px、卡片与抽屉 6px；不使用大圆角与玻璃拟态。

## 交互行为

### 筛选

- 四个筛选项：全部 6 / 桌面端 3 / 移动端 2 / Web 服务 1。
- 按钮使用 `aria-pressed` 表示状态，结果数量通过 `aria-live="polite"` 播报。
- 筛选只改变卡片显隐，不改变下载索引表。

### 详情抽屉

- 使用原生 `<dialog>` 与 `showModal()`，桌面右侧宽 `min(560px, 94vw)`，移动端全屏。
- 关闭方式：右上角按钮、ESC、点击遮罩；关闭后焦点回到触发的卡片按钮。
- 打开时锁定页面滚动，焦点移到抽屉标题；原生 dialog 负责焦点陷阱。
- 深链接 `#product=<slug>`：首屏解析并打开；打开时写入 hash，关闭时清理；支持浏览器后退关闭。
- 无效 slug 静默忽略，不打开抽屉。

### 下载状态

| 状态 | 界面表现 |
| --- | --- |
| `available` | 下载链接，统一指向对应 GitHub Releases |
| `source` | “获取源码”，指向仓库主页 |
| `soon` | “即将开放”，不可交互标签，不设置 `href="#"` |

课思库额外提供在线原型入口，指向 `https://emperorStorm.github.io/coscool/prototype/`。

### 其他

- 移动菜单支持点击外部、ESC、点击导航项关闭，并维护 `aria-expanded`。
- 滚动进入动画使用 IntersectionObserver，并增加快速滚动兜底，避免区块停留在隐藏状态。
- `prefers-reduced-motion: reduce` 下禁用位移动画与平滑滚动，内容直接可见。
- 整卡点击通过独立遮罩按钮实现，操作按钮为兄弟节点，避免嵌套交互；键盘用户使用“详情”按钮打开抽屉。

## 响应式

| 断点 | 布局 |
| --- | --- |
| > 1080px | 三列卡片；Hero 双栏；关于区左栏吸顶 |
| 761–1080px | 两列卡片；关于区单栏 |
| ≤ 760px | 单列卡片；导航折叠；下载表转为堆叠行；抽屉全屏 |
| ≤ 420px | 筛选按钮与卡片操作按钮拉伸为双列 |

已在 1440、768、375 三档检查，均无横向滚动。

## 文件说明

```text
docs/prototype/
├── index.html                 # 语义骨架，卡片与表格由 JS 渲染
└── assets/
    ├── css/styles.css         # 设计变量、版式、组件、响应式与动效
    ├── js/products.js         # window.SUIWORKS_PRODUCTS，唯一数据源
    ├── js/app.js              # 渲染、筛选、抽屉、深链接、菜单、揭示动画
    ├── brand/                 # 岁序工坊印记、六件作品图标
    └── shots/                 # 岁音、岁岁时光、厨房界面截图
```

`products.js` 与 `app.js` 均以经典脚本加载，不依赖模块系统，保证 `file://` 下可用。

## 更新作品数据

1. 在 `assets/js/products.js` 中新增或修改作品对象，字段包括：`slug`、`nameZh`、`nameEn`、`version`、`category`、`localFirst`、`tagline`、`summary`、`features`、`featureTags`、`platforms`、`stack`、`accent`、`accentSoft`、`logo`、`logoAlt`、`shots`、`links`、`download`。
2. 将图标放入 `assets/brand/`，截图放入 `assets/shots/`；截图数据需带 `width` 与 `height`。
3. 刷新页面即可，无需构建；筛选计数、首页统计、下载表与详情抽屉会同步更新。

## 正式项目实现

原型确认后，纯静态工程已落地：

```text
SuiWorks/
├── content/  # 作品内容与类型
├── src/      # Vue 3 页面、组件、路由与样式
├── public/   # 品牌图标与截图
├── scripts/  # 内容/产物检查、预览与部署归档
├── tests/    # Chrome 端到端验证
├── deploy/   # Nginx 模板与部署说明
└── docs/     # 原型与架构文档
```

- Vue 3 将原型拆为首页、六个作品详情页和关于页，同时保留原生 dialog 快捷预览。
- `content/works.ts` 是正式站唯一作品数据源，构建期生成详情页、下载索引和页面元数据。
- Vite SSG 在本地或 CI 生成静态产物；服务器只通过 Nginx 托管，不安装 Node 运行时。
- `npm run package:deploy` 生成包含 `web/`、Nginx 模板、部署说明和版本元数据的归档。
- 不创建 `server/`，不安装 MySQL 或 Redis；需要在线编辑、用户账号或跨设备同步时再评估后端。

完整方案见 [`architecture.md`](architecture.md)，可视化架构图见 [`architecture/overview.html`](architecture/overview.html)。

## 验收记录

2026-10-22，使用 Chrome 155（headless，1440 / 768 / 375 视口）完成以下检查：

- 六张卡片完整渲染；筛选计数为 6 / 3 / 2 / 1；首页统计为 6 / 7 / 4。
- 下载表六行；Releases、源码、即将开放与在线原型状态正确；外链均为 `noopener noreferrer`。
- 六张截图加载成功；课思库、智链中枢、岁影显示“暂无界面截图”占位。
- 抽屉可通过卡片、「详情」按钮与深链接打开；ESC、遮罩、关闭按钮均可关闭，焦点返回触发按钮。
- `#product=suimelody` 首屏直接打开；浏览器后退可关闭；无效 slug 不打开抽屉。
- 移动菜单可通过按钮、ESC、点击外部与导航项关闭。
- `file://` 与 HTTP 两种方式均可运行，抽屉与 hash 行为正常。
- 三档视口无横向滚动；无控制台错误、无资源 404、无第三方请求。
- 减少动效模式下，内容直接可见且无位移动画。

## 已知限制与待确认

- 真实安装包、官网地址与下载托管尚未接入。
- 岁序工坊印记与岁岁食光小厨房标志为占位素材。
- 课思库、智链中枢、岁影暂无门户用界面截图，使用统一留白占位，不伪造素材。
- 尚未配置 SEO 分享图、统计分析与正式许可证。
- 岁序工坊名称与 Sui 公链无关联，详见根目录 [`README.md`](../README.md)。
