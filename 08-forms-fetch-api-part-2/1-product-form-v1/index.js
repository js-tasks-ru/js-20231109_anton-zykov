import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  constructor (productId) {
    this.productId = productId;

    this.element = this.createElement();
    this.subElements = {
      productForm: this.element.querySelector('#productForm'),
      title: this.element.querySelector('#title'),
      description: this.element.querySelector('#description'),
      quantity: this.element.querySelector('#quantity'),
      subcategory: this.element.querySelector('#subcategory'),
      status: this.element.querySelector('#status'),
      price: this.element.querySelector('#price'),
      discount: this.element.querySelector('#discount'),
      imageListContainer: this.element.querySelector('#imageListContainer'),
      uploadImageButton: this.element.querySelector('[name="uploadImage"]'),
      uploadImageFakeForm: this.element.querySelector('[name="uploadImageForm"]'),
    };
  }

  async render () {
    await this.loadCategories();

    if (this.productId) {
      await this.loadProduct();
    }

    this.createEventListeners();

    return this.element;
  }

  async loadCategories () {
    const url = new URL('/api/rest/categories?_sort=weight&_refs=subcategory', BACKEND_URL);
    const response = await fetchJson(url);

    const processSubcategories = (categoryTitle, subcategories) => (
      subcategories.reduce((result, subcategory) => (
        result.concat(`
          <option value="${escapeHtml(subcategory.id)}">${escapeHtml(categoryTitle)} &gt; ${escapeHtml(subcategory.title)}</option>
        `)
      ), '')
    );

    this.subElements.productForm.elements.subcategory.innerHTML =
      response.reduce((result, category) => {
        const { title, subcategories } = category;
        return result.concat(processSubcategories(title, subcategories));
      }, '');
  }

  async loadProduct () {
    const url = new URL(`/api/rest/products?id=${this.productId}`, BACKEND_URL);
    const response = await fetchJson(url);

    for (const [elementTitle, element] of Object.entries(this.subElements)) {
      if (response[0].hasOwnProperty(elementTitle)) {
        element.value = response[0][elementTitle];
      }
    }

    this.createImages(response[0].images);
  }

  createImageTemplate (image) {
    return `
    <li class="products-edit__imagelist-item sortable-list__item" style="">
      <input type="hidden" name="url" value="${escapeHtml(image.url)}">
      <input type="hidden" name="source" value="${escapeHtml(image.source)}">
      <span>
        <img src="icon-grab.svg" data-grab-handle alt="grab">
        <img class="sortable-table__cell-img" alt="Image" src="${escapeHtml(image.url)}" referrerpolicy="no-referrer">
        <span>${escapeHtml(image.source)}</span>
      </span>
      <button type="button">
        <img src="icon-trash.svg" data-delete-handle alt="delete">
      </button>
    </li>
    `;
  }

  createImages (images) {
    const list = this.subElements.imageListContainer.firstElementChild;

    for (const image of images) {
      list.innerHTML += this.createImageTemplate(image);
    }

    this.subElements.imageListContainer.append(list);
  }

  createEventListeners () {
    this.subElements.uploadImageButton.addEventListener('click', this.handleImageAdd);
    this.subElements.uploadImageFakeForm.addEventListener('change', this.handleNewImageUploaded);

    for (const image of this.subElements.imageListContainer.firstElementChild.children) {
      image.querySelector('[data-delete-handle]').addEventListener('click', this.handleImageDelete(image));
    }

    this.subElements.productForm.onsubmit = (event) => {
      event.preventDefault();
      this.save();
    };
  }

  handleImageDelete (image) {
    return function handleClick () {
      image.querySelector('[data-delete-handle]').removeEventListener('click', handleClick);
      image.remove();
    };
  }

  handleImageAdd = () => {
    this.subElements.uploadImageFakeForm.click();
  }

  handleNewImageUploaded = async () => {
    let formData = new FormData();
    formData.append('image', this.subElements.uploadImageFakeForm.files[0]);

    let response = await fetchJson('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`,
      },
      body: formData,
    });

    const image = {
      url: response.data.link,
      source: this.subElements.uploadImageFakeForm.files[0].name,
    };

    this.subElements.uploadImageFakeForm.value = '';

    const container = document.createElement('div');
    container.innerHTML = this.createImageTemplate(image);
    const imageElement = container.firstElementChild;
    imageElement.querySelector('[data-delete-handle]').addEventListener('click', this.handleImageDelete(imageElement));
    this.subElements.imageListContainer.querySelector('ul').append(imageElement);
  }

  save = async () => {
    const url = new URL('api/rest/products', BACKEND_URL);

    const images = Array.from(this.subElements.imageListContainer.firstElementChild.children)
      .map((imageElement) => ({
        url: imageElement.querySelector('[name="url"]').value,
        source: imageElement.querySelector('[name="source"]').value,
      }));

    const body = {
      description: this.subElements.description.value,
      discount: Number(this.subElements.discount.value),
      images,
      price: Number(this.subElements.price.value),
      quantity: Number(this.subElements.quantity.value),
      status: Number(this.subElements.status.value),
      subcategory: this.subElements.subcategory.value,
      title: this.subElements.title.value,
    };

    let method = 'PUT';

    if (this.productId) {
      body.id = this.productId;
      method = 'PATCH';
    }

    const response = await fetchJson(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    this.element.dispatchEvent(new CustomEvent(
      this.productId ? 'product-updated' : 'product-saved',
      {
        bubbles: true,
      }
    ));

    return response;
  }

  createTemplate () {
    return `
    <div class="product-form">
      <form data-element="productForm" id="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input id="title" required="" type="text" name="title" class="form-control" placeholder="Название товара">
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea id="description" required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
        </div>
        <div class="form-group form-group__wide" data-element="sortable-list-container">
          <label class="form-label">Фото</label>
          <div data-element="imageListContainer" id="imageListContainer">
            <ul class="sortable-list"></ul>
          </div>
          <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
          <input type="file" name="uploadImageForm" accept="image/*" hidden>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
          <select id="subcategory" class="form-control" name="subcategory" id="subcategory"></select>
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input id="price" required="" type="number" name="price" class="form-control" placeholder="100">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input id="discount" required="" type="number" name="discount" class="form-control" placeholder="0">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input id="quantity" required="" type="number" class="form-control" name="quantity" placeholder="1">
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select id="status" class="form-control" name="status">
            <option value="1">Активен</option>
            <option value="0">Неактивен</option>
          </select>
        </div>
        <div class="form-buttons">
          <button type="submit" name="save" class="button-primary-outline">Сохранить товар</button>
        </div>
      </form>
    </div>
    `;
  }

  createElement () {
    const container = document.createElement('div');
    container.innerHTML = this.createTemplate();
    return container.firstElementChild;
  }

  remove () {
    this.element.remove();
  }

  destroy () {
    this.remove();
  }
}
