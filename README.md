# 一只萨摩耶的博客 — 静态站点

本目录由 `hexo generate` 自动生成，是博客的最终静态站点文件，直接部署到 GitHub Pages。

> **请勿手动编辑此目录下的文件**，所有修改应在 `source/` 中完成后重新生成。

## 目录结构

```
public/
├── 2025/08/27/          # 文章页面（按日期归档）
│   ├── C++/             # C++ 笔记
│   ├── Go/              # Go 笔记
│   ├── Mysql/           # MySQL 笔记
│   ├── Redis/           # Redis 笔记
│   ├── RabbitMq/        # RabbitMQ 笔记
│   ├── ZooKeeper/       # ZooKeeper 笔记
│   ├── Top-K/           # Top-K 问题
│   ├── 计算机网络/       # 网络笔记
│   ├── 操作系统/         # OS 笔记
│   ├── 数据结构/         # 数据结构笔记
│   ├── 排序算法/         # 排序算法笔记
│   ├── 设计模式/         # 设计模式笔记
│   ├── 系统设计/         # 系统设计笔记
│   ├── 红包算法与随机数/  # 红包算法笔记
│   └── 可视化系统监控/   # 监控方案笔记
├── archives/            # 归档页面
├── categories/          # 分类页面
│   ├── 语言/            # 编程语言类
│   ├── 四件套/          # 核心基础类（网络、OS、数据结构、算法）
│   ├── 中间件/          # 中间件类（Redis、MQ、ZK）
│   ├── 设计/            # 设计类（设计模式、系统设计）
│   ├── 其它/            # 其它
│   └── 奇闻轶事/        # 趣味话题
├── intro1/              # 首页入口
├── images/              # 文章图片（574 张）
├── css/                 # 样式文件
├── js/                  # 脚本文件
├── lib/                 # 第三方库（anime.js、Font Awesome、Velocity）
├── content.json         # 站点内容 JSON
├── search.xml           # 本站搜索索引
├── atom.xml             # RSS 订阅源
└── index.html           # 根页面
```

## 统计

- **文章数**: 15 篇
- **分类**: 6 个（语言、四件套、中间件、设计、其它、奇闻轶事）
- **图片**: 574 张
- **主题**: NexT
- **第三方库**: anime.js、Font Awesome、Velocity.js

## 重新生成

```bash
hexo clean && hexo generate
```

## 部署

```bash
hexo deploy
```
