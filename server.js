const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.')); // 提供静态文件服务

// 替换文件API
app.post('/api/replace-file', async (req, res) => {
    try {
        const { filePath, content } = req.body;

        if (!filePath || !content) {
            return res.status(400).json({
                success: false,
                error: '文件路径和内容不能为空'
            });
        }

        // 确保文件路径是安全的
        const safePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
        
        // 写入文件
        await fs.writeFile(safePath, content, 'utf8');
        
        res.json({
            success: true,
            message: '文件替换成功'
        });
    } catch (error) {
        console.error('文件替换错误:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`文件服务器运行在 http://localhost:${port}`);
}); 