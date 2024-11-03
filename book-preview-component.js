// Book Preview Components

// PREVIEW FOR BOOK INFORMATION
class BookPreviewItem extends HTMLElement {
    constructor() {
        super()
        // Shadow DOM
        this.attachShadow({ mode: 'open' })
    }
     // Attributes that are going to be triggered
    static get observedAttributes() {
        return ['image', 'title', 'author']
    }
  // Setting event listener when preview is clicked
    connectedCallback() {
        this.render();
        this.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('preview-selected', {
                bubbles: true,
                composed: true,
                detail: {
                    id: this.getAttribute('data-preview')
                }
            }))
        })
    }

    // Render the preview with image, title and author
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                
                .preview {
                    border-width: 0;
                    width: 100%;
                    font-family: Roboto, sans-serif;
                    padding: 0.5rem 1rem;
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    text-align: left;
                    border-radius: 8px;
                    border: 1px solid rgba(10, 10, 20, 0.15);
                    background: rgb(255, 255, 255);
                }

                .preview:hover {
                    background: rgba(0, 150, 255, 0.05);
                }

                .preview__image {
                    width: 48px;
                    height: 70px;
                    object-fit: cover;
                    background: grey;
                    border-radius: 2px;
                    box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2),
                        0px 1px 1px 0px rgba(0, 0, 0, 0.1),
                        0px 1px 3px 0px rgba(0, 0, 0, 0.1);
                }

                .preview__info {
                    padding: 1rem;
                }

                .preview__title {
                    margin: 0 0 0.5rem;
                    font-weight: bold;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    color: rgba(10, 10, 20, 0.8);
                }

                .preview__author {
                    color: rgba(10, 10, 20, 0.4);
                }

                @media (min-width: 60rem) {
                    .preview {
                        padding: 1rem;
                    }
                }
            </style>

            <button class="preview">
                <img class="preview__image" src="${this.getAttribute('image')}" alt="Book cover">
                <div class="preview__info">
                    <h3 class="preview__title">${this.getAttribute('title')}</h3>
                    <div class="preview__author">${this.getAttribute('author')}</div>
                </div>
            </button>
        `;
    }

}

// BOOK PREVIEW GRID
class BookPreviewList extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' });
        this.page = 1
        this.BOOKS_PER_PAGE = 36
    }

    // Watch for changes in matches and authors attributes
    static get observedAttributes() {
        return ['matches', 'authors']
    }

    // Initialize component when added to the DOM
    connectedCallback() {
        this.render()
        this.setupEventListeners()
    }

    // Getter for matches attribute
    get matches() {
        return JSON.parse(this.getAttribute('matches') || '[]')
    }

    // Getter for authors attribute
    get authors() {
        return JSON.parse(this.getAttribute('authors') || '{}')
    }

    // Event listeners for show more button and preview
    setupEventListeners() {
        const showMoreButton = this.shadowRoot.querySelector('.list__button')
        showMoreButton.addEventListener('click', () => this.loadMoreBooks())

        this.shadowRoot.addEventListener('preview-selected', (event) => {
            this.dispatchEvent(new CustomEvent('show-preview-details', {
                bubbles: true,
                composed: true,
                detail: {
                    bookId: event.detail.id
                }
            }))
        })
    }

    // Load more books when "Show more" button is clicked
    loadMoreBooks() {
        const startIndex = (this.page - 1) * this.BOOKS_PER_PAGE
        const endIndex = startIndex + this.BOOKS_PER_PAGE
        const booksToLoad = this.matches.slice(startIndex, endIndex)

        const listItems = this.shadowRoot.querySelector('.list__items')
        
        // Create and append preview elements for each book
        booksToLoad.forEach(book => {
            const previewElement = document.createElement('book-preview-item')
            previewElement.setAttribute('data-preview', book.id)
            previewElement.setAttribute('image', book.image)
            previewElement.setAttribute('title', book.title)
            previewElement.setAttribute('author', this.authors[book.author])
            listItems.appendChild(previewElement)
        });

        this.page += 1
        this.updateShowMoreButton()
    }

    // Update "Show more" button text
    updateShowMoreButton() {
        const remaining = Math.max(this.matches.length - (this.page * this.BOOKS_PER_PAGE), 0)
        const showMoreButton = this.shadowRoot.querySelector('.list__button')
        
        showMoreButton.innerHTML = `
            <span>Show more</span>
            <span class="list__remaining"> (${remaining})</span>
        `;
        
        showMoreButton.disabled = remaining === 0
    }

    // Render list container and grid
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }

                .list {
                    padding-bottom: 10rem;
                }

                .list__items {
                    display: grid;
                    padding: 2rem 1rem;
                    grid-template-columns: 1fr;
                    grid-column-gap: 0.5rem;
                    grid-row-gap: 0.5rem;
                    margin: 0 auto;
                    width: 100%;
                }

                .list__button {
                    font-family: Roboto, sans-serif;
                    transition: background-color 0.1s;
                    border-width: 0;
                    border-radius: 6px;
                    height: 2.75rem;
                    cursor: pointer;
                    width: 50%;
                    background-color: rgb(0, 150, 255);
                    color: rgb(255, 255, 255);
                    font-size: 1rem;
                    border: 1px solid rgb(0, 150, 255);
                    max-width: 10rem;
                    margin: 0 auto;
                    display: block;
                }

                .list__button:disabled {
                    cursor: not-allowed;
                    opacity: 0.2;
                }

                .list__remaining {
                    opacity: 0.5;
                }

                @media (min-width: 50rem) {
                    .list__items {
                        grid-template-columns: repeat(2, 1fr);
                        grid-column-gap: 0.75rem;
                        grid-row-gap: 0.75rem;
                    }
                }

                @media (min-width: 100rem) {
                    .list__items {
                        grid-template-columns: repeat(4, 1fr);
                    }
                }

                @media (min-width: 150rem) {
                    .list__items {
                        grid-template-columns: repeat(8, 1fr);
                    }
                }
            </style>

            <div class="list">
                <div class="list__items"></div>
                <button class="list__button">
                    <span>Show more</span>
                    <span class="list__remaining"> (0)</span>
                </button>
            </div>
        `

        this.loadMoreBooks()
    }
}

