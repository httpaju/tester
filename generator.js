
document.getElementById("generate-btn").addEventListener("click", () => {
  const text = document.getElementById("text-input").value;
  const canvas = document.getElementById("qrcode");

  if (text) {
    QRCode.toCanvas(canvas, text, (error) => {
      if (error) console.error(error);

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
