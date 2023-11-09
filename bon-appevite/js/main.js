import { products } from "./cards.js";
import { filterData } from "./filters.js";
const DOMSelectors = {
    head: document.querySelector("head"),
    app: document.querySelector("#app"),
    cart: document.querySelector("#cart"),
    body: document.querySelector("body"),
    theme: document.querySelector("#theme"),
};

DOMSelectors.head.insertAdjacentHTML(
    "beforeend",
    `<link rel="stylesheet" href="styles/style.css">`
);

// preload all product images here, because otherwise the card changes size for a split second due to no image
products.forEach((product) => {
    product.types.forEach((item) => {
        DOMSelectors.head.insertAdjacentHTML(
            "beforeend",
            `<link rel="preload" href="images/${item.image}" as="image" />`
        );
    });
});

// because i want global scope on these
// inputs contains the input elements
const inputs = {};

// for each filter, add:
// the input name : input element, to inputs
document.querySelectorAll(".filter").forEach((input) => {
    inputs[input.children[1].name] = input.children[1];
});

function addCard(product) {
    insertCard(product); // insert a blank card
    updateCard(DOMSelectors.app.lastElementChild, product); // go in and edit the fields that aren't needed and other stuff
}

// add card elements
products.forEach((product) => addCard(product));

// add event listeners to the inputs, and update all of them right now
Object.keys(inputs).forEach((input) => {
    inputs[input].addEventListener("input", function () {
        updateFilter(inputs[input]);
    });
    updateFilter(inputs[input]);
});

function updateFilter(input) {
    if (input.name === "direction") {
        input.value = input.checked === false ? -1 : 1;
        // input.checked returns 0 or 1. but we need -1 or 1. Commit atrocity
    }
    if (input.name === "sort" || input.name === "direction") {
        // inputs.sort.value will return the actual display name of the selected element
        // but i need the html name attribute of the selected element
        switch (inputs.sort.selectedOptions[0].getAttribute("name")) {
            case "alphabetical":
                products.sort((a, b) => {
                    if (a.name < b.name) {
                        return inputs.direction.value;
                    } else {
                        return inputs.direction.value * -1;
                    }
                });
                break;
            case "price":
                products.sort((a, b) => {
                    const aprice = getLowerNum(
                        a.types[a.selected].price,
                        a.types[a.selected].discounted
                    );
                    const bprice = getLowerNum(
                        b.types[b.selected].price,
                        b.types[b.selected].discounted
                    );
                    if (aprice < bprice) {
                        return inputs.direction.value;
                    } else {
                        return inputs.direction.value * -1;
                    }
                });
                break;
            case "rating":
                products.sort((a, b) => {
                    if (
                        a.types[a.selected].rating > b.types[b.selected].rating
                    ) {
                        return inputs.direction.value;
                    } else {
                        return inputs.direction.value * -1;
                    }
                });
                break;
        }
        DOMSelectors.app.replaceChildren();
        products.forEach((product) => addCard(product));
    }

    // if the input should display its value, update the h5 here
    if (filterData[input.name].displayValue) {
        input.parentElement.querySelector("h5").innerText =
            filterData[input.name].prefix +
            parseFloat(input.value).toFixed(filterData[input.name].places) +
            filterData[input.name].suffix;
    }

    // check which products should be displayed whenever a filter is updated
    products.forEach((product) => {
        shouldDisplay(product);
        // if the savings dropdown was updated, update the cards' discount display
        if (input.name === "savings") {
            updateSavings(product);
        }
    });
}

function updateSavings(product) {
    const card = DOMSelectors["app"].querySelector(
        `div[name="${product.name}"]`
    );
    const item = product.types[product.selected];
    if (!isNaN(item.price) && !isNaN(item.discounted)) {
        // show by default - if the savings is none, set display to none later
        card.querySelector("em").style.display = "unset";
        switch (inputs.savings.value) {
            case "percent":
                card.querySelector("em h4").innerText = `You save ${
                    Math.trunc(
                        (((item.price - item.discounted) * 100) / item.price) *
                            10
                    ) / 10
                }%`;
                break;
            case "number":
                // blame floating point
                card.querySelector("em h4").innerText = `You save $${(
                    (item.price * 100 - item.discounted * 100) /
                    100
                ).toFixed(2)}`;
                break;
            case "none":
                card.querySelector("em").style.display = "none";
                break;
        }
    } else {
        // out of stock products should never have a discount display
        card.querySelector("em").style.display = "none";
    }
}

