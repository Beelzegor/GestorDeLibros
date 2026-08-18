//frontend integration & customer logic

const API_URL = '/api/libros';

document.addEventListener('DOMContentLoaded', () => {

  const modal = document.getElementById('book-modal');
  const btnOpen = document.getElementById('btn-open-modal');
  const btnClose = document.getElementById('btn-close-modal');
  const form = document.getElementById('book-form');
  const modalTitle = document.getElementById('modal-title');
  const modalSubtitle = document.getElementById('modal-subtitle');
  const btnSubmit = document.getElementById('btn-submit-form');

  const inputTitle = document.getElementById('title');
  const inputAuthor = document.getElementById('author');
  const inputGenre = document.getElementById('genre');
  const selectStatus = document.getElementById('status');
  const inputRating = document.getElementById('rating');

  const searchInput = document.getElementById('search-input');
  const filterGenre = document.getElementById('filter-genre');
  const statusMessage = document.getElementById('status-message');
  const booksContainer = document.getElementById('books-container');


  let libros = []; 
  let editingId = null; 
  let searchDebounceTimer = null;

  const ESTADO_LABEL = {
    pendiente: 'Pendiente',
    leyendo: 'Leyendo',
    terminado: 'Completado',
  };

  
  function showStatus(message, type = 'loading') {
    statusMessage.textContent = message;
    statusMessage.className = `status-${type}`;
  }

  function hideStatus() {
    statusMessage.textContent = '';
    statusMessage.className = 'status-hidden';
  }

  
  function renderLibros(lista) {
    if (!lista || lista.length === 0) {
      booksContainer.innerHTML = `
        <div class="empty-state">
          <p>No se encontraron libros con esos criterios.</p>
        </div>`;
      return;
    }

    booksContainer.innerHTML = lista
      .map((libro) => {
        const estrellas = '★'.repeat(Math.round(libro.calificacion || 0)) +
          '☆'.repeat(5 - Math.round(libro.calificacion || 0));

        return `
          <article class="book-card" data-id="${libro._id}">
            <div class="book-info">
              <h3>${escapeHtml(libro.titulo)}</h3>
              <p class="book-meta">${escapeHtml(libro.autor)} · ${escapeHtml(libro.genero)}</p>
              <div class="book-tags">
                <span class="badge badge-${libro.estadoLectura}">${ESTADO_LABEL[libro.estadoLectura] || libro.estadoLectura}</span>
                <span class="book-rating" title="Calificación: ${libro.calificacion}/5">${estrellas}</span>
              </div>
            </div>
            <div class="book-actions">
              <button class="btn-secondary btn-edit" data-id="${libro._id}">Editar</button>
              <button class="btn-danger btn-delete" data-id="${libro._id}">Eliminar</button>
            </div>
          </article>`;
      })
      .join('');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
  }

  function applyTextFilter() {
    const term = searchInput.value.trim().toLowerCase();

    if (!term) {
      renderLibros(libros);
      return;
    }

    const filtrados = libros.filter((libro) =>
      libro.titulo.toLowerCase().includes(term) ||
      libro.autor.toLowerCase().includes(term) ||
      libro.genero.toLowerCase().includes(term)
    );

    renderLibros(filtrados);
  }

  async function cargarLibros() {
    showStatus('Cargando libros...', 'loading');
    booksContainer.innerHTML = `<div class="empty-state"><p>Cargando registros...</p></div>`;

    try {
      const genero = filterGenre.value;
      const url = genero ? `${API_URL}?genero=${encodeURIComponent(genero)}` : API_URL;

      const respuesta = await fetch(url);

      if (!respuesta.ok) {
        throw new Error(`Error del servidor (${respuesta.status})`);
      }

      libros = await respuesta.json();
      applyTextFilter();
      hideStatus();
    } catch (error) {
      console.error(error);
      booksContainer.innerHTML = `<div class="empty-state"><p>No se pudieron cargar los libros.</p></div>`;
      showStatus('Error al conectar con el servidor. Verifica que la API esté corriendo.', 'error');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      titulo: inputTitle.value.trim(),
      autor: inputAuthor.value.trim(),
      genero: inputGenre.value.trim(),
      estadoLectura: selectStatus.value,
      calificacion: Number(inputRating.value),
    };

    if (!payload.titulo || !payload.autor || !payload.genero) {
      showStatus('Título, autor y género son obligatorios.', 'error');
      return;
    }

    const esEdicion = Boolean(editingId);
    const url = esEdicion ? `${API_URL}/${editingId}` : API_URL;
    const method = esEdicion ? 'PUT' : 'POST';

    btnSubmit.disabled = true;
    btnSubmit.textContent = esEdicion ? 'Guardando cambios...' : 'Creando...';

    try {
      const respuesta = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.error || data.mensaje || 'No se pudo guardar el libro');
      }

      closeModal();
      showStatus(esEdicion ? 'Libro actualizado correctamente.' : 'Libro creado correctamente.', 'success');
      await cargarLibros();
      setTimeout(hideStatus, 2500);
    } catch (error) {
      console.error(error);
      showStatus(error.message, 'error');
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'Guardar registro';
    }
  }


  async function handleDelete(id) {
    const libro = libros.find((l) => l._id === id);
    const nombre = libro ? `"${libro.titulo}"` : 'este libro';

    const confirmado = confirm(`¿Seguro que deseas eliminar ${nombre}? Esta acción no se puede deshacer.`);
    if (!confirmado) return;

    showStatus('Eliminando...', 'loading');

    try {
      const respuesta = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.error || data.mensaje || 'No se pudo eliminar el libro');
      }

      showStatus('Libro eliminado correctamente.', 'success');
      await cargarLibros();
      setTimeout(hideStatus, 2000);
    } catch (error) {
      console.error(error);
      showStatus(error.message, 'error');
    }
  }

  function openModalForCreate() {
    editingId = null;
    form.reset();
    inputRating.value = 5;
    modalTitle.textContent = 'Registrar Libro';
    modalSubtitle.textContent = 'Introduce la información completa para actualizar el catálogo.';
    btnSubmit.textContent = 'Guardar registro';
    modal.showModal();
  }

  function openModalForEdit(id) {
    const libro = libros.find((l) => l._id === id);
    if (!libro) return;

    editingId = id;
    inputTitle.value = libro.titulo;
    inputAuthor.value = libro.autor;
    inputGenre.value = libro.genero;
    selectStatus.value = libro.estadoLectura;
    inputRating.value = libro.calificacion;

    modalTitle.textContent = 'Editar Libro';
    modalSubtitle.textContent = 'Modifica los campos y guarda los cambios.';
    btnSubmit.textContent = 'Guardar cambios';
    modal.showModal();
  }

  function closeModal() {
    modal.close();
    form.reset();
    editingId = null;
  }


  btnOpen.addEventListener('click', openModalForCreate);
  btnClose.addEventListener('click', closeModal);
  form.addEventListener('submit', handleSubmit);

  filterGenre.addEventListener('change', cargarLibros);

  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(applyTextFilter, 200);
  });

  booksContainer.addEventListener('click', (event) => {
    const editBtn = event.target.closest('.btn-edit');
    const deleteBtn = event.target.closest('.btn-delete');

    if (editBtn) {
      openModalForEdit(editBtn.dataset.id);
    } else if (deleteBtn) {
      handleDelete(deleteBtn.dataset.id);
    }
  });

  const themeToggleBtn = document.getElementById('btn-theme-toggle');
const body = document.body;

  cargarLibros();

  console.log('Interfaz frontend lista e inicializada.');

});