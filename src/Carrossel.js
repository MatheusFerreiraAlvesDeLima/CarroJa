import React, { useState, useEffect } from 'react';
import './Carrossel.css';
import cars from './cars.json';

const Carrossel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [selectedCar, setSelectedCar] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % cars.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      (prevIndex - 1 + cars.length) % cars.length
    );
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    let interval;
    if (isPlaying && cars.length > 1) {
      interval = setInterval(() => {
        nextSlide();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [currentIndex, isPlaying]);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      nextSlide();
    } else if (touchStart - touchEnd < -50) {
      prevSlide();
    }
  };

  const openCarModal = (car) => {
    const enrichedCar = {
      ...car,
      Images: car.Images && car.Images.length > 0 ? car.Images : [car.Image]
    };
    setSelectedCar(enrichedCar);
    setSelectedImageIndex(0);
  };

  const nextCarImage = () => {
    if (!selectedCar?.Images?.length) return;
    setSelectedImageIndex((prev) => (prev + 1) % selectedCar.Images.length);
  };

  const prevCarImage = () => {
    if (!selectedCar?.Images?.length) return;
    setSelectedImageIndex((prev) =>
      (prev - 1 + selectedCar.Images.length) % selectedCar.Images.length
    );
  };

  return (
    <div className="carrossel" data-single={cars.length <= 1}>
      <div className="carrossel-top-controls">
        <div className="carrossel-dots">
          {cars.slice(Math.max(0, currentIndex - 2), Math.min(cars.length, currentIndex + 3)).map((_, offset) => {
            const realIndex = Math.max(0, currentIndex - 2) + offset;
            return (
              <button
                key={realIndex}
                className={`dot ${realIndex === currentIndex ? 'active pulse' : ''}`}
                onClick={() => goToSlide(realIndex)}
              />
            );
          })}
        </div>
        <div className="slide-counter">
          {currentIndex + 1} / {cars.length}
        </div>
      </div>

      {cars.length > 1 && (
        <>
          <button className="carrossel-arrow left" onClick={prevSlide}>
            &lt;
          </button>
          <button className="carrossel-arrow right" onClick={nextSlide}>
            &gt;
          </button>
        </>
      )}

      <div
        className="carrossel-inner"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {cars.map((car, index) => (
          <div
            key={`${car.Name}-${car.Model}-${index}`}
            className={`carrossel-slide ${index === currentIndex ? 'active' : ''}`}
            style={{
              backgroundImage: `url(${car.Images?.[0] || car.Image || 'https://via.placeholder.com/300x200?text=Car+Image'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="carrossel-content">
              <h4>{car.Name} {car.Model}</h4>
              <div className="carrossel-price">
                R$ {car.Price.toLocaleString('pt-BR')}
              </div>
              <div className="carro-localizacao">
                <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {car.Location}
              </div>
              <button className="btn-carrossel" onClick={() => openCarModal(car)}>
                Ver detalhes
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedCar && (
        <div className="car-modal-overlay" onClick={() => setSelectedCar(null)}>
          <div className="car-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedCar(null)}>×</button>
            <div className="modal-gallery">
              <button className="gallery-arrow left" onClick={prevCarImage}>&lt;</button>
              <img
                src={selectedCar.Images?.[selectedImageIndex] || selectedCar.Image || 'https://via.placeholder.com/800x500?text=Imagem+Indisponível'}
                alt={`Imagem ${selectedImageIndex + 1}`}
              />
              <button className="gallery-arrow right" onClick={nextCarImage}>&gt;</button>
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
    </div>
  );
};

export default Carrossel;
