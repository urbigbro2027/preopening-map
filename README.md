# 筹建项目管理地图 ·  Pre-opening Project Map

专为酒店、餐饮、奶茶店、零售等多业态打造的筹建期单页项目管理工具。一屏看清哪些店在签约、哪些在施工、哪些已开业，按经理和状态分色。

> ⚠️ 本仓库内所有项目、经理姓名均为**示例数据**，与任何真实公司业务无关。

## 功能

- 中国地图标注项目，支持**按状态**或**按经理**双维度着色
- 每个项目 9 个字段：名称、经纬度、状态、筹建经理、签约日、备注、区域、节点日期
- 5 个筹建节点：踏勘 → 弱电施工 → 设备发货 → 弱电完工 → 筹建完工
- 状态筛选、经理筛选、标签常显/隐藏
- 地图上点选候选点直接建档，支持拖动校正坐标
- 数据存 `localStorage`，可导出 / 导入 JSON 备份
- PWA 支持：可"添加到主屏幕"，离线打开

## 快速开始

直接双击 `index.html` 即可运行。或起一个静态服务器（推荐，PWA 缓存需要 http 协议）：

```bash
python3 -m http.server 8080
# 打开 http://localhost:8080
```

## 目录结构

```
index.html              单文件应用（结构 + 样式 + 逻辑）
manifest.webmanifest    PWA 清单
sw.js                   Service Worker，离线缓存
icon-*.png              应用图标
vendor/leaflet.js|css   Leaflet 1.9 本地副本（不依赖 CDN）
```

## 技术栈

- **Leaflet 1.9**：地图渲染，已本地化到 `vendor/`，无外网 CDN 依赖
- **高德瓦片**：底图
- **原生 JavaScript**：无框架、无构建步骤、无 npm 依赖

## 数据结构

项目对象：

```js
{
  id: '1',
  name: '北京朝阳旗舰店',
  lng: 116.4864, lat: 39.9219,
  status: 'construction',   // contract | construction | operating | open | ...
  manager: '张明',
  date: '2026-03-12',       // 签约日
  note: '示例：核心商圈项目',
  loc: '北京 · 朝阳区',
  surveyDate: '', weakStart: '', shipDate: '', weakDone: '', finishDate: ''
}
```

改默认数据：编辑 `index.html` 里的 `DEFAULT_PROJECTS` 和 `DEFAULT_MANAGERS`。
清空浏览器数据即可让改动生效（或换一个浏览器 / 无痕窗口）。

## 说明

- 所有数据只存在浏览器本地，不上传任何服务器。
- 底图使用公开瓦片服务，离线时仅地图底图缺失，已缓存的项目数据仍可查看。
