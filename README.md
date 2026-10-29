# kukuzhilove · AI 个人档案

一份给 GitHub Pages 用的静态个人主页。深色，中文为主，带少量英文小标签。访客能看到的句子都写在仓库根目录的 [`content.json`](content.json) 里，改文案不用动布局。

启用 Pages 之后的地址：

**https://kukuzhilove.github.io/ai-portfolio/**

## 启用 GitHub Pages

仓库需要保持 **Public**。

1. 打开这个仓库，进入 **Settings**。
2. 左侧选择 **Pages**。
3. 在 **Build and deployment** 里，把 **Source** 设为 **Deploy from a branch**。
4. **Branch** 选 **main**，文件夹选 **/ (root)**。
5. 保存。

首次发布通常要一分钟左右。打开上面的地址即可。如果短时间是 404，等部署完成后再刷新。

如果 Source 现在是 **GitHub Actions**，请改回 **Deploy from a branch**。本仓库没有构建流程，`index.html` 就在 `main` 的根目录。根目录的 `.nojekyll` 会让 Pages 直接提供这些文件，不经过 Jekyll。

## 修改文案

只编辑 `content.json`，提交并推送到 `main`。Pages 会更新同一个网址。浏览器如果还显示旧句子，强制刷新一次。

请只写真实的内容。不要填不存在的雇主、数据或个人邮箱。还没有的联系方式就先留空；现在的联络只指向 [GitHub](https://github.com/kukuzhilove)。

`placeholder` 为 `true` 的条目会在页面上显示「占位」。换成你自己的话之后，把该字段改成 `false`，标记就会消失。删掉用不到的工具或项目卡片即可，页面会跟着变。

| 字段 | 作用 |
| --- | --- |
| `profile.displayName` | 页面上的名字，默认 `kukuzhilove` |
| `profile.avatarUrl` | 头像地址，默认使用 GitHub 头像 |
| `profile.githubUrl` | GitHub 主页 |
| `hero.tagline` / `hero.lead` | 首屏的一句话和补充说明 |
| `hero.primaryCta` | 主按钮文字和链接 |
| `about` | 「关于」的段落和侧栏短句 |
| `tools.items` | 工具卡片，可增删 |
| `projects.items` | 项目。`href` 请填打得开的真实链接 |
| `contact.links` | 联络链接。以后有新的公开链接，按同样格式追加一条 |
| `nav` | 顶部导航 |
| `footer` | 页脚 |
| `meta.title` / `meta.description` | 浏览器标签标题和简介 |

聊天软件里的链接预览读的是 `index.html` 开头的 `<title>` 和 `description`，不是 `content.json`。日常改页面句子只动 `content.json`；若要改分享卡片上的标题，再改 `index.html` 里对应的两行。

链接只接受 `http`、`https`、`mailto`，以及站内的 `#about` 这种锚点。

## 本地预览

在仓库目录执行：

```bash
python3 -m http.server 8080
```

浏览器打开 http://localhost:8080

不要直接双击 `index.html`。以文件方式打开时，浏览器会拦截对 `content.json` 的读取。

## 文件

| 文件 | 作用 |
| --- | --- |
| `content.json` | 全站文案 |
| `index.html` | 页面骨架 |
| `styles.css` | 样式 |
| `main.js` | 读取配置并渲染页面 |
| `fonts/` | 标题字体 Noto Serif SC，英文小标签字体 DM Mono |
| `favicon.svg` | 站点图标 |

两套字体都使用 [SIL Open Font License](fonts/OFL-Noto-Serif-SC.txt)。许可证原文在 `fonts/OFL-Noto-Serif-SC.txt` 和 `fonts/OFL-DM-Mono.txt`。

页面支持键盘操作、跳到正文、系统「减少动态效果」，以及手机窄屏。
