/**
 * Entrez搜索功能
 * 实现NCBI生物信息学数据库检索
 */
document.addEventListener('DOMContentLoaded', function() {
    const entrezForm = document.getElementById('entrez-form');
    if (!entrezForm) return;
    
    const resultsContainer = document.getElementById('entrez-results-container');
    const resultsList = resultsContainer.querySelector('.results-list');
    const loadingSpinner = resultsContainer.querySelector('.loading-spinner');
    const pagination = resultsContainer.querySelector('.pagination');
    
    // Entrez API相关配置
    const entrezConfig = {
        baseUrl: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/',
        tool: 'entrez_search',
        email: 'your-email@example.com'
    };
    
    // 保存当前搜索状态
    let currentSearch = {
        db: '',
        term: '',
        results: [],
        resultsPerPage: 10,
        currentPage: 1,
        totalResults: 0,
        webEnv: '',
        queryKey: ''
    };
    
    // 提交搜索表单
    entrezForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const db = document.getElementById('entrez-db').value;
        const query = document.getElementById('entrez-query').value;
        const maxResults = document.getElementById('entrez-results').value || 10;
        const sortBy = document.getElementById('entrez-sort').value;
        
        if (!db || !query) {
            showError('请选择数据库并输入搜索关键词');
            return;
        }
        
        // 重置当前搜索状态
        currentSearch = {
            db,
            term: query,
            results: [],
            resultsPerPage: parseInt(maxResults),
            currentPage: 1,
            totalResults: 0,
            webEnv: '',
            queryKey: ''
        };
        
        // 执行搜索
        performSearch(db, query, sortBy);
    });
    
    // 执行NCBI Entrez API搜索
    function performSearch(db, query, sortBy) {
        // 显示加载状态
        showLoading();
        clearResults();
        
        // 构建API请求URL
        let searchUrl = `${entrezConfig.baseUrl}esearch.fcgi?db=${db}&term=${encodeURIComponent(query)}&retmode=xml&usehistory=y&retmax=${currentSearch.resultsPerPage}&tool=${entrezConfig.tool}&email=${entrezConfig.email}`;
        
        if (sortBy && sortBy !== 'relevance') {
            searchUrl += `&sort=${sortBy}`;
        }
        
        // 使用fetch API直接请求NCBI
        fetch(searchUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`网络错误 (${response.status}): ${response.statusText}`);
                }
                return response.text(); // 获取XML文本
            })
            .then(data => {
                // 解析XML响应
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data, "text/xml");
                
                // 检查是否有错误
                const errorNode = xmlDoc.querySelector("Error");
                if (errorNode) {
                    throw new Error(errorNode.textContent || '搜索请求出错');
                }
                
                // 获取搜索结果计数
                const countNode = xmlDoc.querySelector("Count");
                currentSearch.totalResults = countNode ? parseInt(countNode.textContent) : 0;
                
                // 获取WebEnv和QueryKey用于后续请求
                const webEnvNode = xmlDoc.querySelector("WebEnv");
                const queryKeyNode = xmlDoc.querySelector("QueryKey");
                
                currentSearch.webEnv = webEnvNode ? webEnvNode.textContent : '';
                currentSearch.queryKey = queryKeyNode ? queryKeyNode.textContent : '';
                
                // 获取ID列表
                const idList = xmlDoc.querySelectorAll("IdList Id");
                const ids = Array.from(idList).map(node => node.textContent);
                
                if (currentSearch.totalResults === 0 || ids.length === 0) {
                    showNoResults();
                    return;
                }
                
                // 获取搜索结果的摘要
                fetchResultSummaries(ids);
            })
            .catch(error => {
                hideLoading();
                showError(`搜索错误: ${error.message}`);
                console.error('Entrez搜索错误:', error);
            });
    }
    
    // 获取搜索结果的摘要信息
    function fetchResultSummaries(ids) {
        // 构建摘要请求URL
        let summaryUrl = `${entrezConfig.baseUrl}esummary.fcgi?db=${currentSearch.db}&id=${ids.join(',')}&retmode=xml&tool=${entrezConfig.tool}&email=${entrezConfig.email}`;
        
        // 使用fetch API直接请求NCBI
        fetch(summaryUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`网络错误 (${response.status}): ${response.statusText}`);
                }
                return response.text(); // 获取XML文本
            })
            .then(data => {
                hideLoading();
                
                // 解析XML响应
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data, "text/xml");
                
                // 检查是否有错误
                const errorNode = xmlDoc.querySelector("Error");
                if (errorNode) {
                    throw new Error(errorNode.textContent || '获取结果摘要失败');
                }
                
                // 处理并显示结果
                const docSums = xmlDoc.querySelectorAll("DocSum");
                if (docSums.length === 0) {
                    showNoResults();
                    return;
                }
                
                displayResults(docSums);
                
                // 更新分页
                updatePagination();
            })
            .catch(error => {
                hideLoading();
                showError(`获取结果详情错误: ${error.message}`);
                console.error('获取Entrez结果摘要错误:', error);
            });
    }
    
    // 显示搜索结果
    function displayResults(docSums) {
        clearResults();
        
        if (docSums.length === 0) {
            showNoResults();
            return;
        }
        
        const resultsHeader = document.createElement('h3');
        resultsHeader.textContent = `共找到 ${currentSearch.totalResults} 条结果，显示第 ${currentSearch.currentPage} 页`;
        resultsList.appendChild(resultsHeader);
        
        // 为每个结果创建DOM元素
        docSums.forEach(docSum => {
            const id = docSum.querySelector("Id").textContent;
            
            const resultElement = document.createElement('div');
            resultElement.className = 'result-item glass-effect';
            
            // 根据不同数据库类型显示不同的字段
            let resultContent = '';
            
            // 获取所有Item元素
            const items = docSum.querySelectorAll("Item");
            // 转换为更容易访问的对象
            const itemData = {};
            items.forEach(item => {
                const name = item.getAttribute("Name");
                if (name) {
                    itemData[name] = item.textContent;
                }
            });
            
            switch (currentSearch.db) {
                case 'pubmed':
                    const authorsNode = docSum.querySelector("Item[Name='AuthorList']");
                    const authorList = authorsNode ? Array.from(authorsNode.querySelectorAll("Item")).map(item => item.textContent) : [];
                    
                    resultContent = `
                        <h4>${itemData.Title || '无标题'}</h4>
                        <p class="authors">${formatAuthors(authorList)}</p>
                        <p class="source">${itemData.Source || ''} ${itemData.PubDate || ''}</p>
                        <p class="abstract">${itemData.Description || '无摘要'}</p>
                        <div class="result-footer">
                            <a href="https://pubmed.ncbi.nlm.nih.gov/${id}" target="_blank" class="result-link">查看全文</a>
                            <span class="result-id">PMID: ${id}</span>
                        </div>
                    `;
                    break;
                
                case 'protein':
                case 'nucleotide':
                    resultContent = `
                        <h4>${itemData.Title || '无标题'}</h4>
                        <p class="sequence-info">序列长度: ${itemData.Length || '未知'} | 
                           来源生物: ${itemData.Organism || '未知'}</p>
                        <p class="abstract">${itemData.Caption || '无描述'}</p>
                        <div class="result-footer">
                            <a href="https://www.ncbi.nlm.nih.gov/${currentSearch.db}/${id}" target="_blank" class="result-link">查看详情</a>
                            <span class="result-id">ID: ${id}</span>
                        </div>
                    `;
                    break;
                
                case 'gene':
                    resultContent = `
                        <h4>${itemData.Name || '未命名基因'} (${itemData.Description || '无描述'})</h4>
                        <p class="gene-info">染色体位置: ${itemData.Chromosome || '未知'} | 
                           生物: ${itemData.Organism || '未知'}</p>
                        <p class="abstract">${itemData.Summary || '无摘要'}</p>
                        <div class="result-footer">
                            <a href="https://www.ncbi.nlm.nih.gov/gene/${id}" target="_blank" class="result-link">查看详情</a>
                            <span class="result-id">Gene ID: ${id}</span>
                        </div>
                    `;
                    break;
                
                default:
                    resultContent = `
                        <h4>${itemData.Title || itemData.Name || '未命名项'}</h4>
                        <p class="abstract">${itemData.Summary || itemData.Description || itemData.Caption || '无描述'}</p>
                        <div class="result-footer">
                            <a href="https://www.ncbi.nlm.nih.gov/${currentSearch.db}/${id}" target="_blank" class="result-link">查看详情</a>
                            <span class="result-id">ID: ${id}</span>
                        </div>
                    `;
            }
            
            resultElement.innerHTML = resultContent;
            resultsList.appendChild(resultElement);
        });
    }
    
    // 更新分页控件
    function updatePagination() {
        pagination.innerHTML = '';
        
        if (currentSearch.totalResults <= currentSearch.resultsPerPage) {
            return; // 不需要分页
        }
        
        const totalPages = Math.ceil(currentSearch.totalResults / currentSearch.resultsPerPage);
        const currentPage = currentSearch.currentPage;
        
        // 创建分页按钮
        
        // "上一页"按钮
        if (currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.textContent = '上一页';
            prevButton.addEventListener('click', () => goToPage(currentPage - 1));
            pagination.appendChild(prevButton);
        }
        
        // 页码按钮
        const maxButtons = 5; // 最多显示的页码按钮数
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);
        
        // 调整起始页，确保显示足够的按钮
        if (endPage - startPage + 1 < maxButtons && startPage > 1) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.className = i === currentPage ? 'active' : '';
            pageButton.addEventListener('click', () => goToPage(i));
            pagination.appendChild(pageButton);
        }
        
        // "下一页"按钮
        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.textContent = '下一页';
            nextButton.addEventListener('click', () => goToPage(currentPage + 1));
            pagination.appendChild(nextButton);
        }
    }
    
    // 跳转到指定页面
    function goToPage(pageNumber) {
        currentSearch.currentPage = pageNumber;
        showLoading();
        clearResults();
        
        // 构建API请求URL，包含分页参数
        let searchUrl = `${entrezConfig.baseUrl}esearch.fcgi?db=${currentSearch.db}&term=${encodeURIComponent(currentSearch.term)}&retmode=xml&retstart=${(pageNumber - 1) * currentSearch.resultsPerPage}&retmax=${currentSearch.resultsPerPage}&tool=${entrezConfig.tool}&email=${entrezConfig.email}`;
        
        // 使用fetch API直接请求NCBI
        fetch(searchUrl)
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(data, "text/xml");
                
                // 获取ID列表
                const idList = xmlDoc.querySelectorAll("IdList Id");
                const ids = Array.from(idList).map(node => node.textContent);
                
                if (ids.length === 0) {
                    hideLoading();
                    showNoResults();
                    return;
                }
                
                fetchResultSummaries(ids);
            })
            .catch(error => {
                hideLoading();
                showError(`分页请求错误: ${error.message}`);
                console.error('Entrez分页请求错误:', error);
            });
    }
    
    // 格式化作者列表
    function formatAuthors(authors) {
        if (!authors || !authors.length) return '作者不详';
        
        const authorList = [];
        for (let i = 0; i < Math.min(authors.length, 3); i++) {
            authorList.push(authors[i]);
        }
        
        if (authors.length > 3) {
            return authorList.join(', ') + '等';
        } else {
            return authorList.join(', ');
        }
    }
    
    // 显示加载状态
    function showLoading() {
        if (loadingSpinner) {
            loadingSpinner.style.display = 'block';
        }
    }
    
    // 隐藏加载状态
    function hideLoading() {
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
    }
    
    // 清空搜索结果
    function clearResults() {
        if (resultsList) {
            resultsList.innerHTML = '';
        }
        if (pagination) {
            pagination.innerHTML = '';
        }
    }
    
    // 显示"无结果"提示
    function showNoResults() {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = '<p>未找到匹配的搜索结果。请尝试不同的关键词或选择其他数据库。</p>';
        resultsList.appendChild(noResults);
    }
    
    // 显示错误消息
    function showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        resultsList.appendChild(errorElement);
    }
    
    // 页面加载时添加一条提示
    const helpText = document.createElement('div');
    helpText.className = 'help-text';
    helpText.innerHTML = `
        <p>此功能使用NCBI Entrez API进行生物信息学数据搜索。请选择数据库并输入关键词进行搜索。</p>
        <p>示例搜索：</p>
        <ul>
            <li>PubMed: 搜索"cancer treatment"查找相关医学文献</li>
            <li>Gene: 搜索"BRCA1"查找乳腺癌相关基因</li>
            <li>Protein: 搜索"insulin human"查找人胰岛素蛋白质</li>
        </ul>
    `;
    resultsList.appendChild(helpText);
});

