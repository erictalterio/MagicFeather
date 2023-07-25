// Function to create and append elements for the book's title, author, ISBN, description, and image
function createBookElements(book) {
  let bookDiv = document.createElement('div');
  bookDiv.classList.add('book');

  function createAndAppendElement(tag, textContent) {
    let element = document.createElement(tag);
    element.textContent = textContent;
    bookDiv.appendChild(element);
    return element;
  }

  createAndAppendElement('h2', book.title);
  createAndAppendElement('p', book.author);
  createAndAppendElement('p', book.isbn);
  createAndAppendElement('p', book.description);

  let img = document.createElement('img');
  img.src = book.img;
  bookDiv.appendChild(img);

  // If the book has a bookmark icon, append it
  if (book.bookmarkIcon) {
    bookDiv.appendChild(book.bookmarkIcon);
  }

  return bookDiv;
}

// Function to display a book
function displayBook(book, isBookshelf) {
  let bookDiv = createBookElements(book);

  // Get the 'myBooks' and 'content' div elements
  let myBooksDiv = document.getElementById('myBooks');
  let contentDiv = document.getElementById('content');
  let divider = myBooksDiv.querySelector('hr');

  // If the book is in the bookshelf, add a trash icon and append the book to the 'content' div
  if (isBookshelf) {
    let trashIcon = document.createElement('i');
    trashIcon.className = 'fas fa-trash';
    trashIcon.style.cursor = 'pointer';
    trashIcon.addEventListener('click', function() {
      let bookshelf = JSON.parse(sessionStorage.getItem('bookshelf')) || [];
      bookshelf = bookshelf.filter(b => b.id !== book.id);
      sessionStorage.setItem('bookshelf', JSON.stringify(bookshelf));
      bookDiv.remove();
    });
    bookDiv.appendChild(trashIcon);
    contentDiv.appendChild(bookDiv);
  } else {
    // If the book is not in the bookshelf, insert the book before the divider in the 'myBooks' div
    myBooksDiv.insertBefore(bookDiv, divider);
  }
}

