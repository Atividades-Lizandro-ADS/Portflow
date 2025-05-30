const input_programas=document.getElementById('id_programs')
const programs_api_url=document.querySelector('meta[name="used_programs_api"]').content;
const programs_preview=document.getElementById("programs_preview");
const used_form=document.getElementById("formulario");
const programs_dropdown=document.getElementById("programs-dropdown");


let already_in_programs=[]
document.querySelectorAll('input[name="used_programs[]"]').forEach(input=>{
    if (!already_in_programs.includes(input.value)) {
        already_in_programs.push(input.value);
    }
    input.remove()
})



let timeout=null;
input_programas.addEventListener('input',function(e){
    clearTimeout(timeout);

    timeout=setTimeout(()=>{
        

        search=e.target.value;
        $.ajax({
            url: `${programs_api_url}?search=${search}`,
            method: 'GET',
            success: function (data) {
                clear_dropdown();
                unmute_dropdown();


                data.results.forEach(program => {

                    if (!already_in_programs.includes(program.program_name)){
                        const item=document.createElement('div');
                        item.innerHTML=`<img src="${program.program_logo}" class="software-logo">
                        <span>${program.program_name}<\span>`

                        

                        item.addEventListener('click', function(e){
                            add_program_input(program);
                            mute_dropdown();
                            clear_dropdown();
                        });

                        

                        programs_dropdown.appendChild(item);
                    }
                    
                });


                if(programs_dropdown.children.length <= 0){
                    programs_dropdown.innerHTML='nenhum programa encontrado'
                                }
                
            },
            error: function (xhr, status, error) {
                console.error("Erro ao carregar posts:", error);
            }
        });
    },600)

})
    
function clear_dropdown(){
    programs_dropdown.innerHTML='';
}

function unmute_dropdown(){
    programs_dropdown.classList.remove('d-none')
}

function mute_dropdown(){
    programs_dropdown.classList.add('d-none')
}



document.addEventListener('click', (e) => {
    if (!input_programas.contains(e.target) && !programs_dropdown.contains(e.target)) {
        mute_dropdown();
    }
});

function add_program_input(p){
    already_in_programs[already_in_programs.length]=p.program_name;
    const usedprogram_input= document.createElement('input');
    usedprogram_input.type='hidden';
    usedprogram_input.name='used_programs[]'
    usedprogram_input.value=p.program_name;
    used_form.appendChild(usedprogram_input);

    const preview_software=document.createElement('div')
    preview_software.classList.add('lt-graybox', 'p-2', 'pe-3', 'rounded', 'fs-4', 'd-flex', 'gap-3', 'align-items-center')


    const rmv_button=document.createElement('p');
    rmv_button.innerHTML='<i class="bi bi-trash-fill"></i>'
    rmv_button.classList.add( 'fs-5');


    rmv_button.addEventListener('click', function (e) {
        programs_preview.removeChild(preview_software);
        used_form.removeChild(usedprogram_input);

        const index = already_in_programs.indexOf(p.program_name);
        if (index > -1) { 
            already_in_programs.splice(index, 1); 
        }

    })

    preview_software.innerHTML=
    `<img class="software-logo" src="${p.program_logo}" alt="">
     <p>${p.program_name}</p>`
     input_programas.value=''

    preview_software.appendChild(rmv_button)

    programs_preview.appendChild(preview_software)

    
}



const rmv_software_button=document.getElementsByName("button-remove-program-already")
const remove_used_programs_api=document.querySelector('meta[name="remove_used_programs_api"]').content;

rmv_software_button.forEach(item => {
    item.addEventListener('click',function(e){

        const id_obj_remove=item.getAttribute('data-post');
        const id_program=item.getAttribute('data-program');
        $.ajax({
            url: remove_used_programs_api.replace('/1/',`/${id_obj_remove}/`).replace('/2/',`/${id_program}/`),
            method: 'GET',
            success: function (data) {
                item.parentElement.remove()
                
                const index = already_in_programs.indexOf(data.program);
                if (index > -1) { 
                    already_in_programs.splice(index, 1); 
                }
            },
            error: function (xhr, status, error) {
                console.error("Erro ao carregar posts:", error);
            }
        });

    });
});