marmoviewer = document.getElementById('marmoviewer')

const iframe = document.createElement('iframe');
marmoview_link = marmoviewer.dataset.marmolink

iframe.srcdoc = `
                        <!DOCTYPE html>
                        <meta name="viewport" content="user-scalable=0"/>
                        <html>
                        <head>
                            <script src="https://viewer.marmoset.co/main/marmoset.js"></script>
                        </head>
                        <body id="body">
                            
                            <script>
                                bo= document.getElementById('body')
                                var myview= new marmoset.WebViewer(580,360,'${marmoview_link}')
                                bo.appendChild(myview.domRoot)

                            </script>
                        </body>
                        </html>`;

iframe.allowFullscreen=true
iframe.height=360
iframe.width=580
iframe.style.overflow='hidden'
iframe.style.width='100%'
iframe.style.border='none'
iframe.scrolling='no'
marmoviewer.appendChild(iframe)