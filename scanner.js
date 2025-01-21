
const scanner = new Html5Qrcode("scanner");
let currentCameraIndex = 0;
let cameraDevices = [];

// Function to start scanning with a specific camera
function startCamera(cameraId) {
  scanner
    .start(
      cameraId,
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        document.getElementById("scanned-text").innerText = decodedText;
        scanner.stop(); // Stop scanning after decoding
      },
      (error) => {
        console.warn("Scanning error:", error);
      }
    )
    .catch((err) => {
      console.error("Failed to start the camera:", err);
    });
}

// Get available cameras and initialize the scanner
Html5Qrcode.getCameras()
  .then((devices) => {
    if (devices && devices.length > 0) {
      cameraDevices = devices;
      startCamera(cameraDevices[currentCameraIndex].id);
    } else {
      document.getElementById("scanner").innerText = "No cameras available.";
    }
  })
  .catch((err) => {
    console.error("Error fetching cameras:", err);
  });

// Switch to the next camera
document.getElementById("rotate-btn").addEventListener("click", () => {
  if (cameraDevices.length > 1) {
    scanner
      .stop()
      .then(() => {
        currentCameraIndex = (currentCameraIndex + 1) % cameraDevices.length;
        startCamera(cameraDevices[currentCameraIndex].id);
      })
      .catch((err) => {
        console.error("Error stopping scanner:", err);
      });
  } else {
    alert("No other cameras available!");
  }
});
