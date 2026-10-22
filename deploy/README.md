# SuiWorks 静态部署（Alibaba Cloud Linux / Nginx）

本包适用于 Vue 3 + Vite SSG 纯静态站，不需要 Node.js 服务端进程。下面的服务器命令供管理员手工执行；打包脚本只操作本地文件，不连接服务器、不部署、不自动清理历史版本。

## 1. 本地构建与打包

需要 Node.js 22 LTS（建议 22.12+，同时满足项目所用 Vite 的版本要求）和系统 `tar`。在项目根目录执行已配置的 npm 命令（`package:deploy` 对应 `node scripts/package-deploy.mjs`）：

```bash
npm ci
npm run build
npm run package:deploy
```

`npm run package:deploy` 会先执行完整构建，再检查 `dist/index.html`、`dist/404.html` 并打包。SSG 页面输出为 `dist/work/slug/index.html`，支持 `/work/slug/`，不使用 SPA 首页兜底。底层脚本 `node scripts/package-deploy.mjs` 只打包现有 dist；日常发布应使用 npm 命令，确保产物与环境变量一致。

本地没有域名时可以不设置 `SITE_URL`。此时 release.json 的 siteUrl 为 null，可以生成离线检查包。**生产上线前必须确定真实域名，设置 SITE_URL 重新构建，再用相同 SITE_URL 打包**，以便构建工具生成正确的 canonical、站点地图、Open Graph 等绝对链接。只在打包时设置 SITE_URL 不会改写已有 HTML。

```bash
SITE_URL=https://www.example.com npm run build
SITE_URL=https://www.example.com RELEASE_ID=20261022-001 npm run package:deploy
```

SITE_URL 只接受 HTTPS 站点根地址，不允许凭据、子路径、查询或片段。RELEASE_ID 可选，必须以 ASCII 字母或数字开头，总长 1–96 位，只包含字母、数字、`.`、`_`、`-`。不允许 `/`、空格或目录穿越。省略时生成 UTC 时间、Git 短提交（无 Git 则为 nogit）及随机后缀组成的版本。

输出为 `artifacts/suiworks-<version>.tar.gz`，同名文件存在时失败，不覆盖。脚本确认项目根目录存在后创建 artifacts。归档仅包含：

- `web/`：dist 静态文件；不含 macOS `.DS_Store`。
- `nginx/http.conf`、`nginx/tls.conf`、`nginx/security-headers.conf`。
- `README.md`：本文。
- `release.json`：版本、package.json 的 appVersion（可为空）、打包时间、SITE_URL、Git 提交及工作区状态（无 Git 为 null）。

脚本拒绝符号链接、特殊文件、源码扩展名、source map、node_modules、常见密钥文件及带 PEM 私钥标记的文件。请确保 dist 本身仅含公开构建产物，不要将源码、账号、环境文件或任意格式的秘密复制到 public/dist。私钥仅在服务器上管理，不放入项目和部署包。

## 2. Alibaba Cloud Linux 安装 Nginx

下面使用 Alibaba Cloud Linux 3（ALinux 3）的系统软件源，需有 sudo 权限；其他版本需先确认对应软件源可用。

```bash
sudo dnf install -y nginx
sudo systemctl enable --now nginx
sudo install -d -m 755 /opt/suiworks/releases /etc/nginx/snippets
```

在云安全组放行所需的 TCP 80/443。若已启用 firewalld，再按实际需要允许 http/https；不要为上线关闭防火墙或 SELinux。若 SELinux enforcing 且有拒绝访问，检查审计日志，按系统工具给 `/opt/suiworks` 设置可被 httpd 读取的持久文件上下文（通常为 httpd_sys_content_t）。确保 Nginx 用户对所有父目录有执行权限，对静态文件有读权限。

## 3. 上传与解包到新版本目录

先在本地人工核对归档目录，随后上传。以下版本号与主机名均需替换为实际值：

```bash
tar -tzf artifacts/suiworks-20261022-001.tar.gz
scp artifacts/suiworks-20261022-001.tar.gz deploy@your-server:/tmp/
```

登录服务器后，在 Bash 中执行。只解包由自己构建并可信的归档，核对 release.json 与预期版本一致。`mkdir` 故意不带 `-p`，如果版本已存在应停止，改用新版本号，避免覆盖历史版本。

