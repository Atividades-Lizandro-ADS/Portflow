const imageUpload = document.getElementById('image-upload');
const imagePreview = document.getElementById('image-preview');
const formInputsContainer = document.getElementById('form-inputs-container');

const uploadContainer=document.getElementById('upload-container');




imageUpload.addEventListener('change', function(e) {
    const files = e.target.files;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.match('image.*')) {
            continue;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(event) {

            const imageItem = document.createElement('div');
            imageItem.classList.add('image-item','gr-border-1');
            

            const img = document.createElement('img');
            img.src = event.target.result;
            

            const captionInput = document.createElement('input');
            captionInput.type = 'textarea';
            captionInput.className = 'text-input';
            captionInput.placeholder = 'legenda';
            captionInput.name='caption[]'

            const acessibilityCaptionInput = document.createElement('input');
            acessibilityCaptionInput.type = 'textarea';
            acessibilityCaptionInput.className = 'text-input';
            acessibilityCaptionInput.placeholder = 'legenda de acessibilidade';
            acessibilityCaptionInput.name='acessibility_caption[]'
            

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'delete-btn-top', 'fs-2';
            removeBtn.innerHTML = '<i class="bi bi-trash-fill"></i>';
            

            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.name = 'post_img[]'; // Array de imagens
            fileInput.classList.add('d-none');
            

            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
            

            formInputsContainer.appendChild(fileInput);
            

            
            removeBtn.onclick = function() {
                imagePreview.removeChild(imageItem);
                formInputsContainer.removeChild(fileInput);
            };
            
            const inputs_container=document.createElement('div')
            inputs_container.classList.add('p-3', 'd-flex', 'flex-column', 'gap-3','align-items-start');
            inputs_container.innerHTML=`
                <label for="">Legenda</label>
                <input type="textarea" name="caption[]" maxlength="240" class="text-input" required="" placeholder="legenda">
                <label for="">Legenda de acessibilidade</label>
                <input type="textarea" name="acessibility_caption[]" maxlength="120" class="text-input" required="" placeholder="legenda de acessibilidade">
            `

            const img_container=document.createElement('div');
            img_container.className='img-input';
            img_container.appendChild(img);
            
            imageItem.appendChild(img_container);
            imageItem.appendChild(inputs_container)
            imageItem.appendChild(removeBtn);
            
            imagePreview.appendChild(imageItem);
        };
        
        reader.readAsDataURL(file);
    }
    
    imageUpload.value = '';
});



uploadContainer.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.classList.add("upload_border_drag")
});

uploadContainer.addEventListener('dragleave', function() {
    this.classList.remove("upload_border_drag")
});

uploadContainer.addEventListener('drop', function(e) {
    e.preventDefault();
    this.classList.remove("upload_border_drag")
    
    imageUpload.files = e.dataTransfer.files;
    const event = new Event('change');
    imageUpload.dispatchEvent(event);
});


function previewImage(input) {
    const label = input.closest('.img-input');
    const img = label.querySelector('img');

    if (input.files && input.files[0]) {
        const file = input.files[0];
        
        const imageUrl = URL.createObjectURL(file);
        img.src = imageUrl; 

    }
}
