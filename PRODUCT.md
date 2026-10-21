# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + TypeScript + Vite（用户确认）；本地服务 `scripts/serve.py`（Python 标准库）
提供静态托管与 `/dl/` 下载端点；数据 `data/videos.enriched.json` 运行时加载。

## Users

运营者本人：为自有自媒体账号（抖音等）寻找、筛选、复刻或转发 AI 代码动画视频
素材。中文界面。

## Product Purpose

703 条 prompt 数据集成本地运营的素材工作站。
最高频动作：刷视频找灵感抄 prompt；下载 mp4 做二创发布。

## Positioning

不是只读列表——每条素材带原文 prompt、可播视频、本地下载与镜像，
是把"别人的爆款"变成"我的待发素材"的流水线入口。

## Operating Context

本机 Windows + Edge，PowerShell 启动 `serve.py` 后浏览器使用；
视频媒体来自 Skillry CDN 或本地 `media/` 镜像；部分素材只有 X 原帖。

## Capabilities and Constraints

- 浏览/筛选/搜索 703 条素材；悬停预览、详情并排播放、全屏
- 复制 prompt / 分享文案；下载 mp4（serve.py 代理强制附件下载）
- 本地镜像状态显示；导出筛选结果
- 运营状态（备选/已发）与备注为轻量本地存储，不做多用户/后端
- 285 条素材无托管 mp4，仅原帖链接

## Brand Commitments

深色媒体库气质（用户指定，参考 Plex/Jellyfin）；文字可读性优先于装饰。

## Product Principles

- 素材是主角：画面最大，文字层级清晰可扫读
- 每个动作一键可达：复制、下载、标记不绕路
- 本地优先：能离线就离线，远程只是回退