// Function to handle book search and display search results
function handleBookSearch() {
  let myBooksDiv = document.getElementById('myBooks');
  let contentDiv = document.getElementById('content');
  let divider = myBooksDiv.querySelector('hr');

  // Remove the 'Add a Book' button
  let addButton = document.getElementById('addButton');
  addButton.remove();

  // Create and set up the form for book search
  let form = document.createElement('form');
  form.id = 'searchForm';

  // Book Title input
  let bookTitleContainer = document.createElement('div');
  let bookTitleLabel = document.createElement('label');
  bookTitleLabel.textContent = 'Book Title';
  let bookTitleInput = document.createElement('input');
  bookTitleInput.type = 'text';
  bookTitleInput.placeholder = 'Book Title';
  bookTitleInput.id = 'bookTitleInput';
  bookTitleContainer.appendChild(bookTitleLabel);
  bookTitleContainer.appendChild(bookTitleInput);
  form.appendChild(bookTitleContainer);

  // Author input
  let authorContainer = document.createElement('div');
  let authorLabel = document.createElement('label');
  authorLabel.textContent = 'Author';
  let authorInput = document.createElement('input');
  authorInput.type = 'text';
  authorInput.placeholder = 'Author';
  authorInput.id = 'authorInput';
  authorContainer.appendChild(authorLabel);
  authorContainer.appendChild(authorInput);
  form.appendChild(authorContainer);

  // Search button
  let searchButton = document.createElement('button');
  searchButton.textContent = 'Search';
  searchButton.type = 'submit';
  searchButton.id = 'searchButton';
  form.appendChild(searchButton);

  // Cancel button
  let cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.type = 'button';
  cancelButton.id = 'cancelButton';
  form.appendChild(cancelButton);

  // Create and nest the 'search-results' div inside 'myBooks' div
  let searchResultsDiv = document.createElement('div');
  searchResultsDiv.classList.add('search-results');
  myBooksDiv.insertBefore(searchResultsDiv, divider);

  // Create and nest the 'error-message' div inside 'myBooks' div
  let errorMessageDiv = document.createElement('div');
  errorMessageDiv.classList.add('error-message');
  myBooksDiv.insertBefore(errorMessageDiv, divider);

  // Append the form to 'myBooksDiv'
  myBooksDiv.insertBefore(form, divider);


  // Event listener for the search form submission
  form.addEventListener('submit', function(event) {
    // Prevent the form from being submitted
    event.preventDefault();

    // Get the book title and author from the input fields
    let bookTitle = document.getElementById('bookTitleInput').value;
    let author = document.getElementById('authorInput').value;

    // Clear any previous error messages
    errorMessageDiv.textContent = '';

    // Check if both book title and author are provided
    if (!bookTitle || !author) {
      let errorMessage = document.createElement('p');
      errorMessage.textContent = 'Please provide both the book title and the author name.';
      errorMessageDiv.appendChild(errorMessage);
      return; // Stop the form submission if the fields are empty
    }

    // Construct the request URL for the Google Books API
    let requestUrl = `https://www.googleapis.com/books/v1/volumes?q=${bookTitle}+inauthor:${author}&langRestrict=en`;

    // Fetch the data from the Google Books API
    fetch(requestUrl)
      .then(response => response.json())
      .then(data => {
        // Remove the existing search results if they exist
        if (searchResultsDiv) {
          searchResultsDiv.remove();
        }

        // Create a div to hold the search results
        searchResultsDiv = document.createElement('div');
        searchResultsDiv.classList.add('search-results');
        myBooksDiv.insertBefore(searchResultsDiv, divider);

        // Check if there are search results
        if (data.items && data.items.length > 0) {
          // For each item in the data, display the book and add the bookmark icon
          data.items.forEach(item => {
            let book = item.volumeInfo;
            let bookmarkIcon = document.createElement('i');
            bookmarkIcon.className = 'fa fa-bookmark';

            bookmarkIcon.addEventListener('click', function() {
              let bookshelf = JSON.parse(sessionStorage.getItem('bookshelf')) || [];
              let bookId = book.industryIdentifiers ? book.industryIdentifiers[0].identifier : null;
              if (bookId && !bookshelf.some(b => b.id === bookId)) {
                let newBook = {
                  id: bookId,
                  title: book.title,
                  author: book.authors ? book.authors[0] : "Author Unknown",
                  isbn: bookId,
                  description: book.description ? book.description.substring(0, 200) : "Information missing",
                  img: book.imageLinks ? book.imageLinks.thumbnail : 'https://raw.githubusercontent.com/erictalterio/MagicFeather/c1e249cfede00a18dd4620b159c857313117508a/unavailable.png'
                };

                bookshelf.push(newBook);
                sessionStorage.setItem('bookshelf', JSON.stringify(bookshelf));
                displayBook(newBook, true);
              } else {
                let errorMessage = document.createElement('p');
                errorMessage.textContent = 'You cannot add the same book twice';
                errorMessageDiv.appendChild(errorMessage);
              }
            });

            // Create and nest the 'book' div inside 'search-results' div
            let bookDiv = createBookElements({
              title: book.title,
              author: book.authors ? book.authors[0] : "Author Unknown",
              isbn: book.industryIdentifiers ? book.industryIdentifiers[0].identifier : "ISBN Unknown",
              description: book.description ? book.description.substring(0, 200) : "Information missing",
              img: book.imageLinks ? book.imageLinks.thumbnail : 'https://raw.githubusercontent.com/erictalterio/MagicFeather/c1e249cfede00a18dd4620b159c857313117508a/unavailable.png',
              bookmarkIcon: bookmarkIcon
            });
            searchResultsDiv.appendChild(bookDiv);
          });
        } else {
          // Display "No book was found" message if no search results are returned
          let noResultsMessage = document.createElement('p');
          noResultsMessage.textContent = 'No book was found.';
          searchResultsDiv.appendChild(noResultsMessage);
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        // Display error message if there's an issue with fetching data
        let errorMessage = document.createElement('p');
        errorMessage.textContent = 'An error occurred while fetching data. Please try again later.';
        errorMessageDiv.appendChild(errorMessage);
      });
  });

  // Event listener for the cancel button click
  cancelButton.addEventListener('click', function() {
    // Reload the page
    location.reload();
  });
}

// Function to initialize the application
function initializeApp() {
  // Get the 'myBooks' and 'content' div elements
  let myBooksDiv = document.getElementById('myBooks');
  let contentDiv = document.getElementById('content');

  // Create and set up the logo image
  let logoImg = document.createElement('img');
  logoImg.src = 'https://github.com/erictalterio/MagicFeather/blob/0111360887f0edea991450f0192b6675f137d195/logo.png?raw=true';
  logoImg.alt = 'Poch Lib';
  logoImg.id = 'logo';

  // Insert the logo image above the 'PocketBooks' title
  let titleElement = document.querySelector('.title');
  titleElement.insertAdjacentElement('beforebegin', logoImg);

  // Create and set up the 'Add a Book' button
  let addButton = document.createElement('button');
  addButton.textContent = 'Add a Book';
  addButton.id = 'addButton';

  // Add styles to center the button
  addButton.style.display = 'block';
  addButton.style.marginLeft = 'auto';
  addButton.style.marginRight = 'auto';

  // Get the divider
  let divider = myBooksDiv.querySelector('hr');

  // Insert the 'Add a Book' button before the divider
  myBooksDiv.insertBefore(addButton, divider);

  // Get the bookshelf from the session storage or initialize it to an empty array if it doesn't exist
  let bookshelf = JSON.parse(sessionStorage.getItem('bookshelf')) || [];

  // Display each book in the bookshelf
  bookshelf.forEach(book => displayBook(book, true));

  // Event listener for the 'Add a Book' button click
  addButton.addEventListener('click', function() {
    // Remove any previous error messages
    let errorMessageDiv = document.querySelector('.error-message');
    if (errorMessageDiv) {
      errorMessageDiv.textContent = '';
    }

    handleBookSearch();
  });

  // Create and set up the 'bookmarked-books' container
  let bookmarkedBooksContainer = document.createElement('div');
  bookmarkedBooksContainer.id = 'bookmarked-books';
  bookmarkedBooksContainer.classList.add('search-results'); // Add 'search-results' class here

  // Append the 'bookmarked-books' container to 'contentDiv'
  contentDiv.appendChild(bookmarkedBooksContainer);

  // Move the 'book' divs inside 'content' to the 'bookmarked-books' container
  let contentBookDivs = contentDiv.querySelectorAll('.book');
  contentBookDivs.forEach(bookDiv => {
    bookmarkedBooksContainer.appendChild(bookDiv);
  });
}

// On page load, call initializeApp function
window.onload = function() {
  initializeApp();
};
