const port=document.getElementById("port");
const sobre=document.getElementById("sobre");
const likes=document.getElementById("likes");

const portfolio_container=document.getElementById("portfolio-container")
const sobre_container=document.getElementById("sobre-container")
const like_container=document.getElementById("like-container")

console.log(like_container)


port.addEventListener("click",function(e){
    e.preventDefault()

    port.classList.add('sl-on');
    sobre.classList.remove('sl-on');
    likes.classList.remove('sl-on');

    portfolio_container.classList.remove("d-none")
    sobre_container.classList.add("d-none")
    like_container.classList.add("d-none")

})

sobre.addEventListener("click",function(e){
    e.preventDefault()

    port.classList.remove('sl-on');
    sobre.classList.add('sl-on');
    likes.classList.remove('sl-on');

    portfolio_container.classList.add("d-none")
    sobre_container.classList.remove("d-none")
    like_container.classList.add("d-none")

})


likes.addEventListener("click",function(e){
    e.preventDefault()

    port.classList.remove('sl-on');
    sobre.classList.remove('sl-on');
    likes.classList.add('sl-on');

    portfolio_container.classList.add("d-none")
    sobre_container.classList.add("d-none")
    like_container.classList.remove("d-none")

})