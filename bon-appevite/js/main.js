import { products } from "./cards.js";
import { filterData } from "./filters.js";

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
    product.types.forEach((item) => {
        DOMSelectors.head.insertAdjacentHTML(
            "beforeend",
            `<link rel="preload" href="images/${item.image}" as="image" />`
        );
    });
});

// because i want global scope on these
const inputs = [];
const filters = {};

document.querySelectorAll(".filter").forEach((input) => {
    inputs.push(input.children[1]);
    filters[input.children[1].name] = input.children[1].value;
});

function addCards() {
    products.forEach((product) => addCard(product));

    // this also adds event listeners to the inputs
    inputs.forEach((input) => {
        input.addEventListener("input", function () {
            updateFilter(input);
        });
        updateFilter(input);
    });
}

addCards();

function isFiltered(product) {
    // go through all the filters and check product eligibility
    const item = product.types[product.selected];

    // always show out of stock products
    if (!(isNaN(item.price) && isNaN(item.discounted))) {
        const prices = [item.price, item.discounted];
        // remove any nan prices
        prices.forEach((price) => {
            if (isNaN(price)) {
                prices.splice(prices.indexOf(price), 1);
            }
        });
        // then get the lower of the two (or the one if there's only one)
        // ... is spread operator, because Math.min doesn't actually take arrays
        if (Math.min(...prices) > filters.maxprice) {
            return 0;
        }
    }

    return 1;
}

function shouldDisplay(product) {
    const card = DOMSelectors["app"].querySelector(
        `div[name="${product.name}"]`
    );
    if (isFiltered(product)) {
        card.style.display = "flex";
        const item = product.types[product.selected];

        // shouldDisplay runs when a filter is updated so just
        if (!isNaN(item.price) && !isNaN(item.discounted)) {
            card.querySelector("em").style.display = "unset";
            switch (filters.savings) {
                case "percent":
                    card.querySelector("em h4").innerText = `You save ${
                        Math.trunc(
                            (((item.price - item.discounted) * 100) /
                                item.price) *
                                10
                        ) / 10
                    }%`;
                    break;
                case "number":
                    card.querySelector("em h4").innerText = `You save $${
                        Math.trunc((item.price - item.discounted) * 100) / 100
                    }`;
                    break;
                case "none":
                    card.querySelector("em").style.display = "none";
                    break;
            }
        } else {
            card.querySelector("em").style.display = "none";
        }
    } else {
        card.style.display = "none";
    }
}

function updateFilter(input) {
    filters[input.name] = input.value;
    if (filterData[input.name].shouldDisplay) {
        input.parentElement.querySelector("h5").innerText =
            filterData[input.name].prefix +
            input.value +
            filterData[input.name].suffix;
    }
    products.forEach((product) => {
        shouldDisplay(product);
    });
}

function addCard(product) {
    insertCard(product); // insert a blank card
    updateCard(DOMSelectors.app.lastElementChild, product); // go in and edit the fields that aren't needed and other stuff
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
                            <em><h4>You save nothing!</h4></em>
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
        select.setAttribute("title", "Select a product type");
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

    shouldDisplay(product);
}
