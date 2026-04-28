document.addEventListener('DOMContentLoaded', function() {
    // 获取元素
    const categoryBtns = document.querySelectorAll('.category-btn');
    const paperList = document.getElementById('paperList');

    // 从JSON加载论文数据
    fetch('../paper.json')
        .then(response => response.json())
        .then(papers => {
            // 初始化显示第一个分类
            showPapers('environment', papers);

            // 分类按钮点击事件
            categoryBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    // 更新激活状态
                    categoryBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');

                    // 显示对应论文
                    const category = this.dataset.category;
                    showPapers(category, papers);
                });
            });
        })
        .catch(error => {
            console.error('Error loading papers data:', error);
        });

    // 显示论文函数
    function showPapers(category, papersData) {
        paperList.innerHTML = '';
        if (papersData[category]) {
            papersData[category].forEach(paper => {
                const paperLink = document.createElement('a');
                paperLink.href = paper.src;
                paperLink.className = 'paper-item';
                paperLink.textContent = paper.title;
                paperLink.download = paper.title;
                paperList.appendChild(paperLink);
            });
        }
    }
});
