const save_button=$('#save-button')

const post=parseInt(save_button.attr('data-post'))
save_button.removeAttr('data-post')
const url=save_button.attr('data-save-favorite-url')
save_button.removeAttr('data-save-favorite-url')

let favorited=save_button.attr('data-favorited')
save_button.removeAttr('data-favorited')


if(favorited=="True"){
    toggleIcons()
}

save_button.on('click',function(event){

    $.ajax({
        type:'GET',
        url:`${url}?post=${post}`,

        success:function(data){
            toggleIcons()
            favorited=!favorited;
        },
    })
})


function toggleIcons(){
    $('#bookmark-ico').toggleClass('d-none')
    $('#bookmark-check-ico').toggleClass('d-none')
}