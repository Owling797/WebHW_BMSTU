export default class Load {
  #bookingID = '';
  #bookingCustomerName = '';
  #bookingMovie = '';
  #bookingTime = '';
  #bookingHall = '';
  #bookingTicketsNumber = 1;
  #loadPosition = -1;

  constructor({
    bookingID = null,
    name,
    movie,
    time,
    hall,
    ticketsNumber,
    position,
  }) {
    this.#bookingID = bookingID || crypto.randomUUID();
    this.#bookingCustomerName = String(name);
    this.#bookingMovie = String(movie);
    this.#bookingTime = String(time);
    this.#bookingHall = String(hall);
    this.#bookingTicketsNumber = ticketsNumber;
    this.#loadPosition = position;
    console.log("booking:", name, movie, time, hall, ticketsNumber);
  }

  get bookingID() { return this.#bookingID; }

  get bookingCustomerName() { return this.#bookingCustomerName; }
  set bookingCustomerName(value) {
    if (typeof value === 'string') {
      this.#bookingCustomerName = value;
    }
  }
                                                          
  get loadPosition() { return this.#loadPosition; }
  set loadPosition(value) {
    if (typeof value === 'number' && value >= 0) {
      this.#loadPosition = value;
    }
  }

  // добавить сеттеры геттеры для остальных параметров?
  get bookingTicketsNumber() { return this.#bookingTicketsNumber; }
  

  render() {
    console.log("RENDER BOOKING");
    const liElement = document.createElement('li');
    liElement.classList.add('screening__loads-list-item', 'load');
    liElement.setAttribute('id', this.#bookingID);
    liElement.setAttribute('draggable', true);
    liElement.addEventListener('dragstart', (evt) => {
      evt.target.classList.add('load_selected');
      localStorage.setItem('movedLoadID', this.#bookingID);
    });
    liElement.addEventListener('dragend', (evt) => evt.target.classList.remove('load_selected'));


    const span = document.createElement('span');    //вот здесь добавлять отображение других параметров 
    span.classList.add('load__name');
    span.innerHTML = this.#bookingCustomerName;
    liElement.appendChild(span);

    const span_number = document.createElement('span');    //вот здесь добавлять отображение других параметров 
    span_number.classList.add('load__number');
    span_number.innerHTML = this.#bookingTicketsNumber;
    liElement.appendChild(span_number);

    const controlsDiv = document.createElement('div');
    controlsDiv.classList.add('load__controls');

    const lowerRowDiv = document.createElement('div');
    lowerRowDiv.classList.add('load__controls-row');

    const editBtn = document.createElement('button');
    editBtn.setAttribute('type', 'button');
    editBtn.classList.add('load__contol-btn', 'edit-icon');
    editBtn.addEventListener('click', () => {
      localStorage.setItem('editLoadID', this.#bookingID);
      document.getElementById('modal-edit-load').showModal();
    });
    lowerRowDiv.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.setAttribute('type', 'button');
    deleteBtn.classList.add('load__contol-btn', 'delete-icon');
    deleteBtn.addEventListener('click', () => {
      localStorage.setItem('deleteLoadID', this.#bookingID);

      const deleteLoadModal = document.getElementById('modal-delete-load');
      deleteLoadModal.querySelector('.app-modal__question').innerHTML = `Бронь для '${this.#bookingCustomerName}' будет удалена. Продолжить?`;

      deleteLoadModal.showModal();


      
    });
    lowerRowDiv.appendChild(deleteBtn);

    controlsDiv.appendChild(lowerRowDiv);

    liElement.appendChild(controlsDiv);

    return liElement;
  }
};
