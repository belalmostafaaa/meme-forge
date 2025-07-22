const socket = io();
const canvas = new fabric.Canvas('c', { backgroundColor: '#000' });

let voteCount = 0;
let captionText = '';

// 🔄 Sync canvas state to server
function syncCanvas() {
  const json = canvas.toJSON();
  socket.emit('canvas:update', json);
}

// 📤 Send updates to server on object changes
canvas.on('object:added', syncCanvas);
canvas.on('object:modified', syncCanvas);
canvas.on('object:removed', syncCanvas);

// 📥 Receive canvas updates from server
socket.on('canvas:update', (data) => {
  canvas.loadFromJSON(data, () => {
    canvas.renderAll();
  });
});

// ✏️ Add text caption
document.getElementById('addCaption').addEventListener('click', () => {
  const caption = new fabric.Textbox(captionText || 'Enter your caption', {
    left: 50,
    top: 50,
    fill: '#fff',
    fontSize: 24,
  });
  canvas.add(caption);
  syncCanvas();
});

// 🖼️ Handle image upload as base64
document.getElementById('imageUpload').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (event) {
    fabric.Image.fromURL(event.target.result, function (img) {
      img.set({
        left: 100,
        top: 100,
        scaleX: 0.5,
        scaleY: 0.5,
      });
      canvas.add(img);
      canvas.renderAll();
      syncCanvas();
    });
  };

  reader.readAsDataURL(file); // 🔁 Convert image to base64
});

// 🧽 Clear canvas (local + sync)
document.getElementById('clearCanvas').addEventListener('click', () => {
  canvas.clear().setBackgroundColor('#000', canvas.renderAll.bind(canvas));
  syncCanvas();
});

// 🗳️ Voting (just a counter example, you can improve this logic)
document.getElementById('voteButton').addEventListener('click', () => {
  voteCount++;
  document.getElementById('voteCount').textContent = `Votes: ${voteCount}`;
  // You can sync voteCount via socket too if needed
});

// 📝 Optional: Listen for caption text input
document.getElementById('captionInput').addEventListener('input', (e) => {
  captionText = e.target.value;
});
