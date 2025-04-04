const input_programas=document.getElementById('id_programs')
const programs_api_url=document.querySelector('meta[name="used_programs_api"]').content;
const used_form=document.getElementById("formulario");
const programs_preview=document.getElementById("programs_preview");
programs_preview.classList.add("lt-graybox", "p-2", "pe-3", "rounded", "fs-4", "d-flex", "gap-3", "align-items-start")


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

                // To-do:colocar um feedback de usuario caso dropdownContainer.children.length < 0, pois nenhum item foi retornado
                // nessa parte, apos o foreach
                
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
    preview_software.classList.add('lt-graybox', 'p-2', 'pe-3', 'rounded', 'fs-4', 'd-flex', 'gap-3', 'align-items-start')
    preview_software.innerHTML=
    `<img class="software-logo" src="${p.program_logo}" alt="">
     <p>${p.program_name}</p>`
    programs_preview.appendChild(preview_software)
}