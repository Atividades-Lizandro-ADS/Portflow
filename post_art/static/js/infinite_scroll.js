let page = 2;
let loading = false;

const postsContainer = document.getElementById('posts-container');
let api_url=postsContainer.getAttribute('data-api-url')
postsContainer.removeAttribute('data-api-url')

$(window).scroll(function(){
    if(page!=0 && ($(window).scrollTop()+$(window).height() >= $(document).height()-$(window).height())){
        

        loadPosts()
    }
})

function loadPosts() {
    
    if (loading) return;
    loading = true;
    

    $.ajax({
        url: `${api_url}?page=${page}`,
        method: 'GET',
        success: function (data) {
            data.results.forEach(post => {
                const postElement = document.createElement('a');
                postElement.innerHTML = `
                    <img class="card-img" src="${post.post_thumb}" alt="Card image" style="object-fit: cover; width: 100%; height: 100%;">
                    <div class="card-tx">
                      <h3 >${post.tittle}</h3>
                    </div>
                `;
                postElement.href=`/post/${post.id}`
                postElement.className="card pos-relative ov-hidden bg-dark text-white"
                postElement.style="width: 28rem; height: 28rem; padding: 0;"
                postsContainer.appendChild(postElement);
            });

            if (data.next) {
                page++;
            } else {
                page=0;
            }
            loading = false;
        },
        error: function (xhr, status, error) {
            console.error("Erro ao carregar posts:", error);
            loading = false;
        }
    });
}
