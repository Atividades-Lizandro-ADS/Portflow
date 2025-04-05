const draft_btn=document.getElementById('draft')
const publish_btn=document.getElementById('publish')
const published=document.getElementById('id_published')
const form_=document.getElementById('formulario')

draft_btn.addEventListener('click',function(e){
    e.preventDefault()
    published.value=false;
    form_.submit()
});

publish_btn.addEventListener('click',function(e){
    e.preventDefault()
    published.value=true;
    form_.submit()
    

});