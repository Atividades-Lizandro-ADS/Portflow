const readmore_text=document.getElementById("readmore-text")
let readmore_container=document.getElementById("description-container")


const conteudo_original=readmore_text.textContent.trim()


if(conteudo_original.length>140){
    const resumo=conteudo_original.substring(0,140)

    readmore_container.innerHTML=`
        <span class="" id="readmore-resume">${resumo}</span>
        <span class="d-none" id="readmore-text">${conteudo_original}</span>
        <span class="read-more" id="readmore-btn">...ler mais<\span>
    `

    const readmore_btn=document.getElementById("readmore-btn")
    const text_original=document.getElementById("readmore-text")
    const text_resumo=document.getElementById("readmore-resume")

    readmore_btn.addEventListener('click',function(){
        let is_expanded=!text_original.classList.contains("d-none");

        text_original.classList.toggle("d-none")
        text_resumo.classList.toggle("d-none")


        if (is_expanded==true) {
            setTimeout(() => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }, 10);
            
        } 

        readmore_btn.textContent = text_original.classList.contains("d-none") ? "...ler mais" : "...ler menos";
    })
}