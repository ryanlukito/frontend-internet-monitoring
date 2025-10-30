"use client";

import { useState } from "react";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Home() {
  const [latency, setLatency] = useState<number | null>(null);
  const [downloadSpeed, setDownloadSpeed] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState({ ping: false, speed: false });

  // ✅ Client-side latency measurement
  const measureLatency = async () => {
    const url = `${API_BASE_URL}/ping`;
    const start = performance.now();
    await fetch(url);
    const end = performance.now();
    return Math.round(end - start);
  };

  // ✅ Client-side download speed measurement
  const measureDownload = async () => {
    // You can choose a smaller/larger test file if desired
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

  const runClientTest = async () => {
    setLoading({ ping: true, speed: true });
    setLatency(null);
    setDownloadSpeed(null);

    try {
      const latencyResult = await measureLatency();
      const downloadResult = await measureDownload();

      setLatency(latencyResult);
      setDownloadSpeed(downloadResult);
      setHistory((prev) => [...prev.slice(-9), latencyResult]);

      // ✅ Send results to FastAPI backend for logging
      await axios.post(`${API_BASE_URL}/client_result`, {
        latency: latencyResult,
        download: downloadResult,
      });
    } catch (err) {
      console.error("Client-side test failed", err);
    } finally {
      setLoading({ ping: false, speed: false });
    }
  };

  const avgLatency =
    history.length > 0
      ? (history.reduce((a, b) => a + b, 0) / history.length).toFixed(2)
      : null;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4 sm:p-6 md:p-10 space-y-6">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center">
        🌐 Internet Monitor
      </h1>

      {/* Latency Section */}
      <section className="text-center space-y-1">
        <p className="text-base sm:text-lg">
          Current Latency:{" "}
          <span className="font-semibold text-blue-400">
            {latency ?? "--"} ms
          </span>
        </p>
        {avgLatency && (
          <p className="text-sm sm:text-base text-gray-300">
            Average Latency (last 10): {avgLatency} ms
          </p>
        )}
      </section>

      {/* Speed Section */}
      <section className="text-center bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 w-full max-w-md">
        <h2 className="text-lg sm:text-xl font-semibold mb-3">
          ⚡ Client Speed Test
        </h2>
        <p className="text-base sm:text-lg">
          📥 Download:{" "}
          <span className="font-semibold text-green-400">
            {downloadSpeed ?? "--"} Mbps
          </span>
        </p>
      </section>

      {/* Button */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          onClick={runClientTest}
          disabled={loading.ping || loading.speed}
          className={`px-5 py-2 rounded-lg text-white font-semibold transition-all ${
            loading.ping || loading.speed
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading.ping || loading.speed ? "Testing..." : "Run Client Test"}
        </button>
      </div>

      {/* Latency History */}
      <section className="w-full max-w-lg mt-6 text-center">
        <h2 className="text-lg sm:text-xl font-semibold mb-3">
          📊 Latency History
        </h2>
        <div className="flex flex-wrap justify-center gap-2">
          {history.map((l, i) => (
            <span
              key={i}
              className="bg-blue-500 px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs sm:text-sm"
            >
              {l}ms
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