// go through all the filters and check product eligibility
function isFiltered(product) {
    const item = product.types[product.selected];

    // this block is for max price filtering
    // show out of stock products if user says so
    if (!(isNaN(item.price) && isNaN(item.discounted))) {
        if (getLowerNum(item.price, item.discounted) > inputs.maxprice.value) {
            return 0;
        }
    } else {
        return inputs.stock.checked * -1;
    }

    if (item.rating < inputs.rating.value) {
        return 0;
    }

    // return 1 at the end if the product should be shown, return 0 early if it didn't meet filters
    return 1;
}

function getLowerNum(a, b) {
    const nums = [a, b];
    // remove any nan
    nums.forEach((x) => {
        if (isNaN(x)) {
            nums.splice(nums.indexOf(x), 1);
        }
    });
    // then get the lower of the two (or the one if there's only one)
    // ... is spread operator, because Math.min doesn't actually take arrays
    return Math.min(...nums);
}

function shouldDisplay(product) {
    const card = DOMSelectors["app"].querySelector(
        `div[name="${product.name}"]`
    );
    if (isFiltered(product)) {
        card.style.display = "flex";
    } else {
        card.style.display = "none";
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
                            <em><h4>You save nothing!</h4></em>
                            <img src="images/${item.image}" alt="great product" />
                            <div class="rating" title="This item has a rating of ${item.rating} stars">
                                <div class="stars"></div>
                            </div>
                            <h4>${item.description}</h4>
                            <button id="buy">
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
            // dropdowns can change the sort order, so sort everything again after a dropdown changes
            updateCard(card, product);
            updateFilter(inputs.sort);
        });
    }

    // If the item has no price, label it as out of stock
    if (isNaN(item.price)) {
        card.querySelector("h4").innerText = "This item is out of stock.";
    }

    // If the item has no discount, make the discount element contain the price.
    // This is because the price is an h4 with strikethrough, so if we just deleted the discount then the price would still be an h4 with strikethrough.
    if (isNaN(item.discounted)) {
        card.querySelector("h3").innerText = card.querySelector("h4").innerText;
        card.querySelector("s").remove();
    }

    // hook up the buy button or remove it
    if (isNaN(item.price) && isNaN(item.discounted)) {
        card.querySelector("button").remove();
    } else {
        card.querySelector("button").addEventListener("click", function () {
            cart();
        });
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
    // check if card should display. update savings display. update all the filters if all cards are loaded in case sort changed
    shouldDisplay(product);
    updateSavings(product);
}

// handle cart shenanigans

let cartDisplay = 0;
function cart() {
    if (cartDisplay !== -1) {
        cartDisplay += 1;
        DOMSelectors.cart.innerText = `🛒 ${cartDisplay}`;
        DOMSelectors.cart.style.transitionDuration =
            (10 / cartDisplay).toString() + "s";
        console.log((10 / cartDisplay).toString() + "s");
    }
}

function payload() {
    if (cartDisplay > 0) {
        setTimeout(function () {
            alert("oh dear");
        }, 10000 / cartDisplay);
        DOMSelectors.cart.style.left = "110%";
        cartDisplay = -1;
    } else {
        alert("You have no items in your cart.");
    }
}
DOMSelectors.cart.addEventListener("click", function () {
    payload();
});

// handle theme selector down here
DOMSelectors.theme.addEventListener("input", function () {
    DOMSelectors.body.className =
        DOMSelectors.theme.selectedOptions[0].innerHTML;
    console.log(DOMSelectors.theme.selectedOptions[0].innerHTML);
});
