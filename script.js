const photoUpload = document.getElementById('photo-upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const downloadBtn = document.getElementById('download-btn');
const placeholderText = document.getElementById('placeholder-text');

// CONFIGURATIONURATION
// You can adjust these numbers to fit your frame perfectly.
const CIRCLE_CONFIG = {
    centerX: 2345,    // Move LEFT/RIGHT (Smaller = Left, Larger = Right)
    centerY: 2600,    // Move UP/DOWN    (Smaller = Up,   Larger = Down)
    radius: 525       // Size of the photo circle
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

    // 3. Setup Clipping Region (The Circle)
    ctx.save(); // Save state
    ctx.beginPath();
    ctx.arc(CIRCLE_CONFIG.centerX, CIRCLE_CONFIG.centerY, CIRCLE_CONFIG.radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip(); // Restrict drawing to this circle

    // 4. Draw User Image (Top Layer, clipped to circle)
    // We want the image to "cover" the circle, meaning the smallest dimension matches the diameter
    const diameter = CIRCLE_CONFIG.radius * 2;
    const scale = Math.max(diameter / currentUserImg.width, diameter / currentUserImg.height);

    const w = currentUserImg.width * scale;
    const h = currentUserImg.height * scale;

    // Center the image within the circle's bounding box
    const x = CIRCLE_CONFIG.centerX - (w / 2);
    const y = CIRCLE_CONFIG.centerY - (h / 2);

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
