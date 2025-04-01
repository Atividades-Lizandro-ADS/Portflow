const port=document.getElementById("port");
const sobre=document.getElementById("sobre");
const likes=document.getElementById("likes");

const portfolio_container=document.getElementById("portfolio-container")
const sobre_container=document.getElementById("sobre-container")
const like_container=document.getElementById("like-container")

let no_container_ativo=portfolio_container
let no_switch_ativo=port


port.addEventListener("click",function(e){
    e.preventDefault()

    pageSwitch(portfolio_container,port)

})

sobre.addEventListener("click",function(e){
    e.preventDefault()

    pageSwitch(sobre_container,sobre)

})


likes.addEventListener("click",function(e){
    e.preventDefault()

    pageSwitch(like_container,likes)
    

})


function pageSwitch(no_container,no_switch){
    if(no_container==no_container_ativo) return;
    
    no_container.classList.remove("d-none");
    no_container_ativo.classList.add("d-none");
    no_container_ativo=no_container

    
    no_switch_ativo.classList.remove("sl-on")
    no_switch.classList.add("sl-on")
    no_switch_ativo=no_switch
    
}