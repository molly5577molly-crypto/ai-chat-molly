const express = require('express');
const path = require('path');
const app = express();

// 测试 MIME 类型配置
app.use('/assets', (req, res, next) => {
  console.log(`Request: ${req.path}`);
  if (req.path.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    console.log('Set MIME type for .js file');
  } else if (req.path.endsWith('.css')) {
    res.setHeader('Content-Type', 'text/css; charset=utf-8');
    console.log('Set MIME type for .css file');
  }
  next();
});

// 静态文件服务
app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders: (res, filePath) => {
    console.log(`Serving: ${filePath}`);
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      console.log('MIME type set to: application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
      console.log('MIME type set to: text/css');
    }
  }
}));

// SPA 路由处理
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log('📝 Check the browser console for MIME type verification');
});

