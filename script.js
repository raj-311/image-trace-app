let rasterDataUrl = null;
let svgString = "";
const errorEl = document.getElementById("error");
const loadingEl = document.getElementById("loading");
const inputPreview = document.getElementById("inputPreview");
const svgOutput = document.getElementById("svgOutput");
const svgActions = document.getElementById("svgActions");

function handleFile(event) {
  errorEl.textContent = "";
  loadingEl.textContent = "";
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    errorEl.textContent = "Please upload an image file.";
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    rasterDataUrl = e.target.result;
    showInputImage(rasterDataUrl);
    runTrace();
  };
  reader.onerror = () => {
    errorEl.textContent = "Failed to read file.";
  };
  reader.readAsDataURL(file);
}

function handleDrop(event) {
  event.preventDefault();
  errorEl.textContent = "";
  loadingEl.textContent = "";
  const file = event.dataTransfer.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    errorEl.textContent = "Please upload an image file.";
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    rasterDataUrl = e.target.result;
    showInputImage(rasterDataUrl);
    runTrace();
  };
  reader.onerror = () => {
    errorEl.textContent = "Failed to read file.";
  };
  reader.readAsDataURL(file);
}

function showInputImage(dataUrl) {
  inputPreview.innerHTML = `<img src="${dataUrl}" alt="Input Image" style="max-width:100%; max-height:100%;">`;
}

function runTrace() {
  if (!window.ImageTracer) {
    errorEl.textContent = "ImageTracer library not loaded yet.";
    return;
  }
  if (!rasterDataUrl) return;

  loadingEl.textContent = "Tracing... please wait";
  svgOutput.innerHTML = "";
  svgActions.style.display = "none";

  const mode = document.getElementById("mode").value;
  const colors = Number(document.getElementById("colors").value);
  const turdSize = Number(document.getElementById("turdSize").value);
  const strokeWidth = Number(document.getElementById("strokeWidth").value);

  let options = {
    ltres: 1,
    qtres: 1,
    pathomit: 8,
    rightangleenhance: false,
    colorsampling: 2,
    numberofcolors: Math.max(2, Math.floor(colors)),
    strokewidth: strokeWidth || 1,
    scale: 1,
    roundcoordinates: 1,
    blurradius: 0,
    turdsize: Math.max(1, Math.floor(turdSize)),
  };

  if (mode === "grayscale") {
    options.numberofcolors = 2;
    options.mode = "grayscale";
  } else if (mode === "color") {
    options.numberofcolors = Math.max(2, Math.floor(colors));
    options.mode = "color";
  } else {
    options.numberofcolors = Math.max(2, Math.floor(colors));
    options.mode = "posterized";
  }

  try {
    errorEl.textContent = "";
    window.ImageTracer.imageToSVG(rasterDataUrl, (svgstr) => {
      svgString = svgstr;
      svgOutput.innerHTML = svgstr;
      svgActions.style.display = "block";
      loadingEl.textContent = "";
    }, options);
  } catch (e) {
    errorEl.textContent = "Error during tracing: " + e.message;
    loadingEl.textContent = "";
  }
}

function updateVal(el) {
  const spanMap = {
    colors: "colorsVal",
    turdSize: "turdVal",
    strokeWidth: "strokeVal",
  };
  if (spanMap[el.id]) {
    document.getElementById(spanMap[el.id]).textContent = el.value;
  }
  runTrace();
}

function downloadSvg() {
  if (!svgString) return;
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "trace.svg";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function copySvg() {
  if (!svgString) return;
  try {
    await navigator.clipboard.writeText(svgString);
    alert("SVG copied to clipboard");
  } catch (e) {
    errorEl.textContent = "Failed to copy SVG: " + e.message;
  }
}
