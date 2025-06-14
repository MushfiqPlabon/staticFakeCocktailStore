// app.js
let cart = [];

const productContainer = document.getElementById("product-container");
const cartMainContainer = document.getElementById("cart-main-container");
const countSpan = document.getElementById("count");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");

const drinkDetailsModal = new bootstrap.Modal(document.getElementById('drinkDetailsModal'));
const modalTitle = document.getElementById('drinkDetailsModalLabel');
const modalDrinkImg = document.getElementById('modal-drink-img');
const modalDrinkCategory = document.getElementById('modal-drink-category');
const modalDrinkGlass = document.getElementById('modal-drink-glass');
const modalDrinkInstructions = document.getElementById('modal-drink-instructions');
const modalDrinkIngredients = document.getElementById('modal-drink-ingredients');


const loadAllProduct = (searchTerm = '') => {
    let url;
    if (searchTerm) {
        url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${searchTerm}`;
    } else {
        url = `https://www.thecocktaildb.com/api/json/v1/1/search.php?f=a`;
    }

    fetch(url)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => {
            if (data.drinks) {
                displayProduct(data.drinks);
            } else {
                productContainer.innerHTML = `<div class="col-12"><p class="alert alert-info">No drinks found for your search.</p></div>`;
            }
        })
        .catch((error) => {
            console.error("Error fetching cocktails:", error);
            productContainer.innerHTML = `<div class="col-12"><p class="alert alert-danger">Failed to load cocktails. Please try again later.</p></div>`;
        });
};

const displayProduct = (drinks) => {
    let productsHtml = '';
    
    drinks.forEach((drink) => {
        const glass = drink.strGlass ? drink.strGlass : 'N/A';
        const instructions = drink.strInstructions ? `${drink.strInstructions.slice(0, 15)}...` : 'No instructions available.';

        productsHtml += `
            <div class="col">
                <div class="card h-100 shadow-sm">
                    <img src="${drink.strDrinkThumb}" class="card-img-top mx-auto d-block p-3" alt="${drink.strDrink}"
                        style="max-width: 150px; height: 150px; object-fit: contain;">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title product-title">${drink.strDrink}</h5>
                        <h6 class="card-subtitle mb-2 text-muted product-category">Category: ${drink.strCategory}</h6>
                        <h6 class="card-subtitle mb-2 text-muted product-glass">Glass: ${glass}</h6>
                        <p class="card-text flex-grow-1 product-instructions">${instructions}</p>
                        <div class="mt-auto">
                            <button class="btn btn-outline-primary btn-sm me-2 details-btn" data-product-id="${drink.idDrink}" data-bs-toggle="modal" data-bs-target="#drinkDetailsModal">Details</button>
                            <button class="btn btn-success btn-sm add-to-group-btn" data-product-id="${drink.idDrink}" data-product-name="${drink.strDrink}" data-product-image="${drink.strDrinkThumb}">Add to Group</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    productContainer.innerHTML = productsHtml;
};

productContainer.addEventListener('click', (event) => {
    const target = event.target;

    if (target.classList.contains('details-btn')) {
        const productId = target.dataset.productId;
        singleProduct(productId);
    } else if (target.classList.contains('add-to-group-btn')) {
        const productId = target.dataset.productId;
        const productName = target.dataset.productName;
        const productImage = target.dataset.productImage;
        handleAddToGroup(productName, productId, productImage);
    }
});

searchButton.addEventListener('click', () => {
    const searchTerm = searchInput.value.trim();
    loadAllProduct(searchTerm);
});

searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        const searchTerm = searchInput.value.trim();
        loadAllProduct(searchTerm);
    }
});

const handleAddToGroup = (name, id, image) => {
    if (cart.length >= 7) {
        alert("You cannot add more than 7 drinks to the group!");
        return;
    }

    const existingItem = cart.find(item => item.id === id);

    if (!existingItem) {
        cart.push({ id, name, image });
        updateCartUI();
    } else {
        alert(`"${name}" is already in your group!`);
    }
};

const updateCartUI = () => {
    let cartItemsHtml = `
        <div class="d-flex justify-content-between align-items-center mb-2 fw-bold">
            <span style="width: 10%;">SL</span>
            <span style="width: 25%;">Img</span>
            <span style="width: 65%;">Name</span>
        </div>
    `;

    let serialNumber = 1;
    cart.forEach(item => {
        cartItemsHtml += `
            <div class="d-flex justify-content-between align-items-center my-2 border-bottom pb-2 group-item">
                <p class="mb-0 group-item-sl" style="width: 10%;">${serialNumber++}</p>
                <img src="${item.image}" class="group-item-img" alt="${item.name}" style="width: 50px; height: 50px; object-fit: contain; width: 25%;">
                <p class="mb-0 group-item-name" style="width: 65%;">${item.name}</p>
            </div>
        `;
    });
    
    cartMainContainer.innerHTML = cartItemsHtml;

    countSpan.innerText = cart.length;
};

const singleProduct = (id) => {
    fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => {
            const drinkDetails = data.drinks[0];
            if (drinkDetails) {
                modalTitle.textContent = drinkDetails.strDrink;
                modalDrinkImg.src = drinkDetails.strDrinkThumb;
                modalDrinkImg.alt = drinkDetails.strDrink;
                modalDrinkCategory.textContent = drinkDetails.strCategory;
                modalDrinkGlass.textContent = drinkDetails.strGlass;
                modalDrinkInstructions.textContent = drinkDetails.strInstructions;

                modalDrinkIngredients.innerHTML = '';
                let ingredientsCount = 0;
                for (let i = 1; i <= 15; i++) {
                    const ingredient = drinkDetails[`strIngredient${i}`];
                    const measure = drinkDetails[`strMeasure${i}`];
                    if (ingredient && ingredient.trim() !== '') {
                        const listItem = document.createElement('li');
                        listItem.textContent = `${measure ? measure.trim() + ' ' : ''}${ingredient.trim()}`;
                        modalDrinkIngredients.appendChild(listItem);
                        ingredientsCount++;
                        if (ingredientsCount >= 5 && i >= 5) break; 
                    }
                }
                if (ingredientsCount === 0) {
                    const listItem = document.createElement('li');
                    listItem.textContent = 'No ingredients listed.';
                    modalDrinkIngredients.appendChild(listItem);
                }

                drinkDetailsModal.show();
            } else {
                alert("Drink details not found.");
            }
        })
        .catch((error) => {
            console.error("Error fetching single drink:", error);
            alert("Failed to load drink details.");
        });
};

loadAllProduct();