const socket = io(window.location.origin);
const canvas = new fabric.Canvas('c', { backgroundColor: '#000' });

let voteCount = 0;
let captionText = '';

function syncCanvas() {
  const json = canvas.toJSON();
  socket.emit('canvas:update', json);
}

canvas.on('object:added', syncCanvas);
canvas.on('object:modified', syncCanvas);

socket.on('canvas:update', (data) => {
  canvas.loadFromJSON(data, canvas.renderAll.bind(canvas));
});

document.getElementById('imgInput').addEventListener('change', (e) => {
  const reader = new FileReader();
  reader.onload = function (f) {
    fabric.Image.fromURL(f.target.result, (img) => {
      img.scaleToWidth(canvas.getWidth());
      img.scaleToHeight(canvas.getHeight());
      img.set({
        left: 0,
        top: 0,
        selectable: false,
        hasBorders: false,
        hasControls: false,
        evented: false
      });
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
    });
  };
  reader.readAsDataURL(e.target.files[0]);
});


document.getElementById('addText').onclick = () => {
  const textValue = document.getElementById('textInput').value;
  if (!textValue.trim()) return;
  captionText = textValue;
  document.getElementById('captionDisplay').innerText = captionText;
  document.getElementById('textInput').value = '';
};


document.getElementById('submitMeme').onclick = () => {
  const canvasJSON = canvas.toJSON(['src']);
  const imageData = canvas.toDataURL({ format: 'png' });

  socket.emit('meme:submit', {
    json: canvasJSON,
    image: imageData,
    caption: captionText  
  });

  const messageEl = document.getElementById('submitMessage');
messageEl.textContent = ' Meme submitted! You can view it in the gallery.';
messageEl.style.display = 'block';

setTimeout(() => {
  messageEl.style.display = 'none';
}, 4000);

};


document.getElementById('clearCanvas').onclick = () => {
  canvas.clear();
  canvas.backgroundColor = '#000';
  syncCanvas();
  voteCount = 0;
  captionText = '';
  document.getElementById('voteCount').innerText = voteCount;
  document.getElementById('captionDisplay').innerText = '';
};

document.getElementById('saveMeme')?.addEventListener('click', () => {
  const dataURL = canvas.toDataURL({ format: 'png' });
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'meme.png';
  link.click();
});
