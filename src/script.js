// Efeito do header ao rolar
window.addEventListener('scroll', () => {
  const header = document.querySelector('.header');
  if (window.scrollY > 50) {
    header.style.backgroundColor = '#0a0a0a';
  } else {
    header.style.backgroundColor = 'rgba(10, 10, 10, 0.9)';
  }
});
