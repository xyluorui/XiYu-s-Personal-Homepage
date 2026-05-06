# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

静态个人主页，部署在 GitHub Pages。无框架、无打包工具——纯 HTML/CSS/JS + Python 3 构建脚本。站点语言为简体中文（zh-CN）。

## 构建与部署

```bash
# 生成所有 catalog.json（courses、articles、recommendations）
python3 scripts/build-catalog.py

# 本地预览
python3 -m http.server 8080
```

- 推送到 `main` 分支后 GitHub Actions 自动运行 `build-catalog.py` 并部署整个仓库到 Pages
- 无 Node.js/npm 依赖，`build-catalog.py` 仅使用 Python 标准库

## 架构

单页应用，由 `index.html` + `main.js` + `styles.css` 构成。页面分为 5 个全宽 tile section（深浅交替）：

`#hero`(parchment) → `#courses`(dark) → `#practice`(parchment) → `#picks`(dark) → `#about`(dark-2)

`main.js` 在 `DOMContentLoaded` 时并行 fetch 三个 catalog.json，动态渲染卡片并更新统计数字。

## 内容系统

三种内容类型，均遵循相同模式：在对应目录下创建子目录 + JSON 元数据文件，然后运行 `build-catalog.py`。

| 类型 | 目录 | 元数据文件 | 必须有 index.html |
|------|------|------------|-------------------|
| 课程 | `courses/<slug>/` | `course.json` | 是 |
| 文章 | `articles/<slug>/` | `article.json` | 仅当无 `url` 字段时 |
| 推荐 | `recommendations/<slug>/` | `recommendation.json` | 否（链接外部） |

## 设计系统

所有样式必须使用 `styles.css` 中 `:root` 定义的 CSS 自定义属性，这些 token 与 `DESIGN.md` 一一对应。禁止硬编码颜色值。

关键 token：
- 主色：`--primary: #0066cc`，暗色面上用 `--primary-on-dark: #2997ff`
- 面：`--canvas-parchment: #f5f5f7` / `--surface-tile-1: #272729` / `--surface-tile-2: #2a2a2c`
- 圆角：`--r-xs`(5px) 到 `--r-pill`(9999px)
- 响应式断点：1068px / 834px / 640px / 419px

## 预定义分类

文章分类 pill 仅支持：`工具`、`AI实践`、`教程`、`思考`、`项目`、`实验`（对应 `main.js` 中 `CAT_COLORS`）。

推荐标签 pill 仅支持：`开源`、`AI 工程`、`学习资源`、`工具`、`效率`（对应 `TAG_COLORS`）。新增分类/标签需同时更新 `main.js` 中的颜色映射。

## 课程构建

每门课程是 `courses/` 下的独立子目录，有自己的 HTML/CSS/JS。部分课程（如 webarena-course-zh）使用模块化编写流程：`_base.html` + `modules/*.html` + `_footer.html` 通过 `build.sh` 拼接为 `index.html`。构建中间产物已 gitignore，仅提交最终文件。

## 提交规范

提交信息使用英文，格式参考现有历史：`feat:`、`fix:`、`chore:`、`ci:` 等前缀。
