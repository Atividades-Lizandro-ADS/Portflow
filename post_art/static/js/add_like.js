const like_button=$('#like-button')

const post_id_like=parseInt(like_button.attr('data-post'))
like_button.removeAttr('data-post')

const owner_id_like=parseInt(like_button.attr('data-profile-id'))
like_button.removeAttr('data-post')


const like_url=like_button.attr('data-like-url')
like_button.removeAttr('data-like-url')

const like_csrf_token=like_button.attr('data-csrf')
like_button.removeAttr('data-csrf')


let liked=like_button.attr('data-liked')
like_button.removeAttr('data-liked')
if(liked=="True"){
    toggleLike()
}

like_button.on('click',function(event){

    if(isNaN(owner_id_like)){
        console.log('usuário não logado')
    }else{
        like()
    }

    
})

function like(){
    formdata={
        like_post:post_id_like,
    }

    $.ajax({
        type:'POST',
        url:like_url,
        headers:{
            'X-CSRFToken':like_csrf_token
        },
        data:formdata,
        success:function(data){
            toggleLike()
            $('#like_num').text(`${data.likes}`)
        },
        error: function(error){
            console.log('Erro', error)
        },
    })
}

function toggleLike(){
    like_button.toggleClass('wh-btn')
}