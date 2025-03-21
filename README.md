# Get_imgs  
一键批量下载网页图片的浏览器脚本工具，让你轻松获取所需的网页图片资源。



## 主要功能

### 图片筛选

- **格式过滤**：支持选择以下格式的图片
  - 所有格式
  - JPG/JPEG
  - PNG
  - GIF
  - WebP

- **尺寸筛选**：可设置最小图片宽度（默认100px），过滤掉小尺寸图片

### 下载功能

- **批量下载**
  - 支持全选/取消全选所有图片
  - 显示已选择图片数量
  - 下载时自动添加域名前缀，避免文件名冲突
  - 实时显示下载进度

- **单张下载**
  - 每个图片预览项右侧都有独立的下载按钮
  - 点击即可快速下载单张图片

### 界面特性

- **可拖拽面板**：支持自由拖拽调整面板位置
- **实时预览**：显示图片缩略图和尺寸信息
- **刷新功能**：可随时刷新图片列表，获取最新图片

## 实现原理

### 核心技术

1. **脚本注入**
   - 使用Tampermonkey作为脚本管理器
   - 通过`@match`规则匹配所有网页
   - 利用`GM_download`和`GM_addStyle`实现下载和样式注入

2. **图片检测与处理**
   - 使用DOM操作获取页面中所有`<img>`标签
   - 过滤无效图片（如data:开头的base64图片）
   - 获取图片的原始尺寸信息

3. **界面设计**
   - 使用CSS构建悬浮窗口界面
   - 实现响应式布局和滚动预览
   - 添加交互事件监听器

### 主要功能实现

1. **图片收集**
   ```javascript
   const images = document.querySelectorAll('img');
   let validImages = Array.from(images).filter(img => {
       if (!img.src || img.src.startsWith('data:')) return false;
       return true;
   });
   ```

2. **下载处理**
   ```javascript
   function downloadImage(imgSrc, filename) {
       GM_download({  
           url: imgSrc,
           name: filename
       });
   }
   ```

## 使用方法

### 1. 安装步骤

1. 首先安装Tampermonkey浏览器扩展
   - Chrome：[Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - Firefox：[Tampermonkey](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)

2. 安装脚本
   - 点击Tampermonkey图标
   - 选择"添加新脚本"
   - 将`Get_Imgs.js`的内容复制粘贴到编辑器中
   - 点击保存

### 2. 使用步骤

1. **打开任意网页**
   - 脚本会自动在右下角创建悬浮窗口
   - 显示当前页面所有可下载的图片

2. **选择图片**
   - 单击图片前的复选框选择单张图片
   - 点击"全选"可选择所有图片
   - 可以看到每张图片的预览和尺寸信息

3. **下载图片**
   - 点击单张图片右侧的"下载"按钮下载单张图片
   - 点击顶部的"下载选中图片"按钮批量下载所选图片
   - 下载的图片会自动保存到浏览器的默认下载目录

### 3. 注意事项

- 某些网站可能限制图片下载，此时脚本可能无法正常工作
- 建议在下载大量图片时适当控制数量，避免浏览器负载过大
- 如果图片URL不包含文件扩展名，脚本会默认添加.jpg扩展名

### 4. 常见问题

1. **图片无法下载？**
   - 检查网页是否限制了图片下载
   - 确认图片URL是否有效
   - 检查浏览器下载设置

2. **预览窗口不显示？**
   - 刷新页面
   - 检查是否有其他脚本冲突
   - 确认Tampermonkey是否正常启用

3. **下载速度较慢？**
   - 考虑减少同时下载的图片数量
   - 检查网络连接状态
   - 可能是目标服务器限制了下载速度

> Created with Trae
