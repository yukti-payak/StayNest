import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { Mic, MicOff, Send, Bot, MapPin } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const CoHostWidget = ({ bookingId }) => {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // Initialize Mapbox Map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [77.209, 28.6139],
      zoom: 13,
    });

    return () => mapRef.current?.remove();
  }, []);

  // Browser Text-to-Speech Output
  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Browser Speech-to-Text Input
  const toggleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    if (!isListening) {
      setIsListening(true);
      recognition.start();

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuestion(transcript);
        setIsListening(false);
        handleSend(transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } else {
      setIsListening(false);
    }
  };

  // Plot dynamic Mapbox pins returned by backend API
  const plotMarkersOnMap = (markers, propertyCoords) => {
    if (!mapRef.current) return;

    // Clear previous markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (propertyCoords) {
      mapRef.current.flyTo({ center: propertyCoords, zoom: 14 });
    }

    markers.forEach((place) => {
      const marker = new mapboxgl.Marker({ color: "#2563eb" })
        .setLngLat(place.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div style="color:#000;"><strong>${place.name}</strong><p style="margin:0;font-size:12px;">${place.address}</p></div>`
          )
        )
        .addTo(mapRef.current);

      markersRef.current.push(marker);
    });
  };

  const handleSend = async (queryText) => {
    const prompt = queryText || question;
    if (!prompt.trim()) return;

    const userMessage = { sender: "user", text: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("/api/cohost/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ bookingId, question: prompt }),
      });

      const data = await response.json();

      if (response.ok) {
        const aiMessage = { sender: "ai", text: data.answer };
        setMessages((prev) => [...prev, aiMessage]);
        speakText(data.answer);

        if (data.markers && data.markers.length > 0) {
          plotMarkersOnMap(data.markers, data.propertyCoordinates);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: data.message || "Unable to retrieve response." },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Error connecting to AI Co-Host server." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[550px] border rounded-2xl p-4 bg-white shadow-sm">
      {/* Chat Column */}
      <div className="flex flex-col h-full border rounded-xl p-3 bg-slate-50">
        <div className="flex items-center gap-2 pb-2 mb-2 border-b">
          <Bot className="text-blue-600 w-5 h-5" />
          <h3 className="font-semibold text-slate-800">AI Local Co-Host</h3>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-slate-800 border rounded-bl-none shadow-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <p className="text-xs text-slate-500 italic">Co-Host is typing...</p>
          )}
        </div>

        <div className="flex items-center gap-2 mt-3 pt-2 border-t">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about Wi-Fi, house rules, or nearby places..."
            className="flex-1 px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={toggleVoiceInput}
            className={`p-2 rounded-lg border transition ${
              isListening ? "bg-red-100 text-red-600" : "bg-white text-slate-600"
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button
            onClick={() => handleSend()}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Interactive Map Column */}
      <div className="relative w-full h-full rounded-xl overflow-hidden border">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default CoHostWidget;