
function filterValid(papers) {
    if (!Array.isArray(papers)) return [];
    return papers.filter(p => p.title && p.title.trim() !== ".pdf" && p.title.trim().length > 0);
}

function renderPapers(category) {
    const container = document.getElementById('paperList');
    if (!container) return;

    let papers = papersData[category] || [];
    papers = filterValid(papers);

    if (papers.length === 0) {
        container.innerHTML = '<div class="no-paper">📭 暂无论文资料，敬请期待</div>';
        return;
    }

    let html = '<ul class="paper-ul">';
    papers.forEach(paper => {
        html += `
                <li class="paper-li">
                    <a href="${paper.src}" target="_blank" class="paper-link">📄 ${paper.title}</a>
                </li>
            `;
    });
    html += '</ul>';
    container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
    renderPapers('environment');

    const btns = document.querySelectorAll('.category-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const category = btn.getAttribute('data-category');
            renderPapers(category);
        });
    });
});