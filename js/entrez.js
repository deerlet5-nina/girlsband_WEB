/**
 * Entrez搜索功能
 * 实现NCBI生物信息学数据库检索
 */
document.addEventListener('DOMContentLoaded', function() {
    // 初始化标签页切换
    initTabs();
    
    // 初始化表单
    const entrezForm = document.getElementById('entrez-form');
    const advancedForm = document.getElementById('advanced-form');
    
    if (!entrezForm || !advancedForm) return;
    
    const resultsContainer = document.getElementById('entrez-results-container');
    const resultsList = resultsContainer.querySelector('.results-list');
    const loadingSpinner = resultsContainer.querySelector('.loading-spinner');
    const pagination = resultsContainer.querySelector('.pagination');
    
    // Entrez API相关配置
    const entrezConfig = {
        baseUrl: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/',
        tool: 'bioinfo_search',
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
    
    // 初始化标签页切换功能
    function initTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // 移除所有活动状态
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // 添加当前活动状态
                button.classList.add('active');
                const tabId = button.getAttribute('data-tab');
                document.getElementById(`${tabId}-search`).classList.add('active');
            });
        });
    }
    
    // 提交基本搜索表单
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
    
    // 提交高级搜索表单
    advancedForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const query = document.getElementById('advanced-query').value;
        const dateFrom = document.getElementById('date-from').value;
        const dateTo = document.getElementById('date-to').value;
        const filters = Array.from(document.querySelectorAll('input[name="filter"]:checked'))
            .map(checkbox => checkbox.value);
        
        if (!query) {
            showError('请输入高级搜索表达式');
            return;
        }
        
        // 构建高级搜索查询
        let advancedQuery = query;
        
        // 添加日期范围
        if (dateFrom || dateTo) {
            const dateRange = [];
            if (dateFrom) dateRange.push(`${dateFrom}[PDAT]`);
            if (dateTo) dateRange.push(`${dateTo}[PDAT]`);
            if (dateRange.length > 0) {
                advancedQuery += ` AND (${dateRange.join(':')})`;
            }
        }
        
        // 添加过滤条件
        if (filters.includes('reviewed')) {
            advancedQuery += ' AND reviewed[Filter]';
        }
        if (filters.includes('fulltext')) {
            advancedQuery += ' AND fulltext[Filter]';
        }
        
        // 重置当前搜索状态
        currentSearch = {
            db: 'pubmed', // 高级搜索默认使用PubMed
            term: advancedQuery,
            results: [],
            resultsPerPage: 10,
            currentPage: 1,
            totalResults: 0,
            webEnv: '',
            queryKey: ''
        };
        
        // 执行搜索
        performSearch('pubmed', advancedQuery);
    });
    
    // 执行NCBI Entrez API搜索
    async function performSearch(db, query, sortBy) {
        try {
            // 显示加载状态
            showLoading();
            clearResults();
            
            // 构建API请求URL
            let searchUrl = `${entrezConfig.baseUrl}esearch.fcgi?db=${db}&term=${encodeURIComponent(query)}&retmode=json&usehistory=y&retmax=${currentSearch.resultsPerPage}&tool=${entrezConfig.tool}&email=${entrezConfig.email}`;
            
            if (sortBy && sortBy !== 'relevance') {
                searchUrl += `&sort=${sortBy}`;
            }
            
            // 执行搜索请求
            const response = await fetch(searchUrl);
            if (!response.ok) {
                throw new Error(`网络错误 (${response.status}): ${response.statusText}`);
            }
            
            const data = await response.json();
            const searchResult = data.esearchresult;
            
            // 更新搜索状态
            currentSearch.totalResults = parseInt(searchResult.count);
            currentSearch.webEnv = searchResult.webenv;
            currentSearch.queryKey = searchResult.querykey;
            
            if (currentSearch.totalResults === 0) {
                showNoResults();
                return;
            }
            
            // 获取搜索结果的摘要
            await fetchResultSummaries(searchResult.idlist);
            
        } catch (error) {
            hideLoading();
            showError(`搜索错误: ${error.message}`);
            console.error('Entrez搜索错误:', error);
        }
    }
    
    // 获取搜索结果的摘要信息
    async function fetchResultSummaries(ids) {
        try {
            // 构建摘要请求URL
            const summaryUrl = `${entrezConfig.baseUrl}esummary.fcgi?db=${currentSearch.db}&id=${ids.join(',')}&retmode=json&tool=${entrezConfig.tool}&email=${entrezConfig.email}`;
            
            const response = await fetch(summaryUrl);
            if (!response.ok) {
                throw new Error(`网络错误 (${response.status}): ${response.statusText}`);
            }
            
            const data = await response.json();
            const result = data.result;
            
            // 处理并显示结果
            const results = ids.map(id => {
                const item = result[id];
                return {
                    id,
                    title: item.title || item.name || '',
                    summary: item.summary || item.abstract || '',
                    authors: item.authors || [],
                    pubDate: item.pubdate || '',
                    journal: item.fulljournalname || '',
                    doi: item.elocationid || '',
                    database: currentSearch.db
                };
            });
            
            displayResults(results);
            updatePagination();
            
        } catch (error) {
            hideLoading();
            showError(`获取结果详情错误: ${error.message}`);
            console.error('获取Entrez结果摘要错误:', error);
        }
    }
    
    // 显示搜索结果
    function displayResults(results) {
        clearResults();
        
        if (results.length === 0) {
            showNoResults();
            return;
        }
        
        const resultsHeader = document.createElement('h3');
        resultsHeader.textContent = `共找到 ${currentSearch.totalResults} 条结果，显示第 ${currentSearch.currentPage} 页`;
        resultsList.appendChild(resultsHeader);
        
        // 为每个结果创建DOM元素
        results.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.className = 'result-item glass-effect';
            
            resultElement.innerHTML = `
                <h4>${result.title}</h4>
                <p class="authors">${formatAuthors(result.authors)}</p>
                <p class="journal">${result.journal} (${result.pubDate})</p>
                <p class="summary">${result.summary}</p>
                <div class="result-footer">
                    <span class="database">${result.database}</span>
                    <span class="doi">DOI: ${result.doi}</span>
                </div>
            `;
            
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
        
        // "上一页"按钮
        if (currentSearch.currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.textContent = '上一页';
            prevButton.addEventListener('click', () => goToPage(currentSearch.currentPage - 1));
            pagination.appendChild(prevButton);
        }
        
        // 页码按钮
        const maxButtons = 5; // 最多显示的页码按钮数
        let startPage = Math.max(1, currentSearch.currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);
        
        // 调整起始页，确保显示足够的按钮
        if (endPage - startPage + 1 < maxButtons && startPage > 1) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.className = i === currentSearch.currentPage ? 'active' : '';
            pageButton.addEventListener('click', () => goToPage(i));
            pagination.appendChild(pageButton);
        }
        
        // "下一页"按钮
        if (currentSearch.currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.textContent = '下一页';
            nextButton.addEventListener('click', () => goToPage(currentSearch.currentPage + 1));
            pagination.appendChild(nextButton);
        }
    }
    
    // 跳转到指定页面
    async function goToPage(pageNumber) {
        currentSearch.currentPage = pageNumber;
        showLoading();
        clearResults();
        
        try {
            // 构建API请求URL，包含分页参数
            const searchUrl = `${entrezConfig.baseUrl}esearch.fcgi?db=${currentSearch.db}&term=${encodeURIComponent(currentSearch.term)}&retmode=json&retstart=${(pageNumber - 1) * currentSearch.resultsPerPage}&retmax=${currentSearch.resultsPerPage}&tool=${entrezConfig.tool}&email=${entrezConfig.email}`;
            
            const response = await fetch(searchUrl);
            if (!response.ok) {
                throw new Error(`网络错误 (${response.status}): ${response.statusText}`);
            }
            
            const data = await response.json();
            const searchResult = data.esearchresult;
            
            if (searchResult.idlist.length === 0) {
                hideLoading();
                showNoResults();
                return;
            }
            
            await fetchResultSummaries(searchResult.idlist);
            
        } catch (error) {
            hideLoading();
            showError(`分页请求错误: ${error.message}`);
            console.error('Entrez分页请求错误:', error);
        }
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
    
    // 显示键盘导航提示
    function showKeyboardNav() {
        const keyboardNav = document.querySelector('.keyboard-nav');
        if (keyboardNav) {
            keyboardNav.classList.add('show');
            setTimeout(() => {
                keyboardNav.classList.remove('show');
            }, 5000);
        }
    }
    
    // 监听键盘事件
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const keyboardNav = document.querySelector('.keyboard-nav');
            if (keyboardNav) {
                keyboardNav.classList.remove('show');
            }
        }
    });
    
    // 初始显示键盘导航提示
    showKeyboardNav();
}); 