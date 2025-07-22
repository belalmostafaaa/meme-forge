const socket = io();
const canvas = new fabric.Canvas('c', { backgroundColor: '#fff' });

/* ========== Efficient Canvas Sync with Debounce ========== */
let syncTimeout;
function syncCanvas() {
  clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    const json = canvas.toJSON();
    socket.emit('canvas:update', json);
  }, 300); // 300ms delay to reduce traffic
}

canvas.on('object:added', syncCanvas);
canvas.on('object:modified', syncCanvas);

/* ========== Receive Canvas Updates from Server ========== */
socket.on('canvas:update', (data) => {
  canvas.loadFromJSON(data, canvas.renderAll.bind(canvas));
});

/* ========== Handle Image Uploads ========== */
document.getElementById('imgInput').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (f) {
    fabric.Image.fromURL(f.target.result, function (img) {
      // Auto scale to fit canvas if image is too large
      const scaleFactor = Math.min(
        canvas.width / img.width,
        canvas.height / img.height,
        1
      );
      img.set({
        left: canvas.width / 2 - (img.width * scaleFactor) / 2,
        top: canvas.height / 2 - (img.height * scaleFactor) / 2,
        scaleX: scaleFactor,
        scaleY: scaleFactor,
        selectable: true,
      });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      syncCanvas(); // Immediate sync
    }, { crossOrigin: 'anonymous' });
  };
  reader.onerror = function () {
    alert("Failed to read the image file.");
  };
  reader.readAsDataURL(file);
});

/* ========== Add Text to Canvas ========== */
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
  canvas.setActiveObject(textObj);
  syncCanvas();
});

/* ========== Clear Canvas ========== */
document.getElementById('clearCanvas').addEventListener('click', function () {
  canvas.clear();
  canvas.setBackgroundColor('#fff', canvas.renderAll.bind(canvas));
  syncCanvas();
});

/* ========== Voting System (Simple Local Logic) ========== */
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
