// QR Code Generator
document.getElementById("generate-btn").addEventListener("click", () => {
  const text = document.getElementById("text-input").value;
  const canvas = document.getElementById("qrcode");

  if (text) {
    // Generate the QR Code
    QRCode.toCanvas(canvas, text, (error) => {
      if (error) console.error(error);

      // Show the download button
      const downloadBtn = document.getElementById("download-btn");
      const dataUrl = canvas.toDataURL("image/png");
      downloadBtn.href = dataUrl;
      downloadBtn.download = "qrcode.png";
      downloadBtn.style.display = "inline-block";
    });
  } else {
    alert("Please enter text or URL to generate a QR code!");
  }
});

// QR Code Scanner with Camera Rotation
const scanner = new Html5Qrcode("scanner");
let cameraIndex = 0; // To track the current camera
let cameras = []; // To store available cameras

// Function to start the scanner with a specific camera
function startScanner(cameraId) {
  scanner.start(
    cameraId,
    {
      fps: 10,
      qrbox: 250,
    },
    (decodedText) => {
      document.getElementById("scanned-text").innerText = decodedText;
      scanner.stop(); // Stop the scanner after a successful scan
    },
    (error) => {
      console.error("Scanning error:", error);
    }
  );
}

// Get available cameras and start the first one
Html5Qrcode.getCameras()
  .then((devices) => {
    if (devices && devices.length) {
      cameras = devices; // Store the camera list
      startScanner(cameras[cameraIndex].id); // Start with the first camera
    } else {
      console.error("No cameras found!");
    }
  })
  .catch((error) => {
    console.error("Error getting cameras:", error);
  });

// Rotate between cameras
document.getElementById("rotate-btn").addEventListener("click", () => {
  if (cameras.length > 1) {
    scanner.stop().then(() => {
      cameraIndex = (cameraIndex + 1) % cameras.length; // Switch to the next camera
      startScanner(cameras[cameraIndex].id);
    });
  } else {
    alert("No additional cameras available!");
  }
});
