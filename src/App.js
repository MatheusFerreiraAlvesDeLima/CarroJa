// App.js
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Carrossel from './Carrossel';
import cars from './cars.json';






function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [userPreferences, setUserPreferences] = useState({
    name: '',
    carPurpose: [],
    budget: [],
    fuelType: [],
    transmission: []
  });
  const [conversationStage, setConversationStage] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showStickyButtons, setShowStickyButtons] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isSendEnabled, setIsSendEnabled] = useState(false);

  const nextStageMessage = {
    2: 'E qual o seu orçamento aproximado? (Selecione um ou mais)',
    3: 'E quanto ao tipo de combustível, qual você prefere? (Selecione um ou mais)',
    4: 'Agora me diga: você prefere câmbio manual ou automático? (Selecione um ou mais)'
  };

  const preferenceField = {
    2: 'carPurpose',
    3: 'budget',
    4: 'fuelType',
    5: 'transmission'
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.querySelector('.hero');
      if (heroSection) {
        const heroBottom = heroSection.getBoundingClientRect().bottom;
        setShowStickyButtons(heroBottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    scrollToBottom();
    adjustTextareaHeight();
  }, [messages, message]);

  useEffect(() => {
    // Habilitar envio quando pelo menos uma opção estiver selecionada
    if (conversationStage === 2 && userPreferences.carPurpose.length > 0) {
      setIsSendEnabled(true);
    } else if (conversationStage === 3 && userPreferences.budget.length > 0) {
      setIsSendEnabled(true);
    } else if (conversationStage === 4 && userPreferences.fuelType.length > 0) {
      setIsSendEnabled(true);
    } else if (conversationStage === 5 && userPreferences.transmission.length > 0) {
      setIsSendEnabled(true);
    } else {
      setIsSendEnabled(false);
    }
  }, [userPreferences, conversationStage]);

  const startChatWithIA = () => {
    setIsChatOpen(true);
    setMessages([
      { text: 'Olá! Sou o GuIA, seu assistente automotivo inteligente! 🚗✨', isBot: true },
      { text: 'Vou te ajudar a encontrar o carro perfeito para suas necessidades!', isBot: true },
      { text: 'Antes de começarmos, qual é o seu nome?', isBot: true }
    ]);
    setConversationStage(1);
    setUserPreferences({
      name: '',
      carPurpose: [],
      budget: [],
      fuelType: [],
      transmission: []
    });
  };

  const togglePreference = (category, value) => {
    setUserPreferences(prev => {
      const currentValues = prev[category];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(item => item !== value)
        : [...currentValues, value];
      return { ...prev, [category]: newValues };
    });
  };

  const handleSendMessage = async () => {
    if (message.trim() === '') return;

    const newMessages = [...messages, { text: message, isBot: false }];
    setMessages(newMessages);
    setMessage('');
    setIsTyping(true);

    try {
      if (conversationStage === 1) {
        // Stage 1: Get user's name
        setUserPreferences(prev => ({ ...prev, name: message }));
        setMessages(prev => [
          ...prev, 
          { text: `Prazer em te conhecer, ${message}! 😄`, isBot: true },
          { text: 'Me conta: para que você vai usar o carro? (Selecione um ou mais)', isBot: true }
        ]);
        setConversationStage(2);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setMessages(prev => [...prev, { 
        text: "Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?", 
        isBot: true 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const parseBudget = (budget) => {
    if (budget === 'Até R$ 30 mil') return [0, 30000];
    if (budget === 'R$ 30 mil a R$ 50 mil') return [30000, 50000];
    if (budget === 'R$ 50 mil a R$ 80 mil') return [50000, 80000];
    if (budget === 'R$ 80 mil a R$ 120 mil') return [80000, 120000];
    if (budget === 'Acima de R$ 120 mil') return [120000, Infinity];
    return [0, Infinity];
  };

  const handleSendPreferences = () => {
    // Adiciona mensagem do usuário com a seleção
    let userSelectionText = "";
    
    switch(conversationStage) {
      case 2:
        userSelectionText = `Uso: ${userPreferences.carPurpose.join(', ')}`;
        break;
      case 3:
        userSelectionText = `Orçamento: ${userPreferences.budget.join(', ')}`;
        break;
      case 4:
        userSelectionText = `Combustível: ${userPreferences.fuelType.join(', ')}`;
        break;
      case 5:
        userSelectionText = `Transmissão: ${userPreferences.transmission.join(', ')}`;
        break;
      default:
        userSelectionText = "Preferências selecionadas";
    }
    
    setMessages(prev => [
      ...prev, 
      { 
        text: userSelectionText, 
        isBot: false 
      }
    ]);
    
    // Mensagem do bot
    setMessages(prev => [
      ...prev, 
      { 
        text: conversationStage === 5 
          ? "Ótimo! Estou analisando as melhores opções para você..." 
          : nextStageMessage[conversationStage], 
        isBot: true 
      }
    ]);
    
    // Limpa seleções para próxima etapa
    if (conversationStage === 5) {
      // Busca recomendações
      setTimeout(() => {
        findRecommendedCars();
      }, 1500);
    } else {
      setUserPreferences(prev => ({
        ...prev,
        [preferenceField[conversationStage]]: []
      }));
      setConversationStage(prev => prev + 1);
    }
  };

  const findRecommendedCars = () => {
    const recommendedCars = cars.filter(car => {
      // Verificar orçamento: se pelo menos um dos orçamentos selecionados inclui o preço do carro
      const budgetMatch = userPreferences.budget.length === 0 || 
        userPreferences.budget.some(budget => {
          const [min, max] = parseBudget(budget);
          return car.Price >= min && car.Price <= max;
        });
      
      // Verificar combustível
      const fuelMatch = userPreferences.fuelType.length === 0 || 
        userPreferences.fuelType.some(fuel => {
          if (fuel === 'Tanto faz') return true;
          return car.Fuel.toLowerCase().includes(fuel.toLowerCase());
        });
      
      // Verificar transmissão
      const transmissionMatch = userPreferences.transmission.length === 0 || 
        userPreferences.transmission.some(trans => {
          if (trans === 'Tanto faz') return true;
          return car.Transmission.toLowerCase().includes(trans.toLowerCase());
        });
      
      return budgetMatch && fuelMatch && transmissionMatch;
    });

    // Limitar a 3 carros
    const topCars = recommendedCars.slice(0, 3);
    
    setMessages(prev => [
      ...prev,
      { text: "Encontrei opções incríveis pra você!! 🎉", isBot: true }
    ]);

    topCars.forEach(car => {
      setMessages(prev => [...prev, { type: "car", data: car, isBot: true }]);
    });

    setMessages(prev => [
      ...prev,
      { text: "🚀 ESPERO TER ENCONTRADO O CARRO PERFEITO PARA VOCÊ! 🚀", isBot: true },
      { text: "Boa sorte na sua busca e que você tenha muitas aventuras incríveis com seu novo carro! 😊🚗💨", isBot: true }
    ]);

    setConversationStage(6);
  };

  const openCarDetails = (car) => {
    setSelectedCar({
      ...car,
      Images: car.Images && car.Images.length > 0 ? car.Images : [car.Image]
    });
  };

  const closeCarDetails = () => {
    setSelectedCar(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (conversationStage === 1 || conversationStage === 6) {
        handleSendMessage();
      }
    }
  };

  const useOptions = [
    'Ir ao trabalho todos os dias',
    'Viagens de fim de semana',
    'Uso misto (cidade e estrada)',
    'Transporte de família (filhos)',
    'Transporte para app (Uber, 99 etc)',
    'Outro'
  ];

  const budgetOptions = [
    'Até R$ 30 mil',
    'R$ 30 mil a R$ 50 mil',
    'R$ 50 mil a R$ 80 mil',
    'R$ 80 mil a R$ 120 mil',
    'Acima de R$ 120 mil'
  ];

  const fuelOptions = [
    'Flex (Álcool/Gasolina)',
    'Gasolina',
    'Elétrico',
    'Tanto faz'
  ];

  const transmissionOptions = [
    'Manual',
    'Automático',
    'Tanto faz'
  ];

  return (
    <>
      <header className="header">
        <div className="logo">
          Carro<span className="orange-text">JÁ</span>
        </div>
        <nav className="nav">
          <a href="#home">Home</a>
          <a href="#services">Serviços</a>
          <a href="#contact">Contato</a>
        </nav>
        <button 
          className="btn"
          onClick={() => window.open('https://github.com/MatheusFerreiraAlvesDeLima', '_blank')}
        >
          Fale Conosco
        </button>
      </header>

      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-text-container">
            <h1>
              <span className="orange-text">Quer ajuda para encontrar</span>
              <br />
              <span className="highlight">Seu Carro do Seu Jeito?</span>
            </h1>
            <div className="hero-subtext">
              <p>Seu carro ideal está a poucos cliques.</p>
              <p>Vamos te ajudar a encontrar.</p>
            </div>
            <div className="hero-buttons">
              <button className="btn btn-ia" onClick={startChatWithIA}>
                Ajuda IA 🚀
              </button>
            </div>
          </div>
          <div className="ia-card-animated playing">
            <div className="ia-wave"></div>
            <div className="ia-text-container">
              <h2 className="ia-main-title">
                <span className="ia-highlight">Seu Assistente Automotivo Inteligente</span>
              </h2>
              <p className="ia-subtitle">
                Com uma IA avançada, analisamos seu perfil, comparamos centenas de modelos e indicamos o carro ideal com a melhor escolha para seu dia a dia.
              </p>
            </div>
          </div>

          <div className="mini-carrossel-container">
            <Carrossel />
          </div>
        </div>

        {showStickyButtons && (
          <div className="sticky-buttons">
            <button className="btn">Procurar Manualmente</button>
            <button className="btn btn-ia" onClick={startChatWithIA}>
              Ajuda IA 🚀
            </button>
          </div>
        )}
      </section>

      <section className="services" id="services">
        <h2>
          <span className="highlight">Nosso serviço é encontrar</span>
          <br />
          <span className="orange-text">o carro ideal para você!</span>
        </h2>
      </section>

      <section className="contact" id="contact">
        <h2>Fale Conosco</h2>
        <button className="btn">Enviar Mensagem</button>
      </section>

      <footer className="footer">
        <p>&copy; 2025 CarroJá. Todos os direitos reservados.</p>
      </footer>

      <div className="chat-container">
        {isChatOpen ? (
          <div className="chat-box active">
            <h3>
              GuIA do Carro Perfeito 🚗💨
              <button 
                className="minimize-btn" 
                onClick={() => setIsChatOpen(false)}
                aria-label="Minimizar chat"
              >
                &ndash;
              </button>
            </h3>
            <div className="chat-messages">
              {messages.map((msg, index) => {
                if (msg.type === "car") {
                  return (
                    <div 
                      key={index} 
                      className="message bot-message fade-in car-mini-card"
                    >
                      <h4>{msg.data.Name} {msg.data.Model}</h4>
                      <div className="car-info">
                        <div>Preço: R$ {msg.data.Price.toLocaleString('pt-BR')}</div>
                        <div>Local: {msg.data.Location}</div>
                      </div>
                      <button 
                        className="btn-details"
                        onClick={() => openCarDetails(msg.data)}
                      >
                        Ver detalhes 🔍
                      </button>
                    </div>
                  );
                }
                return (
                  <div 
                    key={index} 
                    className={`message ${msg.isBot ? 'bot-message' : 'user-message'} fade-in`}
                  >
                    {msg.text}
                  </div>
                );
              })}
              
              {/* Stage 1: Name (input text) */}
              {conversationStage === 1 && !isTyping && (
                <div className="chat-input-container">
                  <textarea
                    ref={textareaRef}
                    className="chat-input"
                    placeholder="Digite seu nome..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                  />
                  <button 
                    className="chat-btn" 
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                  >
                    Enviar ✉️
                  </button>
                </div>
              )}
              
              {/* Stage 2: Car purpose selection */}
              {conversationStage === 2 && !isTyping && (
                <div>
                  <div className="chat-options">
                    {useOptions.map((option, idx) => (
                      <button
                        key={idx}
                        className={`option-btn ${userPreferences.carPurpose.includes(option) ? 'selected' : ''}`}
                        onClick={() => togglePreference('carPurpose', option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <div className="chat-actions">
                    <button 
                      className={`send-btn ${isSendEnabled ? 'enabled' : ''}`}
                      disabled={!isSendEnabled}
                      onClick={handleSendPreferences}
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              )}
              
              {/* Stage 3: Budget selection */}
              {conversationStage === 3 && !isTyping && (
                <div>
                  <div className="chat-options">
                    {budgetOptions.map((option, idx) => (
                      <button
                        key={idx}
                        className={`option-btn ${userPreferences.budget.includes(option) ? 'selected' : ''}`}
                        onClick={() => togglePreference('budget', option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <div className="chat-actions">
                    <button 
                      className={`send-btn ${isSendEnabled ? 'enabled' : ''}`}
                      disabled={!isSendEnabled}
                      onClick={handleSendPreferences}
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              )}
              
              {/* Stage 4: Fuel type selection */}
              {conversationStage === 4 && !isTyping && (
                <div>
                  <div className="chat-options">
                    {fuelOptions.map((option, idx) => (
                      <button
                        key={idx}
                        className={`option-btn ${userPreferences.fuelType.includes(option) ? 'selected' : ''}`}
                        onClick={() => togglePreference('fuelType', option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <div className="chat-actions">
                    <button 
                      className={`send-btn ${isSendEnabled ? 'enabled' : ''}`}
                      disabled={!isSendEnabled}
                      onClick={handleSendPreferences}
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              )}
              
              {/* Stage 5: Transmission selection */}
              {conversationStage === 5 && !isTyping && (
                <div>
                  <div className="chat-options">
                    {transmissionOptions.map((option, idx) => (
                      <button
                        key={idx}
                        className={`option-btn ${userPreferences.transmission.includes(option) ? 'selected' : ''}`}
                        onClick={() => togglePreference('transmission', option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <div className="chat-actions">
                    <button 
                      className={`send-btn ${isSendEnabled ? 'enabled' : ''}`}
                      disabled={!isSendEnabled}
                      onClick={handleSendPreferences}
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              )}
              
              {isTyping && (
                <div className="message bot-message fade-in">
                  <div className="typing-indicator">
                    <span className="typing-animation">GuIA está digitando</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input field for free text in final stage */}
            {conversationStage === 6 && (
              <div className="chat-input-container">
                <textarea
                  ref={textareaRef}
                  className="chat-input"
                  placeholder="Digite aqui..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <button 
                  className="chat-btn" 
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                >
                  Enviar ✉️
                </button>
              </div>
            )}
          </div>
        ) : (
          <div 
            className="chat-icon" 
            onClick={startChatWithIA}
            aria-label="Abrir chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 3c5.514 0 10 3.592 10 8.007 0 4.917-5.144 7.961-9.91 7.961-1.937 0-3.384-.397-4.394-.644-1 .613-1.595 1.037-4.272 1.82.535-1.373.722-2.748.601-4.115-.837-1.372-1.525-2.922-1.525-4.921 0-4.415 4.486-8.007 10-8.007zm0-2c-6.338 0-12 4.226-12 10.007 0 2.05.739 4.063 2.047 5.625.055 1.83-1.023 4.456-1.993 6.368 2.602-.47 6.301-1.508 7.978-2.536 1.417.345 2.774.503 4.059.503 7.084 0 11.91-4.837 11.91-9.961-.001-5.811-5.702-10.006-12.001-10.006z"/>
            </svg>
          </div>
        )}
      </div>

      {/* Modal de detalhes do carro */}
      {selectedCar && (
        <div className="car-modal-overlay" onClick={closeCarDetails}>
          <div className="car-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeCarDetails}>×</button>
            <div className="modal-gallery">
              <img
                src={selectedCar.Image || 'https://via.placeholder.com/800x500?text=Imagem+Indisponível'}
                alt={`${selectedCar.Name} ${selectedCar.Model}`}
              />
            </div>
            <div className="modal-info">
              <h2>{selectedCar.Name} {selectedCar.Model}</h2>
              <div className="modal-info-grid">
                <div className="modal-info-label">📅 Ano:</div>
                <div className="modal-info-value">{selectedCar.Year}</div>

                <div className="modal-info-label">💰 Preço:</div>
                <div className="modal-info-value">R$ {selectedCar.Price.toLocaleString('pt-BR')}</div>

                <div className="modal-info-label">🏎️ Motor:</div>
                <div className="modal-info-value">{selectedCar.Engine} - {selectedCar.Horsepower}cv</div>

                <div className="modal-info-label">⚙️ Transmissão:</div>
                <div className="modal-info-value">{selectedCar.Transmission}</div>

                <div className="modal-info-label">⛽ Combustível:</div>
                <div className="modal-info-value">{selectedCar.Fuel}</div>

                <div className="modal-info-label">📍 Localização:</div>
                <div className="modal-info-value">{selectedCar.Location}</div>
              </div>
              {selectedCar.Features && (
                <div className="modal-features">
                  <h4>✨ Destaques</h4>
                  <ul>
                    {selectedCar.Features.map((feature, i) => (
                      <li key={i}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedCar.Description && (
                <div className="modal-description">
                  <p>{selectedCar.Description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;