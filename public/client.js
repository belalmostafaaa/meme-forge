const socket = io();
const canvas = new fabric.Canvas('c', { backgroundColor: '#000' });

// Sync function
function syncCanvas() {
  const json = canvas.toJSON();
  socket.emit('canvas:update', json);
}

// Update on local changes
canvas.on('object:added', syncCanvas);
canvas.on('object:modified', syncCanvas);
canvas.on('object:removed', syncCanvas);

// Load shared updates from others
socket.on('canvas:update', (data) => {
  canvas.loadFromJSON(data, canvas.renderAll.bind(canvas));
});

// Upload image and add to canvas
document.getElementById('uploadImage').addEventListener('change', function (e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function (event) {
    fabric.Image.fromURL(event.target.result, function (img) {
      img.set({ left: 100, top: 100, scaleX: 0.5, scaleY: 0.5 });
      canvas.add(img);
    });
  };

  if (file) {
    reader.readAsDataURL(file);
  }
});
