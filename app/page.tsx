"use client";

import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [latency, setLatency] = useState<number | null>(null);
  const [speed, setSpeed] = useState<{ download: number | null; upload: number | null }>({
    download: null,
    upload: null,
  });
  const [history, setHistory] = useState<number[]>([]);
  const [loading, setLoading] = useState({ ping: false, speed: false });

  const checkPing = async () => {
    setLoading((p) => ({ ...p, ping: true }));
    try {
      const res = await axios.get("http://localhost:8000/ping");
      if (res.data.latency !== null) {
        setLatency(res.data.latency);
        setHistory((prev) => [...prev.slice(-9), res.data.latency]);
      }
    } catch (err) {
      console.error("Ping failed", err);
    } finally {
      setLoading((p) => ({ ...p, ping: false }));
    }
  };

  const checkSpeed = async () => {
    setLoading((p) => ({ ...p, speed: true }));
    try {
      const res = await axios.get("http://localhost:8000/speed");
      setSpeed(res.data);
    } catch (err) {
      console.error("Speed test failed", err);
    } finally {
      setLoading((p) => ({ ...p, speed: false }));
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
        <h2 className="text-lg sm:text-xl font-semibold mb-3">⚡ Speed Test</h2>
        <div className="flex flex-col sm:flex-row justify-between text-sm sm:text-base">
          <p>📥 Download: {speed.download ?? "--"} Mbps</p>
          <p>📤 Upload: {speed.upload ?? "--"} Mbps</p>
        </div>
      </section>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          onClick={checkPing}
          disabled={loading.ping}
          className={`px-5 py-2 rounded-lg text-white font-semibold transition-all ${
            loading.ping
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading.ping ? "Checking..." : "Check Ping"}
        </button>

        <button
          onClick={checkSpeed}
          disabled={loading.speed}
          className={`px-5 py-2 rounded-lg text-white font-semibold transition-all ${
            loading.speed
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading.speed ? "Testing..." : "Check Speed"}
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
