const modal = document.getElementById('deleteModal');
const deleteButtons = document.querySelectorAll('.delete-btn');
const cancel_delete_btn=document.getElementById('cancelDelete');
const confirm_delete_btn=document.getElementById('confirmDelete');
let currentObjectId = null;
let current_btn = null;


let csrf_token=document.querySelector('meta[name="csrf-token"]').content;

deleteButtons.forEach(button=>{
    button.addEventListener('click',function(){
        currentObjectId=this.getAttribute('data-id');
        modal.classList.remove("d-none");
        modal.classList.add("d-block");
        current_btn=this;

        
    })
})


cancel_delete_btn.addEventListener('click',function(){
    close_form();
});

confirm_delete_btn.addEventListener('click',function(){
    if(currentObjectId==null) return;
    $.ajax({
        url: `/api/v1/postagem/update/post_image/delete/${currentObjectId}`,
        type: 'DELETE',
        headers: {
            'X-CSRFToken': csrf_token
        },
        success: function(response) {
            console.log('deletado com sucesso')
            current_btn.parentElement.remove();
            close_form();

        },
        
    });
})

function close_form(){
    modal.classList.add("d-none");
    modal.classList.remove("d-block");
    currentObjectId=null;
    current_btn=null;
}