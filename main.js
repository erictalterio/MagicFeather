// On window load
window.onload = function() {
    // Get the 'myBooks' and 'content' div elements
    let myBooksDiv = document.getElementById('myBooks');
    let contentDiv = document.getElementById('content');
  
    // Create and set up the 'Add a Book' button
    let addButton = document.createElement('button');
    addButton.textContent = 'Add a Book';
    addButton.id = 'addButton';
  
    // Get the divider
    let divider = myBooksDiv.querySelector('hr');
  
    // Insert the 'Add a Book' button before the divider
    myBooksDiv.insertBefore(addButton, divider);
  
    // Get the bookshelf from the session storage or initialize it to an empty array if it doesn't exist
    let bookshelf = JSON.parse(sessionStorage.getItem('bookshelf')) || [];
  
    // Function to display a book
    function displayBook(book, isBookshelf) {
      // Create a div for the book
      let bookDiv = document.createElement('div');
      bookDiv.classList.add('book');
  
      // Create and append elements for the book's title, author, ISBN, description, and image
      let title = document.createElement('h2');
      title.textContent = book.title;
      bookDiv.appendChild(title);
  
      let authorPara = document.createElement('p');
      authorPara.textContent = book.author;
      bookDiv.appendChild(authorPara);
  
      let isbnPara = document.createElement('p');
      isbnPara.textContent = book.isbn;
      bookDiv.appendChild(isbnPara);
  
      let descriptionPara = document.createElement('p');
      descriptionPara.textContent = book.description;
      bookDiv.appendChild(descriptionPara);
  
      let img = document.createElement('img');
      img.src = book.img;
      bookDiv.appendChild(img);
  
      // If the book has a bookmark icon, append it
      if (book.bookmarkIcon) {
        bookDiv.appendChild(book.bookmarkIcon);
      }
  
      // If the book is in the bookshelf, add a trash icon and append the book to the 'content' div
      if (isBookshelf) {
        let trashIcon = document.createElement('i');
        trashIcon.className = 'fas fa-trash';
        trashIcon.style.cursor = 'pointer';
        trashIcon.addEventListener('click', function() {
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
  
    // Display each book in the bookshelf
    bookshelf.forEach(book => displayBook(book, true));
  
    // Declare variable to store the search results div
    let searchResultsDiv;
  
    // Event listener for the 'Add a Book' button click
    addButton.addEventListener('click', function() {
      // Remove the 'Add a Book' button
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
  
      // Insert the form after the 'New Book' heading
      myBooksDiv.insertBefore(form, myBooksDiv.querySelector('hr').previousSibling.nextSibling);
  
      // Cancel button
      let cancelButton = document.createElement('button');
      cancelButton.textContent = 'Cancel';
      cancelButton.type = 'button';
      cancelButton.id = 'cancelButton';
      form.appendChild(cancelButton);
  
      // Event listener for the search form submission
      form.addEventListener('submit', function(event) {
        // Prevent the form from being submitted
        event.preventDefault();
  
        // Get the book title and author from the input fields
        let bookTitle = document.getElementById('bookTitleInput').value;
        let author = document.getElementById('authorInput').value;
  
        // Construct the request URL for the Google Books API
        let requestUrl = `https://www.googleapis.com/books/v1/volumes?q=${bookTitle}+inauthor:${author}`;
  
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
  
            // For each item in the data, display the book and add the bookmark icon
            data.items.forEach(item => {
              let book = item.volumeInfo;
              let bookmarkIcon = document.createElement('i');
              bookmarkIcon.className = 'fa fa-bookmark';
  
              bookmarkIcon.addEventListener('click', function() {
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
                  alert('You cannot add the same book twice');
                }
              });
  
              displayBook({
                title: book.title,
                author: book.authors ? book.authors[0] : "Author Unknown",
                isbn: book.industryIdentifiers ? book.industryIdentifiers[0].identifier : "ISBN Unknown",
                description: book.description ? book.description.substring(0, 200) : "Information missing",
                img: book.imageLinks ? book.imageLinks.thumbnail : 'https://raw.githubusercontent.com/erictalterio/MagicFeather/c1e249cfede00a18dd4620b159c857313117508a/unavailable.png',
                bookmarkIcon: bookmarkIcon
              }, false);
            });
  
            // Append the search results div to the myBooksDiv
            myBooksDiv.insertBefore(searchResultsDiv, divider.nextSibling);
          });
      });
  
      // Event listener for the cancel button click
      cancelButton.addEventListener('click', function() {
        // Reload the page
        location.reload();
      });
  
    });
  };
  