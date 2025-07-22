const socket = io();
const canvas = new fabric.Canvas('c', { backgroundColor: '#fff' });

// Sync canvas on object add or modify
function syncCanvas() {
  const json = canvas.toJSON();
  socket.emit('canvas:update', json);
}

canvas.on('object:added', syncCanvas);
canvas.on('object:modified', syncCanvas);

// Receive canvas updates from server
socket.on('canvas:update', (data) => {
  canvas.loadFromJSON(data, canvas.renderAll.bind(canvas));
});

// Upload and display image
document.getElementById('imgInput').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (f) {
    fabric.Image.fromURL(f.target.result, function (img) {
      img.set({
        left: 100,
        top: 100,
        scaleX: 0.5,
        scaleY: 0.5,
      });
      canvas.add(img);
    }, { crossOrigin: 'anonymous' });
  };
  reader.readAsDataURL(file);
});

// Add text to canvas
document.getElementById('addText').addEventListener('click', function () {
  const text = document.getElementById('textInput').value.trim();
  if (!text) return;

  const textObj = new fabric.Textbox(text, {
    left: 50,
    top: 50,
    fill: '#000',
    fontSize: 28,
    fontFamily: 'Rubik',
  });
  canvas.add(textObj);
});

// Clear canvas
document.getElementById('clearCanvas').addEventListener('click', function () {
  canvas.clear();
  canvas.setBackgroundColor('#fff', canvas.renderAll.bind(canvas));
  syncCanvas();
});

// Voting (placeholder logic)
let voteCount = 0;
document.getElementById('submitMeme').addEventListener('click', () => {
  voteCount++;
  document.getElementById('voteCount').innerText = voteCount;
  document.getElementById('submitMessage').style.display = 'block';
  document.getElementById('submitMessage').innerText = 'Meme submitted!';

  setTimeout(() => {
    document.getElementById('submitMessage').style.display = 'none';
  }, 2000);
});
