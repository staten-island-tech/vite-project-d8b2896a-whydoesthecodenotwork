import { products } from "./cards.js";

const DOMSelectors = {
	head: document.querySelector("head"),
	app: document.querySelector("#app"),
};

DOMSelectors.head.insertAdjacentHTML(
	"beforeend",
	`<link rel="stylesheet" href="styles/style.css">`
);

products.forEach((product) => {
	// preload all product images here, because otherwise the card changes size for a split second due to no image
	product.types.forEach((item) => preloadImage(item));
});

function preloadImage(item) {
	DOMSelectors.head.insertAdjacentHTML(
		"beforeend",
		`<link rel="preload" href="images/${item.image}" as="image" />`
	);
}

const inputs = document.querySelectorAll("input");
const filters = {};

function addCards() {
	products.forEach((product) => addCard(product));

	// this also adds event listeners to the inputs
	inputs.forEach((input) => {
		input.addEventListener("input", function () {
			updateFilter(input);
		});
	});
}

addCards();

function updateFilter(input) {
	console.log("asdas");
	filters[input.name] = input.value;
	const filteredProducts = products.filter((product) => {
		const item = product.types[product.selected];
		if (isNaN(item.price) && isNaN(item.discounted)) {
			return 1;
		} else {
			const prices = [item.price, item.discounted];
			prices.forEach((price) => {
				if (isNaN(price)) {
					prices.splice(prices.indexOf(price), 1);
				}
			});
			return Math.min(...prices) < filters.maxprice;
		}
	});

	console.log(filteredProducts);
	products.forEach((product) => {
		const contains = filteredProducts.indexOf(product) !== -1;
		DOMSelectors["app"].querySelector(
			`div[name="${product.name}"]`
		).style.display = contains ? "flex" : "none";
	});
	input.parentElement.childNodes[2].nodeValue = input.value;
}

inputs.forEach((input) => (filters[input.name] = input.value));

function addCard(product) {
	{
		insertCard(product); // insert card with all fields filled
		updateCard(DOMSelectors.app.lastElementChild, product); // go in and edit the fields that aren't needed and other stuff
	}
}

function insertCard(product) {
	// This is a blank card... too bad!
	DOMSelectors.app.insertAdjacentHTML(
		"beforeend",
		`
		<div class="card" name="${product.name}">
		</div>	
		`
	);
}

function updateCard(card, product) {
	// if the card has a select element (it will not have one if it has only 1 type or it just got created),
	// update product.selected to the selected option
	// it will then be used in updating the card
	if (card.querySelector("select")) {
		product.selected = card.querySelector("select").selectedIndex;
	}
	// all products have a default product.selected of 0
	var item = product.types[product.selected];
	card.innerHTML = `
                        <h2>${product.name}</h2>
                        <s><h4>$${item.price}</h4></s>
                            <h3>$${item.discounted}</h3>
                            <img src="images/${item.image}" alt="great product" />
                            <div class="rating" title="This item has a rating of ${item.rating} stars">
                                <div class="stars"></div>
                            </div>
                            <h4>${item.description}</h4>
                            <button onclick="alert('you shall not buy!!')">
                            BUY NOW!!
                            </button>
    `;

	// add a select element if it doesn't already exist and we need it
	if (product.types.length > 1) {
		const select = document.createElement("select");
		product.types.forEach((type) => {
			select.insertAdjacentHTML(
				"beforeend",
				`<option value="${type.type}">${type.type}</option>`
			);
		});
		// because we just blew up the select element and are re-adding it, select the last user selected element
		select.children[product.selected].selected = true;
		card.querySelector("button").insertAdjacentElement(
			"beforebegin",
			select
		);
		card.querySelector("select").addEventListener("change", function () {
			updateCard(card, product);
		});
	}

	// If the item has no price, label it as out of stock
	if (isNaN(item.price)) {
		card.querySelector("h4").innerText = "This item is out of stock.";
		card.querySelector("button").remove();
	}

	// If the item has no discount, make the discount element contain the price.
	// This is because the price is an h4 with strikethrough, so if we just deleted the discount then the price would still be an h4 with strikethrough.
	if (isNaN(item.discounted)) {
		card.querySelector("h3").innerText = card.querySelector("h4").innerText;
		card.querySelector("s").remove();
	}

	// Do horrible things to create a ratings bar.
	// Actual stars are overrated anyway
	const stars = card.querySelector(".stars");
	// Items with dropdown will just keep adding stars
	stars.replaceChildren();
	var rating = item.rating;
	while (rating > 0 || stars.children.length < 5) {
		// Now we can have more than 5 stars
		stars.insertAdjacentHTML(
			"beforeend",
			`						
					<div class="star">
						<div class="filled" style="width: 0%"></div>
						<div class="empty"></div>
					</div>
					`
		);
		stars.lastElementChild.children[0].style.width =
			Math.min(1, rating) * 100 + "%";
		rating -= 1;
	}
}
