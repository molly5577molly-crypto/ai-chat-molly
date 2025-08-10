# 部署说明 - 解决 MIME 类型错误

## 问题描述
在部署后可能遇到以下错误：
```
Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.
```

## 解决方案

这个问题是因为 Web 服务器没有正确配置 JavaScript 模块的 MIME 类型。我已经为不同的部署平台创建了相应的配置文件：

### 1. Netlify 部署
- 使用 `public/_headers` 文件
- 已自动包含在构建输出中
- 无需额外配置

### 2. Vercel 部署
- 使用根目录下的 `vercel.json` 文件
- 已配置正确的 MIME 类型头
- 部署时会自动应用

### 3. Apache 服务器
- 使用 `public/.htaccess` 文件
- 已包含在构建输出的 `dist` 目录中
- 确保 Apache 启用了 `mod_headers` 和 `mod_rewrite`

### 4. Nginx 服务器
如果使用 Nginx，请在服务器配置中添加：

```nginx
server {
    # ... 其他配置

    location ~* \.(js|mjs|jsx)$ {
        add_header Content-Type "application/javascript; charset=utf-8";
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location ~* \.css$ {
        add_header Content-Type "text/css; charset=utf-8";
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 5. 其他服务器
确保您的 Web 服务器配置了以下 MIME 类型：
- `.js` → `application/javascript; charset=utf-8`
- `.mjs` → `application/javascript; charset=utf-8`
- `.css` → `text/css; charset=utf-8`
- `.json` → `application/json; charset=utf-8`

## 构建和部署

1. 构建项目：
```bash
npm run build
```

2. 部署 `dist` 目录到您的 Web 服务器

3. 确保服务器配置文件（`_headers`、`.htaccess` 等）被正确上传

## 验证
部署后，检查浏览器开发者工具的网络标签，确认 JavaScript 文件的 `Content-Type` 响应头为 `application/javascript`。

## 注意事项
- 所有配置文件都已包含在项目中
- 不同的托管平台会自动使用对应的配置文件
- 如果问题仍然存在，请检查您的托管平台的文档或联系技术支持