// DISPLAYING DETAILED BOOK INFORMATION
class BookPreviewDetails extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
    }

    // Initialize component when added to DOM
    connectedCallback() {
        this.render()
        this.setupEventListeners()
    }

    // Event listener for close button
    setupEventListeners() {
        const closeButton = this.shadowRoot.querySelector('.overlay__close')
        closeButton.addEventListener('click', () => {
            this.setAttribute('open', 'false')
        });
    }

    // Render the modal overlay with book details
    render() {
        const isOpen = this.getAttribute('open') === 'true'
        
        this.shadowRoot.innerHTML = `
            <style>
                .overlay {
                    display: ${isOpen ? 'block' : 'none'};
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    border-width: 0;
                    box-shadow: 0px 3px 3px -2px rgba(0,0,0,0.2),
                               0px 3px 4px 0px rgba(0,0,0,0.14),
                               0px 1px 8px 0px rgba(0,0,0,0.12);
                    animation-name: enter;
                    animation-duration: 0.6s;
                    z-index: 10;
                    background-color: rgb(255, 255, 255);
                }

                @keyframes enter {
                    from { transform: translateY(10rem); }
                    to { transform: translateY(0); }
                }

                .overlay__preview {
                    overflow: hidden;
                    margin: -1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .overlay__blur {
                    width: 100%;
                    height: 200px;
                    filter: blur(10px);
                    opacity: 0.5;
                    transform: scale(2);
                }

                .overlay__image {
                    max-width: 10rem;
                    position: absolute;
                    top: 1.5rem;
                    left: calc(50% - 5rem);
                    border-radius: 2px;
                    box-shadow: 0px 3px 3px -2px rgba(0,0,0,0.2),
                               0px 3px 4px 0px rgba(0,0,0,0.14),
                               0px 1px 8px 0px rgba(0,0,0,0.12);
                }

                .overlay__content {
                    padding: 2rem 1.5rem;
                    text-align: center;
                    padding-top: 3rem;
                }

                .overlay__title {
                    padding: 1rem 0 0.25rem;
                    font-size: 1.25rem;
                    font-weight: bold;
                    line-height: 1;
                    letter-spacing: -0.1px;
                    max-width: 25rem;
                    margin: 0 auto;
                    color: rgba(10, 10, 20, 0.8);
                }

                .overlay__data {
                    font-size: 0.9rem;
                    display: -webkit-box;
                    -webkit-line-clamp: 6;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    color: rgba(10, 10, 20, 0.8);
                }

                .overlay__data_secondary {
                    color: rgba(10, 10, 20, 0.6);
                }

                .overlay__close {
                    padding: 0.5rem 1rem;
                    font-family: Roboto, sans-serif;
                    background-color: rgb(0, 150, 255);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    margin-top: 1rem;
                }

                .overlay__background {
                    display: ${isOpen ? 'block' : 'none'};
                    background: rgba(10, 10, 20, 0.6);
                    position: fixed;
                    top: 0;
                    left: 0;
                    height: 100vh;
                    width: 100vw;
                    z-index: 5;
                }

                @media (min-width: 30rem) {
                    .overlay {
                        max-width: 30rem;
                        left: 50%;
                        transform: translateX(-50%);
                        top: 2rem;
                        border-radius: 8px;
                    }
                }
            </style>

            <div class="overlay__background"></div>
            <div class="overlay">
                <div class="overlay__preview">
                    <img class="overlay__blur" src="${this.getAttribute('image')}" alt="Book cover blur">
                    <img class="overlay__image" src="${this.getAttribute('image')}" alt="Book cover">
                </div>
                <div class="overlay__content">
                    <h3 class="overlay__title">${this.getAttribute('title')}</h3>
                    <div class="overlay__data overlay__data_secondary">${this.getAttribute('subtitle')}</div>
                    <p class="overlay__data">${this.getAttribute('description')}</p>
                    <button class="overlay__close">Close</button>
                </div>
            </div>
        `
    }

    attributeChangedCallback() {
        if (this.shadowRoot) {
            this.render()
        }
    }
}

// Register custom elements
customElements.define('book-preview-item', BookPreviewItem)
customElements.define('book-preview-list', BookPreviewList)
customElements.define('book-preview-details', BookPreviewDetails)