```bash
set -e
VERSION=20261022-001
[[ "$VERSION" =~ ^[A-Za-z0-9][A-Za-z0-9._-]{0,95}$ ]]
BASE=/opt/suiworks
sudo mkdir -m 755 "$BASE/releases/$VERSION"
sudo tar --no-same-owner -xzf "/tmp/suiworks-$VERSION.tar.gz" -C "$BASE/releases/$VERSION"
sudo chmod -R a+rX "$BASE/releases/$VERSION"
sudo test -f "$BASE/releases/$VERSION/web/index.html"
sudo test -f "$BASE/releases/$VERSION/web/404.html"
sudo less "$BASE/releases/$VERSION/release.json"
```

首次上线可先切换 current，再安装配置。后续发布只需要切换 current；不要每次都复制 Nginx 配置。

## 4. 原子切换 current

同一服务器上的发布和回滚应串行执行。先记下 current 的旧目标供回滚；首次发布没有旧目标是正常情况。

```bash
readlink /opt/suiworks/current || true
```

使用新临时软链加 GNU `mv -T` 原子替换 current，临时软链与 current 位于同一目录、同一文件系统。不要直接对 current 执行普通 `ln -sfn`，也不要预先删掉 current。

```bash
set -e
VERSION=20261022-001
[[ "$VERSION" =~ ^[A-Za-z0-9][A-Za-z0-9._-]{0,95}$ ]]
BASE=/opt/suiworks
sudo test -f "$BASE/releases/$VERSION/web/index.html"
NEXT="$BASE/.current-$VERSION-$$"
sudo ln -s "releases/$VERSION" "$NEXT"
sudo mv -Tf "$NEXT" "$BASE/current"
```

current 应当是软链，若同名真实目录存在请人工检查，不要删除目录来强行切换。**常规静态版本发布无需 reload Nginx**：Nginx 根据 current 读取文件；模板未启用 open_file_cache。原子切换保证单次路径解析看到有效版本，但页面和资源的多个请求并非一个事务；旧页面的哈希资源若新包已不含，可能 404，应结合访问情况在新 dist 保留仍需服务的旧哈希资源。旧 release 目录保留用于手工回滚。

## 5. 首次安装或修改 Nginx 配置

HTTP 示例可按 IP 或本地域名验证。检查 `/etc/nginx/nginx.conf` 是否 include `/etc/nginx/conf.d/*.conf`，处理系统默认站点和 default_server 冲突。

```bash
sudo install -m 644 /opt/suiworks/current/nginx/security-headers.conf /etc/nginx/snippets/suiworks-security-headers.conf
sudo install -m 644 /opt/suiworks/current/nginx/http.conf /etc/nginx/conf.d/suiworks.conf
sudo nginx -t
sudo systemctl reload nginx
```

只有 `nginx -t` 成功后才能 reload（逐条执行并检查退出状态，或在 `set -e` 下执行）。不要同时启用 HTTP 和 TLS 两套站点模板。TLS 模板中的 `example.invalid`、证书与私钥路径都是占位符；先将模板复制到服务器上的临时文件，替换所有占位域名和路径，准备有效证书，再安装为 `/etc/nginx/conf.d/suiworks.conf`，测试并 reload。证书、续签和私钥权限由服务器管理员维护；部署包不包含证书或私钥。

模板的 root 为 `/opt/suiworks/current/web`。`try_files $uri $uri/ =404` 使 `/work/slug/` 读取目录下的 index.html，缺失页面返回真实 404，并通过 `error_page 404 /404.html` 展示静态错误页。HTML 和普通文件使用 `Cache-Control: no-cache`；只有 assets 下带内容哈希的资源使用一年 immutable 缓存，错误响应不加长期缓存。安全头放入公共片段，声明缓存头的 location 再次 include，避免 Nginx 的 add_header 继承规则使安全头丢失。修改模板时也要遵守此规则。

检查首页、一个真实 SSG 页面和不存在的路径，确认响应码、缓存头和安全头：

```bash
curl -I http://127.0.0.1/
curl -I http://127.0.0.1/work/实际slug/
curl -I http://127.0.0.1/definitely-missing-page
```

TLS 上线后对真实 HTTPS 域名重复检查，并用一个实际 `/assets/文件名-哈希.js` 地址检查长期缓存。不存在的页面应返回 404 而非 200；HTML 应含 no-cache，哈希资源应含 max-age=31536000 和 immutable。

## 6. 手工回滚

选定此前保留的 release，核对其 release.json，使用相同的原子软链切换步骤，将 VERSION 改为旧版本。回滚完成后用 curl 验证页面。仅切换静态版本不需要 reload；若同时回滚 Nginx 配置，则恢复匹配的配置后，先 `nginx -t` 成功，再 reload。

脚本和以上流程均不自动删除 release 目录或旧归档。磁盘清理由管理员另行评估当前版本、回滚窗口及资源依赖后手工处理。
