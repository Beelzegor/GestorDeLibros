document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('book-modal');
  const btnOpen = document.getElementById('btn-open-modal');
  const btnClose = document.getElementById('btn-close-modal');


  btnOpen.addEventListener('click', () => modal.showModal());
  btnClose.addEventListener('click', () => modal.close());

  console.log('Interfaz frontend lista e inicializada.');
});