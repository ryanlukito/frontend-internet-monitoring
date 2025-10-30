export const measureLatency = async (API_BASE_URL:string) => {
    const url = `${API_BASE_URL}/ping`;
    const start = performance.now();
    await fetch(url);
    const end = performance.now();
    return Math.round(end - start);
};

export const measureDownload = async () => {
    const fileUrl = "https://cachefly.cachefly.net/10mb.test?cache=";
    const startTime = performance.now();
    const response = await fetch(fileUrl + Math.random());
    const blob = await response.blob();
    const endTime = performance.now();

    const duration = (endTime - startTime) / 1000;
    const bitsLoaded = blob.size * 8;
    const speedMbps = bitsLoaded / duration / 1024 / 1024;
    return parseFloat(speedMbps.toFixed(2));
};

export const measureUpload = async (API_BASE_URL: string) => {
  const chunkSize = 1042 * 1042; // 1 MB
  const totalChunks = 10; // 10 MB
  let uploadedBits = 0;

  const startTime = performance.now();

  for (let i = 0; i < totalChunks; i++) {
    const chunk = new Uint8Array(chunkSize).fill(1);
    const blob = new Blob([chunk]);
    await fetch(`${API_BASE_URL}/upload_test`, {
      method: "POST",
      body: blob,
      headers: { "Content-Type": "application/octet-stream" },
    });
    uploadedBits += blob.size * 8;
  }

  const endTime = performance.now();
  const duration = (endTime - startTime) / 1000;
  const speedMbps = uploadedBits / duration / 1024 / 1024;
  return parseFloat(speedMbps.toFixed(2));
};
