const comment_form=$('#comment_form')
const post_id=parseInt(comment_form.attr('data-post-id'))
comment_form.removeAttr('data-post-id')
let comment_div=document.getElementById('comment_div')

const profile_id=parseInt(comment_form.attr('data-profile-id'))
comment_form.removeAttr('data-profile-id')

const api_url=comment_form.attr('data-comment-api-url')
comment_form.removeAttr('data-comment-api-url')

let token=comment_form.attr('data-token')
comment_form.removeAttr('data-token')




comment_form.on('submit',function(event){
    event.preventDefault()

    let formdata=comment_form.serializeArray()
    formdata.push({ name: 'comment_owner', value: profile_id });
    formdata.push({ name: 'comment_post', value: post_id });

    $.ajax({
        type:'POST',
        url:api_url,
        headers:{
            'X-CSRFToken':token
        },
        data:formdata,
        success:function(data){
            console.log(data)
            const comment=document.createElement('div');
            $('#id_comment_text').val('')
            comment.innerHTML=
            `
                        <img src="${data.owner.user_picture}" alt="">
                        <div>
                            <a href="/profile/${data.owner.user_id}">${data.owner.username}</a>
                            <p>${data.comment_text}</p>
                        </div>

                        <div class="d-flex gap-3 justify-content-between">
                                <span class="fs-5 ">agora</span>
                                
                        </div>
            `;
            comment.className="comment"
            comment_div.insertBefore(comment,comment_div.firstChild);
        },
        error: function(error){
            console.log('Erro', error)
        },
    })
})


