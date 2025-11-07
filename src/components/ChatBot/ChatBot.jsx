import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import "./ChatBot.css";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "¡Hola! 👋 Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
      isBot: true,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);

  // Cargar FAQs desde Supabase
  useEffect(() => {
    async function fetchFAQs() {
      const { data, error } = await supabase
        .from("faq")
        .select("*")
        .eq("activo", true)
        .order("orden", { ascending: true });

      if (!error && data) {
        setFaqs(data);
      }
    }
    fetchFAQs();
  }, []);

  // Scroll automático al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Agregar mensaje del usuario
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      isBot: false,
    };
    setMessages((prev) => [...prev, userMessage]);
    setShowSuggestions(false);

    // Buscar respuesta en FAQs
    const foundFaq = findAnswer(inputValue);

    setTimeout(() => {
      if (foundFaq) {
        const botMessage = {
          id: Date.now() + 1,
          text: foundFaq.respuesta,
          isBot: true,
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const botMessage = {
          id: Date.now() + 1,
          text: "Lo siento, no tengo una respuesta para esa pregunta. 😅 ¿Puedo ayudarte con algo más?",
          isBot: true,
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    }, 500);

    setInputValue("");
  };

  const findAnswer = (question) => {
    const lowerQuestion = question.toLowerCase();
    return faqs.find((faq) => {
      const keywords = faq.palabras_clave
        ? faq.palabras_clave.toLowerCase().split(",")
        : [];
      return keywords.some((keyword) => lowerQuestion.includes(keyword.trim()));
    });
  };

  const handleSuggestionClick = (faq) => {
    const userMessage = {
      id: Date.now(),
      text: faq.pregunta,
      isBot: false,
    };
    setMessages((prev) => [...prev, userMessage]);
    setShowSuggestions(false);

    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        text: faq.respuesta,
        isBot: true,
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: 1,
        text: "¡Hola! 👋 Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?",
        isBot: true,
      },
    ]);
    setShowSuggestions(true);
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        className={`chat-float-button ${isOpen ? "hidden" : ""}`}
        onClick={() => setIsOpen(true)}
        aria-label="Abrir chat de ayuda"
      >
        <span className="chat-icon">💬</span>
        <span className="chat-pulse"></span>
      </button>

      {/* Ventana de chat */}
      {isOpen && (
        <div className="chat-container">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">🤖</div>
              <div>
                <h3>Asistente Virtual</h3>
                <p className="chat-status">
                  <span className="status-dot"></span>
                  En línea
                </p>
              </div>
            </div>
            <div className="chat-header-actions">
              <button
                onClick={resetChat}
                className="chat-action-btn"
                title="Reiniciar chat"
              >
                🔄
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="chat-close-btn"
                aria-label="Cerrar chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Mensajes */}
          <div className="chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message ${
                  message.isBot ? "bot-message" : "user-message"
                }`}
              >
                {message.isBot && <div className="message-avatar">🤖</div>}
                <div className="message-bubble">{message.text}</div>
              </div>
            ))}

            {/* Sugerencias de preguntas frecuentes */}
            {showSuggestions && faqs.length > 0 && (
              <div className="chat-suggestions">
                <p className="suggestions-title">Preguntas frecuentes:</p>
                {faqs.slice(0, 4).map((faq) => (
                  <button
                    key={faq.id}
                    className="suggestion-btn"
                    onClick={() => handleSuggestionClick(faq)}
                  >
                    {faq.pregunta}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-container">
            <input
              type="text"
              className="chat-input"
              placeholder="Escribe tu pregunta..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              className="chat-send-btn"
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
