const img_forms=document.getElementsByName("form-image-update")
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

img_forms.forEach(form => {
    form.addEventListener('submit', function(e){
        e.preventDefault();
        const formData = new FormData(this);
        const img_api_url = this.getAttribute('action');
        $.ajax({
            url: img_api_url,
            type: 'PATCH',
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                'X-CSRFToken': csrfToken
            },
            success: function(response) {
                console.log(response)
            }
        });
        

    });
});

