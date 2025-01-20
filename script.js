// QR Code Generator
document.getElementById("generate-btn").addEventListener("click", () => {
  const text = document.getElementById("text-input").value;
  if (text) {
    const canvas = document.getElementById("qrcode");
    QRCode.toCanvas(canvas, text, (error) => {
      if (error) console.error(error);
    });
  } else {
    alert("Please enter text or URL to generate a QR code!");
  }
});

// QR Code Scanner
const scanner = new Html5Qrcode("scanner");

Html5Qrcode.getCameras()
  .then((devices) => {
    if (devices && devices.length) {
      const cameraId = devices[0].id;
      scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: 250,
        },
        (decodedText) => {
          document.getElementById("scanned-text").innerText = decodedText;
          scanner.stop();
        },
        (error) => {
          console.error("Scanning error:", error);
        }
      );
    }
  })
  .catch((error) => {
    console.error("Camera not found!", error);
  });
