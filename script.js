
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
let cameraIndex = 0; // Track the current camera index
let cameras = []; // Store available cameras

// Function to start the scanner with a specific camera
function startScanner(cameraId) {
  scanner
    .start(
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
    )
    .catch((error) => {
      console.error("Failed to start camera:", error);
    });
}

// Initialize cameras and start the first one
Html5Qrcode.getCameras()
  .then((devices) => {
    if (devices && devices.length) {
      cameras = devices; // Store available cameras
      startScanner(cameras[cameraIndex].id); // Start with the first camera
    } else {
      console.error("No cameras found!");
      document.getElementById("scanner").innerText = "No cameras available.";
    }
  })
  .catch((error) => {
    console.error("Error getting cameras:", error);
  });

// Switch between available cameras
document.getElementById("rotate-btn").addEventListener("click", () => {
  if (cameras.length > 1) {
    scanner
      .stop()
      .then(() => {
        // Rotate to the next camera
        cameraIndex = (cameraIndex + 1) % cameras.length;
        startScanner(cameras[cameraIndex].id); // Restart with the new camera
      })
      .catch((error) => {
        console.error("Error stopping the scanner:", error);
      });
  } else {
    alert("No additional cameras available!");
  }
});
