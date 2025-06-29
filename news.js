const apiKey = 'ee64a70a680d4093906a1cb02bf2dfca';
const newsContainer = document.getElementById('news-container');
const searchInput = document.getElementById('search');

async function fetchNews() {
    const query = searchInput.value.trim();
    if (!query) {
        alert('Please enter a search term!');
        return;
    }
    
    const url = `https://newsapi.org/v2/everything?q=${query}&apiKey=${apiKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.articles && data.articles.length > 0) {
            displayNews(data.articles);
        } else {
            newsContainer.innerHTML = '<p>No results found. Try a different keyword.</p>';
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        newsContainer.innerHTML = '<p>Failed to load news. Please try again later.</p>';
    }
}

function displayNews(articles) {
    newsContainer.innerHTML = '';
    articles.forEach(article => {
        if (!article.urlToImage) return; // Skip articles without images
        
        const newsCard = document.createElement('div');
        newsCard.classList.add('news-card', 'animate__animated', 'animate__fadeInUp');
        
        newsCard.innerHTML = `
            <h2>${article.title}</h2>
            <img src="${article.urlToImage}" alt="News Image" style="width: 100%; border-radius: 10px;">
            <p>${article.description || 'No description available.'}</p>
            <a href="${article.url}" target="_blank">Read more</a>
        `;
        
        newsContainer.appendChild(newsCard);
    });
}

// Fetch default news on page load (optional)
window.addEventListener('load', () => {
    searchInput.value = 'Everything'; 
    fetchNews();
});