class EntrezSearch {
    constructor() {
        this.baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
        this.tool = 'entrez_search';
        this.email = 'your-email@example.com';
        this.currentPage = 1;
        this.pageSize = 10;
        this.totalResults = 0;
        this.searchResults = [];
        this.currentDatabase = '';
        this.currentKeywords = '';
    }

    async search(database, keywords, page = 1) {
        try {
            this.currentPage = page;
            this.currentDatabase = database;
            this.currentKeywords = keywords;

            // 构建搜索URL
            const searchUrl = `${this.baseUrl}/esearch.fcgi?db=${database}&term=${encodeURIComponent(keywords)}&retmode=json&retstart=${(page - 1) * this.pageSize}&retmax=${this.pageSize}&tool=${this.tool}&email=${this.email}`;

            // 执行搜索请求
            const response = await fetch(searchUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const searchResult = data.esearchresult;

            // 更新结果
            this.totalResults = parseInt(searchResult.count);
            this.searchResults = searchResult.idlist;

            // 获取详细信息
            if (this.searchResults.length > 0) {
                await this.fetchDetails();
            }

            return {
                results: this.searchResults,
                total: this.totalResults,
                page: this.currentPage,
                pageSize: this.pageSize
            };
        } catch (error) {
            console.error('Search error:', error);
            throw error;
        }
    }

    async fetchDetails() {
        try {
            const ids = this.searchResults.join(',');
            const summaryUrl = `${this.baseUrl}/esummary.fcgi?db=${this.currentDatabase}&id=${ids}&retmode=json&tool=${this.tool}&email=${this.email}`;

            const response = await fetch(summaryUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const result = data.result;

            // 处理不同数据库的详细信息
            this.searchResults = this.searchResults.map(id => {
                const item = result[id];
                return {
                    id: id,
                    title: item.title || item.name || '',
                    summary: item.summary || item.abstract || '',
                    authors: item.authors || [],
                    pubDate: item.pubdate || '',
                    journal: item.fulljournalname || '',
                    doi: item.elocationid || '',
                    database: this.currentDatabase
                };
            });
        } catch (error) {
            console.error('Fetch details error:', error);
            throw error;
        }
    }

    getTotalPages() {
        return Math.ceil(this.totalResults / this.pageSize);
    }

    hasNextPage() {
        return this.currentPage < this.getTotalPages();
    }

    hasPreviousPage() {
        return this.currentPage > 1;
    }
} 