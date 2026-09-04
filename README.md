# 音格

中古音韵格位、现代方言反射与日语汉字音的二维研究表。

## 当前实现

- React 19 + TypeScript + Vite
- TanStack Router、Query、Virtual
- Zustand
- 38 个中古声母、16 摄、566 个韵类条件行
- 3,804 个《广韵》音韵地位
- 格位详情、代表字、所属字、反切、小韵号、潘悟云 2023 音段分解与五度调值走向
- 北京、济南、上海、苏州、广州、厦门、福州的 58,313 条成员字读音，以及吴音、汉音、唐音分层；目标城市缺字时回退到同方言片的其他地点
- GitHub Pages 自动部署
- 音韵骨架与各方言层使用独立 JSON 文件按需加载，不打进应用 JavaScript；详情页只在打开反射总览时加载比较层

## 数据来源

- [`tshet-uinh`](https://github.com/nk2028/tshet-uinh-js)：《广韵》音韵地位与字表，MIT
- [`tshet-uinh-examples`](https://github.com/nk2028/tshet-uinh-examples)：潘悟云 2023 拟音，MIT
- [`zi.tools`](https://zi.tools/)：结构化方言读音 API；未发现明确的批量再发布许可证
- [古音小镜](http://www.kaom.net/si_yuwaiyin.php)：吴音、汉音、唐音查询；原站注明部分资料来自第三方

生成的数据保留来源标识。来源缺项和结构上不存在的声韵组合不会用推测值填充。

## 开发

```bash
npm ci
npm run dev
```

## 数据刷新

```bash
npm run data:refresh
```

- `data:qieyun` 从库生成完整中古音韵骨架
- `data:sources` 更新外部方言和日语读音快照

`data:sources` 默认从 zi.tools 方言目录动态发现北京片、冀鲁片、太湖片、广府片、闽南片和闽东片的地点，并批量查询全部 19,495 个《广韵》成员字。目标城市有记录时保持原记录；只有目标城市缺字时才采用同片其他地点。日语查询默认限制为 70 个代表字。可通过 `DIALECT_LIMIT` 和 `JAPANESE_LIMIT` 调整。外部站点批量查询前应确认许可并控制请求频率。

## 校验

```bash
npm run lint
npm run build
```

线上版本：https://rigelnana.github.io/dialect/
