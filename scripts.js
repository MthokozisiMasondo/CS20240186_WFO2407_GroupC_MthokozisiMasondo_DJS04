import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'

let page = 1;
let matches = books

// Create book preview list
const bookList = document.getElementById('bookList')
const preview = document.getElementById('previewDetails')

function loadBooks(books, authors) {
    books.forEach(book => {
        const previewElement = document.createElement('book-preview-item')
        previewElement.setAttribute('data-preview', book.id)
        previewElement.setAttribute('image', book.image)
        previewElement.setAttribute('title', book.title)
        previewElement.setAttribute('author', authors[book.author])
        bookList.appendChild(previewElement)
    })
}

// Handle preview selection
bookList.addEventListener('click', (event) => {
    const book = matches.find(b => b.id === event.detail.bookId)
    if (book) {
        preview.setAttribute('open', 'true')
        preview.setAttribute('image', book.image)
        preview.setAttribute('title', book.title)
        preview.setAttribute('subtitle', 
            `${authors[book.author]} (${new Date(book.published).getFullYear()})`)
        preview.setAttribute('description', book.description)
    }
})

// Loading initial books
loadBooks(matches.slice(0, 36), authors)


//    EVENT LISTENERS FOR OVERLAYS
document.querySelector('[data-search-cancel]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = false
})

document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = false
})

document.querySelector('[data-header-search]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = true 
    document.querySelector('[data-search-title]').focus()
})

document.querySelector('[data-header-settings]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = true 
})

document.querySelector('[data-list-close]').addEventListener('click', () => {
    document.querySelector('[data-list-active]').open = false
})

//    THEME HANDLING AND SETTINGS
// Theme handling and settings had repetitive code, in different parts of the codebase
// Therefore I created a class for theme handling and settings, to combine every theme-related code
// This reduces repetitive code and makes it easier to maintain all the theme-related code
class ThemeManager {
    constructor() {
        this.initTheme()
        this.event()
    }

// Applying CSS styling for the theme
  applyTheme(theme) {
    if (theme === 'night') {
        document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
        document.documentElement.style.setProperty('--color-light', '10, 10, 20');
    } else {
        document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', '255, 255, 255');
    }
  }

// Initializing the theme according to user prefence
  initTheme() {
    const darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const preferedTheme = darkMode ? 'night' : 'day'
    this.applyTheme(preferedTheme)
    document.querySelector('[data-settings-theme]').value = preferedTheme
  }

// Event for theme settings form
  event() {
    document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
        event.preventDefault()
        const formData = new FormData(event.target)
        const { theme } = Object.fromEntries(formData)
        this.applyTheme(theme)
        document.querySelector('[data-settings-overlay]').open = false
    })
  }
}

new ThemeManager()

//    SEARCH FUNCTIONALITY   
document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const filters = Object.fromEntries(formData)
    const result = []

    for (const book of books) {
        let genreMatch = filters.genre === 'any'

        for (const singleGenre of book.genres) {
            if (genreMatch) break;
            if (singleGenre === filters.genre) { genreMatch = true }
        }

        if (
            (filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase())) && 
            (filters.author === 'any' || book.author === filters.author) && 
            genreMatch
        ) {
            result.push(book)
        }
    }

    page = 1;
    matches = result

    if (result.length < 1) {
        document.querySelector('[data-list-message]').classList.add('list__message_show')
    } else {
        document.querySelector('[data-list-message]').classList.remove('list__message_show')
    }

    document.querySelector('[data-list-items]').innerHTML = ''
    const newItems = document.createDocumentFragment()

    for (const { author, id, image, title } of result.slice(0, BOOKS_PER_PAGE)) {
        const element = document.createElement('button')
        element.classList = 'preview'
        element.setAttribute('data-preview', id)
    
        element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `

        newItems.appendChild(element)
    }

    document.querySelector('[data-list-items]').appendChild(newItems)
    document.querySelector('[data-list-button]').disabled = (matches.length - (page * BOOKS_PER_PAGE)) < 1

    document.querySelector('[data-list-button]').innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${(matches.length - (page * BOOKS_PER_PAGE)) > 0 ? (matches.length - (page * BOOKS_PER_PAGE)) : 0})</span>
    `

    window.scrollTo({top: 0, behavior: 'smooth'});
    document.querySelector('[data-search-overlay]').open = false
})