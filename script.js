let imageDataUrl = "";

const upload = document.getElementById('upload');
const imagePreview = document.getElementById('imagePreview');
const svgPreview = document.getElementById('svgPreview');
const svgCode = document.getElementById('svgCode');

upload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    imageDataUrl = ev.target.result;
    imagePreview.innerHTML = `<img src="${imageDataUrl}">`;
  };
  reader.readAsDataURL(file);
});

function traceImage() {
  if (!imageDataUrl) { 
    alert("Please select an image first");
    return; 
  }
  ImageTracer.imageToSVG(imageDataUrl, function(svgstr) {
    svgPreview.innerHTML = svgstr;
    svgCode.value = svgstr;
  }, { numberofcolors: 8, strokewidth: 1, turdsize: 10 });
}

function downloadSVG() {
  if (!svgCode.value) { 
    alert("No SVG to download"); 
    return; 
  }
  const blob = new Blob([svgCode.value], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'trace.svg';
  a.click();
  URL.revokeObjectURL(url);
}