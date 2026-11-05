const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Objects
const flowers = [];
const particles = [];
const petals = [];

const colorPalettes = [
  ['#ff7675', '#d63031', '#e84393'],
  ['#fd79a8', '#e84393', '#6c5ce7'],
  ['#ff9ff3', '#f368e0', '#ff6b6b'],
  ['#fea47f', '#f97f51', '#b33939'],
  ['#e056fd', '#be2edd', '#4834d4']
];

// Flower Class
class Flower {
  constructor(x, targetY) {
    this.x = x;
    this.currentY = height;
    this.targetY = targetY;
    this.stemHeight = 0;
    this.maxStemHeight = height - targetY;
    this.growthSpeed = Math.random() * 2 + 3;
    
    this.bloomProgress = 0;
    this.maxBloom = 1;
    this.bloomSpeed = 0.02;

    this.palette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
    this.petalCount = Math.floor(Math.random() * 4) + 6;
    this.size = Math.random() * 20 + 35;
    this.isFullyGrown = false;
  }

  update() {
    if (this.currentY > this.targetY) {
      this.currentY -= this.growthSpeed;
      if (this.currentY <= this.targetY) {
        this.currentY = this.targetY;
      }
    } else if (this.bloomProgress < this.maxBloom) {
      this.bloomProgress += this.bloomSpeed;
      if (this.bloomProgress >= this.maxBloom) {
        this.isFullyGrown = true;
      }
    }
  }

  draw() {
    // Draw Stem
    ctx.beginPath();
    ctx.moveTo(this.x, height);
    ctx.quadraticCurveTo(
      this.x + Math.sin(this.currentY * 0.01) * 15,
      (height + this.currentY) / 2,
      this.x,
      this.currentY
    );
    ctx.strokeStyle = '#2ed573';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw Leaves
    if (height - this.currentY > 60) {
      this.drawLeaf(this.x, height - 50, -1);
      this.drawLeaf(this.x, height - 120, 1);
    }

    // Draw Flower Head
    if (this.currentY <= this.targetY) {
      ctx.save();
      ctx.translate(this.x, this.currentY);

      // Layered Petals
      const currentPetalSize = this.size * this.bloomProgress;
      for (let layer = 3; layer >= 1; layer--) {
        const layerSize = currentPetalSize * (layer / 3);
        const color = this.palette[layer - 1];

        for (let i = 0; i < this.petalCount; i++) {
          const angle = (Math.PI * 2 / this.petalCount) * i + (layer * 0.2);
          ctx.save();
          ctx.rotate(angle);

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(layerSize * 0.6, -layerSize * 0.8, 0, -layerSize * 1.3);
          ctx.quadraticCurveTo(-layerSize * 0.6, -layerSize * 0.8, 0, 0);
          ctx.fillStyle = color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = color;
          ctx.fill();

          ctx.restore();
        }
      }

      // Flower Center Stamen
      ctx.beginPath();
      ctx.arc(0, 0, 8 * this.bloomProgress, 0, Math.PI * 2);
      ctx.fillStyle = '#f9ca24';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#f9ca24';
      ctx.fill();

      ctx.restore();
    }
  }

  drawLeaf(x, y, dir) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dir, 1);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(20, -10, 35, -5);
    ctx.quadraticCurveTo(20, 15, 0, 0);
    ctx.fillStyle = '#26de81';
    ctx.fill();
    ctx.restore();
  }
}

// Background Floating Petals
class FloatingPetal {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * width;
    this.y = -20;
    this.size = Math.random() * 8 + 6;
    this.speedY = Math.random() * 1.5 + 0.8;
    this.speedX = Math.random() * 1 - 0.5;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = Math.random() * 0.02 - 0.01;
    this.color = colorPalettes[Math.floor(Math.random() * colorPalettes.length)][0];
  }

  update() {
    this.y += this.speedY;
    this.x += Math.sin(this.y * 0.01) + this.speedX;
    this.rotation += this.rotSpeed;

    if (this.y > height + 20) {
      this.reset();
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.opacity = 0.7;
    ctx.fill();
    ctx.restore();
  }
}

// Initial Garden Setup (Multiple Flowers)
function initGarden() {
  const initialCount = Math.floor(width / 120);
  for (let i = 0; i < initialCount; i++) {
    const x = (width / (initialCount + 1)) * (i + 1) + (Math.random() * 30 - 15);
    const targetY = height * 0.35 + Math.random() * (height * 0.35);
    flowers.push(new Flower(x, targetY));
  }

  for (let i = 0; i < 25; i++) {
    petals.push(new FloatingPetal());
  }
}

initGarden();

// Click/Tap to Add Extra Flowers
window.addEventListener('click', (e) => {
  // Prevent spawning if clicking controls or modal
  if (e.target.closest('.controls') || e.target.closest('.modal')) return;

  const targetY = Math.max(e.clientY, height * 0.25);
  flowers.push(new Flower(e.clientX, targetY));
});

// Animation Loop
function animate() {
  ctx.clearRect(0, 0, width, height);

  // Update & Draw Petals
  petals.forEach(p => {
    p.update();
    p.draw();
  });

  // Update & Draw Flowers
  flowers.forEach(f => {
    f.update();
    f.draw();
  });

  requestAnimationFrame(animate);
}
animate();

// Music Player Logic
const musicBtn = document.getElementById('music-btn');
const bgMusic = document.getElementById('bg-music');
let isPlaying = false;

musicBtn.addEventListener('click', async () => {
  if (isPlaying) {
    bgMusic.pause();
    musicBtn.textContent = '🎵 Play Music';
    isPlaying = false;
  } else {
    try {
      await bgMusic.play();
      musicBtn.textContent = '⏸️ Pause Music';
      isPlaying = true;
    } catch (err) {
      console.log("Audio play failed:", err);
      alert("Audio file error (filename: song.mp3)");
    }
  }
});

// Modal UI Logic
const noteBtn = document.getElementById('note-btn');
const noteModal = document.getElementById('note-modal');
const closeModal = document.getElementById('close-modal');

noteBtn.addEventListener('click', () => {
  noteModal.classList.remove('hidden');
});

closeModal.addEventListener('click', () => {
  noteModal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
  if (e.target === noteModal) {
    noteModal.classList.add('hidden');
  }
});