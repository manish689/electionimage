const photoUpload = document.getElementById('photo-upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const downloadBtn = document.getElementById('download-btn');
const placeholderText = document.getElementById('placeholder-text');

// CONFIGURATION
// You can adjust these numbers to fit your frame perfectly.
const FRAME_CONFIG = {
    rectX: 548,       // Moved further right (was 505)
    rectY: 352.2,       // Moved slightly down (was 255)
    rectW: 374,       // Reduced width (was 525)
    rectH: 490,        // Reduced height (was 595)
    borderRadius: 38   // Added rounding for frame style
};

let frameImage = new Image();
frameImage.src = 'frame.png';

let currentUserImg = null;

// Ensure frame loads and sets canvas size
frameImage.onload = function () {
    console.log('Frame loaded', frameImage.width, frameImage.height);
    // Set canvas resolution to match the frame (high res)
    canvas.width = frameImage.width;
    canvas.height = frameImage.height;

    // Redraw if user image is already waiting
    if (currentUserImg) {
        drawCanvas();
    }
};

frameImage.onerror = function () {
    console.error('Failed to load frame.png');
    alert('Error: frame.png not found.');
};

photoUpload.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (event) {
        const userImg = new Image();
        userImg.onload = function () {
            currentUserImg = userImg;
            drawCanvas();
        };
        userImg.src = event.target.result;
    };

    reader.readAsDataURL(file);
});

function drawCanvas() {
    // If frame isn't loaded yet, or has 0 size, we can't draw properly
    if (!frameImage.complete || frameImage.naturalWidth === 0) return;

    // Ensure canvas matches frame size (in case frame loaded later)
    if (canvas.width !== frameImage.width) {
        canvas.width = frameImage.width;
        canvas.height = frameImage.height;
    }

    if (!currentUserImg) return;

    // 1. Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Frame (Bottom Layer)
    ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height);

    // 3. Setup Clipping Region (The Rounded Rectangle)
    ctx.save(); // Save state
    ctx.beginPath();
    if (ctx.roundRect) {
        // Apply borderRadius only to Top-Left and Top-Right (radii: [TL, TR, BR, BL])
        ctx.roundRect(FRAME_CONFIG.rectX, FRAME_CONFIG.rectY, FRAME_CONFIG.rectW, FRAME_CONFIG.rectH, [FRAME_CONFIG.borderRadius, FRAME_CONFIG.borderRadius, 0, 0]);
    } else {
        // Fallback for older browsers
        ctx.rect(FRAME_CONFIG.rectX, FRAME_CONFIG.rectY, FRAME_CONFIG.rectW, FRAME_CONFIG.rectH);
    }
    ctx.closePath();
    ctx.clip(); // Restrict drawing to this rounded rectangular area

    // 4. Draw User Image (Top Layer, clipped to rectangle)
    // We want the image to "cover" the rectangle
    const scale = Math.max(FRAME_CONFIG.rectW / currentUserImg.width, FRAME_CONFIG.rectH / currentUserImg.height);

    const w = currentUserImg.width * scale;
    const h = currentUserImg.height * scale;

    // Center the image within the rectangular area
    const x = FRAME_CONFIG.rectX + (FRAME_CONFIG.rectW / 2) - (w / 2);
    const y = FRAME_CONFIG.rectY + (FRAME_CONFIG.rectH / 2) - (h / 2);

    ctx.drawImage(currentUserImg, x, y, w, h);

    ctx.restore(); // Remove clipping

    // 5. Update UI
    canvas.classList.add('active');
    placeholderText.style.display = 'none';
    downloadBtn.disabled = false;
}

downloadBtn.addEventListener('click', function () {
    const link = document.createElement('a');
    link.download = 'campaign-photo.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});

