// ==UserScript==
// @name         Get_imgs
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  一键下载网页中的图片，支持格式过滤、大小筛选、拖拽面板
// @author       A16N
// @match        *://*/*
// @grant        GM_download
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // 添加样式
    GM_addStyle(`
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .img-downloader-container {
            position: fixed;
            right: 20px;
            bottom: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15), 0 0 15px rgba(0,100,255,0.1);
            padding: 0;
            z-index: 9999;
            max-width: 350px;
            min-width: 200px;
            border: 1px solid rgba(0,150,255,0.2);
        }
        .img-downloader-title {
            cursor: move;
            padding: 10px 15px;
            background: linear-gradient(135deg, #1a3a8f, #0a7ddb);
            color: white;
            border-bottom: 1px solid #0a5db9;
            font-weight: bold;
            border-radius: 8px 8px 0 0;
            text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
        .img-downloader-content {
            padding: 15px;
            background: linear-gradient(to bottom, #f9f9f9, #ffffff);
        }
        .img-downloader-header {
            margin-bottom: 15px;
        }
        .img-downloader-filters {
            margin-bottom: 15px;
            padding: 12px;
            background: linear-gradient(135deg, #f0f7ff, #e6f7ff);
            border-radius: 6px;
            display: flex;
            gap: 10px;
            align-items: center;
            border: 1px solid rgba(0,150,255,0.15);
            box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        }
        .img-downloader-filters select, .img-downloader-filters input {
            margin: 0;
            padding: 6px 8px;
            flex: 1;
            min-width: 0;
            border: 1px solid #c0d6e8;
            border-radius: 4px;
            transition: all 0.3s ease;
        }
        .img-downloader-filters select:focus, .img-downloader-filters input:focus {
            outline: none;
            border-color: #2196F3;
            box-shadow: 0 0 0 2px rgba(33,150,243,0.2);
        }
        .img-downloader-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .img-downloader-select-all {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 14px;
        }
        .img-downloader-btn {
            padding: 8px 15px;
            background: linear-gradient(135deg, #4CAF50, #00c4aa);
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            text-shadow: 0 1px 1px rgba(0,0,0,0.1);
        }
        .img-downloader-btn:hover {
            background: linear-gradient(135deg, #45a049, #00b3a0);
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            transform: translateY(-1px);
        }
        .img-downloader-btn:disabled {
            background: linear-gradient(135deg, #cccccc, #b0b0b0);
            cursor: not-allowed;
            box-shadow: none;
            transform: none;
        }
        .img-downloader-btn.refresh {
            padding: 6px 12px;
            margin-right: 10px;
            display: flex;
            align-items: center;
            gap: 5px;
            background: linear-gradient(135deg, #2196F3, #9c27b0);
        }
        .img-downloader-btn.refresh:hover {
            background: linear-gradient(135deg, #1e88e5, #8e24aa);
        }
        .img-downloader-btn.refresh.loading {
            pointer-events: none;
            opacity: 0.7;
        }
        .img-downloader-btn.refresh.loading .refresh-icon {
            animation: spin 1s linear infinite;
        }
        .img-preview-container {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 10px;
            max-height: 350px;
            overflow-y: auto;
            padding-right: 5px;
        }
        .img-downloader-btn.small {
            padding: 6px;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #2196F3, #03A9F4);
        }
        .img-downloader-btn.small:hover {
            background: linear-gradient(135deg, #1e88e5, #039be5);
        }
        .img-downloader-btn.small svg {
            width: 16px;
            height: 16px;
        }
        .img-preview-item {
            display: flex;
            align-items: center;
            gap: 15px;
            border: 1px solid #ddd;
            padding: 10px;
            border-radius: 4px;
            background: #fff;
            transition: all 0.3s ease;
            justify-content: space-between;
            position: relative;
        }
        .img-preview-item:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border: 1px solid transparent;
            background: linear-gradient(#fff, #fff) padding-box,
                       linear-gradient(135deg, rgba(33,150,243,0.5), rgba(156,39,176,0.5)) border-box;
        }
        .img-preview-item img {
            width: 50px;
            height: auto;
            object-fit: contain;
            border-radius: 4px;
        }
        .img-preview-item input[type="checkbox"] {
            width: 20px;
            height: 20px;
            margin: 0;
        }
        .img-info {
            flex-grow: 1;
            font-size: 13px;
            color: #666;
        }
        .img-preview-count {
            font-size: 14px;
            color: #666;
            margin-left: 10px;
        }
    `);

    // 创建容器
    const container = document.createElement('div');
    container.className = 'img-downloader-container';

    // 创建标题栏
    const titleBar = document.createElement('div');
    titleBar.className = 'img-downloader-title';
    titleBar.textContent = '图片下载列表';
    container.appendChild(titleBar);

    // 创建内容容器
    const content = document.createElement('div');
    content.className = 'img-downloader-content';
    container.appendChild(content);

    // 添加拖拽功能
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    titleBar.addEventListener('mousedown', e => {
        isDragging = true;
        initialX = e.clientX - container.offsetLeft;
        initialY = e.clientY - container.offsetTop;
    });

    document.addEventListener('mousemove', e => {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            container.style.left = currentX + 'px';
            container.style.top = currentY + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // 创建过滤器
    const filters = document.createElement('div');
    filters.className = 'img-downloader-filters';

    // 图片格式选择
    const formatSelect = document.createElement('select');
    formatSelect.innerHTML = `
        <option value="all">所有格式</option>
        <option value="jpg,jpeg">JPG</option>
        <option value="png">PNG</option>
        <option value="gif">GIF</option>
        <option value="webp">WebP</option>
    `;

    // 最小图片尺寸
    const minSizeInput = document.createElement('input');
    minSizeInput.type = 'number';
    minSizeInput.placeholder = '最小图片宽度';
    minSizeInput.value = '100';

    // 添加px单位标识
    const pxLabel = document.createElement('span');
    pxLabel.textContent = 'px';
    pxLabel.style.marginLeft = '4px';
    pxLabel.style.color = '#666';

    filters.appendChild(formatSelect);
    filters.appendChild(minSizeInput);
    filters.appendChild(pxLabel);
    content.appendChild(filters);

    // 创建头部
    const header = document.createElement('div');
    header.className = 'img-downloader-header';

    // 创建刷新按钮
    const refreshBtn = document.createElement('button');
    refreshBtn.className = 'img-downloader-btn refresh';
    refreshBtn.innerHTML = '<svg class="refresh-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>';
    refreshBtn.addEventListener('click', () => {
        refreshBtn.classList.add('loading');
        previewContainer.innerHTML = '';
        setTimeout(() => {
            initializeImagePreviews();
            refreshBtn.classList.remove('loading');
        }, 500);
    });
    header.appendChild(refreshBtn);

    // 创建全选区域
    const selectAllContainer = document.createElement('div');
    selectAllContainer.className = 'img-downloader-select-all';
    const selectAllCheckbox = document.createElement('input');
    selectAllCheckbox.type = 'checkbox';
    selectAllCheckbox.id = 'select-all';
    const selectAllLabel = document.createElement('label');
    selectAllLabel.htmlFor = 'select-all';
    selectAllLabel.textContent = '全选';
    selectAllContainer.appendChild(selectAllCheckbox);
    selectAllContainer.appendChild(selectAllLabel);

    // 创建下载按钮
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'img-downloader-btn';
    downloadBtn.textContent = '下载选中';
    downloadBtn.disabled = true;

    // 创建选中计数
    const countSpan = document.createElement('span');
    countSpan.className = 'img-preview-count';
    countSpan.textContent = '已选择: 0';

    header.appendChild(selectAllContainer);
    header.appendChild(countSpan);
    header.appendChild(downloadBtn);

    // 创建预览容器
    const previewContainer = document.createElement('div');
    previewContainer.className = 'img-preview-container';

    content.appendChild(header);
    content.appendChild(previewContainer);
    document.body.appendChild(container);

    // 下载单个图片
    function downloadImage(imgSrc, filename) {
        // 添加域名前缀到文件名
        const domain = new URL(imgSrc).hostname;
        const prefixedFilename = `${domain}_${filename}`;

        if (typeof GM_download !== 'undefined') {
            GM_download({
                url: imgSrc,
                name: prefixedFilename
            });
        } else {
            const a = document.createElement('a');
            a.href = imgSrc;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }

    // 更新选中状态和按钮
    function updateSelection() {
        const checkboxes = previewContainer.querySelectorAll('input[type="checkbox"]');
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        countSpan.textContent = `已选择: ${checkedCount}`;
        downloadBtn.disabled = checkedCount === 0;
        selectAllCheckbox.checked = checkedCount === checkboxes.length && checkboxes.length > 0;
    }

    // 初始化图片预览
    function initializeImagePreviews() {
        const images = document.querySelectorAll('img');
        let validImages = Array.from(images).filter(img => {
            // 排除data:开头的图片和all-sizes-header div中的图片
            if (!img.src || img.src.startsWith('data:')) return false;
            const allSizesHeader = document.getElementById('all-sizes-header');
            if (allSizesHeader && allSizesHeader.contains(img)) return false;

            // 格式过滤
            const selectedFormat = formatSelect.value;
            if (selectedFormat !== 'all') {
                const formats = selectedFormat.split(',');
                const imgFormat = img.src.split('.').pop().toLowerCase();
                if (!formats.includes(imgFormat)) return false;
            }

            // 尺寸过滤
            const minWidth = parseInt(minSizeInput.value) || 0;
            if (img.naturalWidth < minWidth) return false;

            return true;
        });
        
        validImages.forEach((img, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'img-preview-item';

            const leftContainer = document.createElement('div');
            leftContainer.style.display = 'flex';
            leftContainer.style.alignItems = 'center';
            leftContainer.style.gap = '15px';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.dataset.index = index;
            checkbox.addEventListener('change', updateSelection);

            const preview = document.createElement('img');
            preview.src = img.src;
            preview.alt = '预览图';
            preview.style.width = '50px';
            preview.style.height = 'auto';

            const imgInfo = document.createElement('div');
            imgInfo.className = 'img-info';

            // 获取图片尺寸
            preview.onload = function() {
                imgInfo.textContent = `${this.naturalWidth} x ${this.naturalHeight}px`;
            };

            leftContainer.appendChild(checkbox);
            leftContainer.appendChild(preview);
            leftContainer.appendChild(imgInfo);

            const downloadButton = document.createElement('button');
            downloadButton.className = 'img-downloader-btn small';
            downloadButton.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>';
            downloadButton.onclick = () => {
                let filename = img.src.split('/').pop();
                if (!filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                    filename += '.jpg';
                }
                downloadImage(img.src, filename);
            };

            previewItem.appendChild(leftContainer);
            previewItem.appendChild(downloadButton);
            previewContainer.appendChild(previewItem);
        });
    }

    // 下载选中的图片
    function downloadSelectedImages() {
        const checkboxes = previewContainer.querySelectorAll('input[type="checkbox"]:checked');
        let count = 0;
        const totalCount = checkboxes.length;
        const originalText = downloadBtn.textContent;

        downloadBtn.textContent = `准备下载 0/${totalCount} 张图片...`;

        checkboxes.forEach((checkbox, index) => {
            const imgSrc = checkbox.parentElement.querySelector('img').src;
            let filename = imgSrc.split('/').pop();
            if (!filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                filename += '.jpg';
            }
            filename = `${count++}_${filename}`;
            downloadImage(imgSrc, filename);
            count++;
            downloadBtn.textContent = `正在下载 ${count}/${totalCount} 张图片...`;
        });

        if (count > 0) {
            setTimeout(() => {
                downloadBtn.textContent = originalText;
            }, 3000);
        }
    }

    // 全选/取消全选
    selectAllCheckbox.addEventListener('change', (e) => {
        const checkboxes = previewContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => cb.checked = e.target.checked);
        updateSelection();
    });

    // 添加下载按钮点击事件
    downloadBtn.addEventListener('click', downloadSelectedImages);

    // 初始化预览
    initializeImagePreviews();
})();
