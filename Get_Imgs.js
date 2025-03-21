// ==UserScript==
// @name         Get_imgs
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  一键下载网页中的图片
// @author       A16N
// @match        *://*/*
// @grant        GM_download
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // 添加样式
    GM_addStyle(`
        .img-downloader-container {
            position: fixed;
            right: 20px;
            bottom: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 15px;
            z-index: 9999;
            max-width: 300px;
            max-height: 400px;
            overflow-y: auto;
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
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .img-downloader-btn:hover {
            background-color: #45a049;
        }
        .img-downloader-btn:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }
        .img-preview-container {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 10px;
        }
        .img-downloader-btn.small {
            padding: 4px 8px;
            font-size: 12px;
        }
        .img-preview-item {
            display: flex;
            align-items: center;
            gap: 15px;
            border: 1px solid #ddd;
            padding: 10px;
            border-radius: 4px;
            background: #fff;
            transition: all 0.2s ease;
            justify-content: space-between;
        }
        .img-preview-item:hover {
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .img-preview-item img {
            width: 120px;
            height: 80px;
            object-fit: cover;
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

    // 创建头部
    const header = document.createElement('div');
    header.className = 'img-downloader-header';

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
    downloadBtn.textContent = '下载选中图片';
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

    container.appendChild(header);
    container.appendChild(previewContainer);
    document.body.appendChild(container);

    // 下载单个图片
    function downloadImage(imgSrc, filename) {
        if (typeof GM_download !== 'undefined') {
            GM_download({
                url: imgSrc,
                name: filename
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

            const imgInfo = document.createElement('div');
            imgInfo.className = 'img-info';

            // 获取图片尺寸
            preview.onload = function() {
                imgInfo.textContent = `尺寸: ${this.naturalWidth} x ${this.naturalHeight}px`;
            };

            leftContainer.appendChild(checkbox);
            leftContainer.appendChild(preview);
            leftContainer.appendChild(imgInfo);

            const downloadButton = document.createElement('button');
            downloadButton.className = 'img-downloader-btn small';
            downloadButton.textContent = '下载';
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
        const originalText = downloadBtn.textContent;

        checkboxes.forEach((checkbox) => {
            const imgSrc = checkbox.parentElement.querySelector('img').src;
            let filename = imgSrc.split('/').pop();
            if (!filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                filename += '.jpg';
            }
            filename = `${count++}_${filename}`;
            downloadImage(imgSrc, filename);
        });

        if (count > 0) {
            downloadBtn.textContent = `正在下载 ${count} 张图片...`;
            setTimeout(() => {
                downloadBtn.textContent = originalText;
            }, 2000);
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