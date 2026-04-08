# Girls Band Animation 旧版网站说明

这是项目最初的站点版本，网站主体位于仓库根目录，围绕四部少女乐队作品展开：

- `轻音少女`
- `孤独摇滚`
- `MyGO!!!!!`
- `Girls Band Cry`

这一版保留了课程实验时期的原始结构和功能模块，页面数量较多，风格也更偏“功能集合站”。如果你想看后续重构后的并行版本，请查看 [stage-reimagined/README.md](/Users/29840/Desktop/homework/Web/Web/stage-reimagined/README.md)。

## 站点定位

旧版网站的核心目标是：

- 提供一个少女乐队主题的综合展示入口
- 为四支乐队分别提供独立详情页和歌曲播放功能
- 保留登录、内容编辑、小游戏等课程实验功能
- 作为原始版本基线，为后续新版重设计提供参照

## 主要页面

### 1. 首页

- 入口文件：`index.html`
- 主要内容：
  - 首页轮播图
  - 乐队卡片与跳转入口
  - 主题切换
  - 搜索区域
  - 若干推荐与信息展示模块

### 2. 四个乐队详情页

- `k-on/index.html`
- `bocchi/index.html`
- `mygo/index.html`
- `gbc/index.html`

每个页面都配有：

- 乐队主题内容展示
- 本地音乐播放器
- 播放列表切换
- 对应作品图片与介绍内容

### 3. 乐队搭配小游戏

- `bandgame/index.html`

这是旧版站里比较完整的互动模块之一，允许用户从不同作品中选择成员进行搭配。

### 4. 登录与编辑功能

- `login.html`
- `editor.html`
- `server.js`

其中 `editor.html` 依赖本地 Express 服务，通过 `POST /api/replace-file` 实现文件替换，属于课程实验性质的内容管理功能。

### 5. 其他实验页面

以下页面是项目开发过程中保留下来的扩展或课程实验内容，和少女乐队主站风格并不完全一致：

- `about.html`
- `canvas.html`
- `entrez.html`

如果你的使用目标是浏览少女乐队站点主体，可以优先从 `index.html`、四个乐队子页和 `bandgame/index.html` 开始。

## 技术结构

旧版网站主要由以下技术组成：

- 原生 `HTML / CSS / JavaScript`
- `jQuery`
- `Font Awesome`
- `Node.js + Express`（用于本地编辑接口）

## 关键目录与文件

```text
Web/
├─ index.html                 # 旧版首页
├─ styles.css                 # 全站主样式
├─ script.js                  # 首页与通用交互
├─ login.html                 # 登录页
├─ editor.html                # 内容编辑页
├─ server.js                  # 本地 Express 服务
├─ bandgame/
│  └─ index.html              # 乐队搭配小游戏
├─ k-on/
│  ├─ index.html
│  └─ music-player.js
├─ bocchi/
│  ├─ index.html
│  └─ music-player.js
├─ mygo/
│  ├─ index.html
│  └─ music-player.js
├─ gbc/
│  ├─ index.html
│  └─ music-player.js
├─ images/                    # 图片资源
├─ music/                     # 公共音乐资源
└─ stage-reimagined/          # 新版并行重构站点
```

## 运行方式

### 方式一：静态预览

适合浏览大部分页面。

在仓库根目录执行：

```bash
python -m http.server 8000
```

然后访问：

```text
http://localhost:8000/index.html
```

项目中也保留了一个批处理脚本：

```text
start_server.bat
```

### 方式二：启动本地编辑接口

如果你要使用 `editor.html` 对文件进行替换操作，需要启动 Node 服务。

安装依赖并运行：

```bash
npm install
npm start
```

默认地址：

```text
http://localhost:3000
```

## 旧版特征与注意事项

- 这是原始版本，页面风格存在明显的“逐步迭代痕迹”
- 少女乐队主站内容和部分课程实验页面共存，整体信息架构较混合
- 音乐与图片资源较多，仓库体积较大
- 建议使用本地 HTTP 服务访问，不要直接双击 `html` 文件使用 `file://` 打开
- 若只想体验重设计版本，请进入 `stage-reimagined/index.html`

## 适合的使用场景

- 查看项目最初的设计和功能组织方式
- 对比旧版与新版重构思路
- 继续维护原始课程项目结构
- 复用原站中的音乐播放、乐队页和小游戏模块

## 对应的新版本

新版并行重构站点位于：

- [stage-reimagined/README.md](/Users/29840/Desktop/homework/Web/Web/stage-reimagined/README.md)
- 入口页：`stage-reimagined/index.html`

