let page = 2;
let loading = false;

const postsContainer = document.getElementById('posts-container');
const loadingIndicator = document.getElementById('loading');

function loadPosts() {
    if (loading) return;
    loading = true;
    loadingIndicator.style.display = 'block';

    $.ajax({
        url: `/api/v1/posts/refresh?page=${page}`,
        method: 'GET',
        success: function (data) {
            data.results.forEach(post => {
                const postElement = document.createElement('a');
                postElement.innerHTML = `
                    <img class="card-img" src="${post.post_thumb}" alt="Card image" style="object-fit: cover; width: 100%; height: 100%;">
                    <div class="card-img-overlay">
                      <h3 class="card-title">${post.tittle}</h3>
                    </div>
                `;
                postElement.href=`/postagem/${post.id}`
                postElement.className="card flex align-end justify-center bg-dark text-white"
                postElement.style="width: 28rem; height: 28rem; padding: 0;"
                postsContainer.appendChild(postElement);
            });

            if (data.next) {
                page++;
            } else {
                observer.unobserve(loadingIndicator);
            }
            loading = false;
            loadingIndicator.style.display = 'none';
        },
        error: function (xhr, status, error) {
            console.error("Erro ao carregar posts:", error);
            loading = false;
            loadingIndicator.style.display = 'none';
        }
    });
}

const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
        loadPosts();
    }
}, {
    threshold: 1.0
});

observer.observe(loadingIndicator);

loadPosts();