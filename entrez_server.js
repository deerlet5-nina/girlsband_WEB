const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// NCBI E-utilities 配置
const NCBI_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
const EMAIL = 'your-email@example.com';
const TOOL = 'girls-band-entrez-search';

// 搜索处理函数
async function performEntrezSearch(database, keywords, page = 1, pageSize = 10) {
    try {
        // 构建搜索URL
        const retstart = (page - 1) * pageSize;
        const searchUrl = `${NCBI_BASE_URL}esearch.fcgi`;
        const searchParams = {
            db: database,
            term: keywords,
            retstart: retstart,
            retmax: pageSize,
            email: EMAIL,
            tool: TOOL,
            retmode: 'json'
        };

        // 执行搜索请求
        const searchResponse = await axios.get(searchUrl, { params: searchParams });
        const searchData = searchResponse.data;

        if (!searchData.esearchresult) {
            throw new Error('无效的API响应格式');
        }

        const searchResult = searchData.esearchresult;
        const totalCount = parseInt(searchResult.count);
        const idList = searchResult.idlist || [];

        const results = [];

        // 如果有结果ID，获取详细信息
        if (idList.length > 0) {
            const summaryUrl = `${NCBI_BASE_URL}esummary.fcgi`;
            const summaryParams = {
                db: database,
                id: idList.join(','),
                email: EMAIL,
                tool: TOOL,
                retmode: 'json'
            };

            const summaryResponse = await axios.get(summaryUrl, { params: summaryParams });
            const summaryData = summaryResponse.data;

            if (!summaryData.result) {
                throw new Error('无效的摘要响应格式');
            }

            for (const id of idList) {
                if (summaryData.result[id]) {
                    const item = summaryData.result[id];
                    const result = {
                        id: id,
                        title: item.title || item.caption || `ID: ${id}`,
                        authors: item.authors || [],
                        journal: item.fulljournalname || item.source || '',
                        pubdate: item.pubdate || item.createdate || '',
                        abstract: item.abstract || ''
                    };

                    // 添加特定数据库的字段
                    switch (database) {
                        case 'protein':
                        case 'nucleotide':
                            result.organism = item.organism || '';
                            result.length = item.length || '';
                            break;
                        case 'structure':
                            result.resolution = item.resolution || '';
                            result.method = item.method || '';
                            break;
                    }

                    results.push(result);
                }
            }
        }

        return {
            success: true,
            total: totalCount,
            page: page,
            pageSize: pageSize,
            results: results,
            database: database,
            keywords: keywords
        };

    } catch (error) {
        console.error('搜索错误:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// 路由处理
app.post('/search', async (req, res) => {
    try {
        const { database, keywords, page = 1, pageSize = 10 } = req.body;

        if (!database || !keywords) {
            return res.status(400).json({
                success: false,
                error: '请选择数据库并输入搜索关键词'
            });
        }

        // 验证数据库名称
        const validDatabases = [
            'pubmed', 'protein', 'nucleotide', 'genome',
            'structure', 'sra', 'bioproject', 'biosample'
        ];

        if (!validDatabases.includes(database)) {
            return res.status(400).json({
                success: false,
                error: '不支持的数据库类型'
            });
        }

        const result = await performEntrezSearch(database, keywords, page, pageSize);
        res.json(result);

    } catch (error) {
        console.error('请求处理错误:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 启动服务器
app.listen(port, () => {
    console.log(`Entrez搜索服务器运行在 http://localhost:${port}`);
}); 