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
            imageItem.className = 'image-item';
            

            const img = document.createElement('img');
            img.src = event.target.result;
            

            const captionInput = document.createElement('input');
            captionInput.type = 'textarea';
            captionInput.className = 'caption-input';
            captionInput.placeholder = 'legenda';

            const acessibilityCaptionInput = document.createElement('input');
            acessibilityCaptionInput.type = 'textarea';
            acessibilityCaptionInput.className = 'caption-input';
            acessibilityCaptionInput.placeholder = 'legenda de acessibilidade';
            

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = 'Remover';
            

            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.name = 'post_img[]'; // Array de imagens
            fileInput.classList.add('d-none');
            

            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
            

            const captionHidden = document.createElement('input');
            captionHidden.type = 'hidden';
            captionHidden.name = 'caption[]'; 

            const acessibilityCaptionHidden = document.createElement('input');
            acessibilityCaptionHidden.type = 'hidden';
            acessibilityCaptionHidden.name = 'acessibility_caption[]';
            
            formInputsContainer.appendChild(fileInput);
            formInputsContainer.appendChild(captionHidden);
            formInputsContainer.appendChild(acessibilityCaptionHidden);
            
            captionInput.addEventListener('input', function() {
                captionHidden.value = this.value;
            });

            acessibilityCaptionInput.addEventListener('input', function() {
                acessibilityCaptionHidden.value = this.value;
            });
            
            removeBtn.onclick = function() {
                imagePreview.removeChild(imageItem);
                formInputsContainer.removeChild(fileInput);
                formInputsContainer.removeChild(captionHidden);
            };
            
            imageItem.appendChild(img);
            imageItem.appendChild(captionInput);
            imageItem.appendChild(acessibilityCaptionInput);
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

