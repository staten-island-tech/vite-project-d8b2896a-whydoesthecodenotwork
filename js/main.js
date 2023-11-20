import { products } from "./products.js";
import { filterData } from "./filters.js";
import "../styles/style.css";

const DOMSelectors = {
    head: document.querySelector("head"),
    app: document.querySelector("#app"),
    cart: document.querySelector("#cart"),
    body: document.querySelector("body"),
    theme: document.querySelector("#theme"),
    tag: document.querySelector("#tag"),
};

// preload all product images here, because otherwise the card changes size for a split second due to no image
products.forEach((product) => {
    product.types.forEach((item) => {
        DOMSelectors.head.insertAdjacentHTML(
            "beforeend",
            `<link rel="preload" href="./${item.image}" as="image" />`
        );
    });
});

// because i want global scope on these
// inputs contains the input elements
const inputs = {};

// for each filter, add:
// the input name : input element, to inputs
// i cannot use map here because Array.from(document.querySelectorAll(".filter")) is an array, but inputs needs to be an object.
// map returns an array
document.querySelectorAll(".filter:not(.tag)").forEach((input) => {
    inputs[input.children[1].name] = input.children[1];
});

// handle the tag filter.
// essentially it's a ripoff of the normal filters, but instead of being in inputs as {name:element} all enabled tags are stored in tags set.

// go through all the products and keep track of what tags there are

const tagNames = new Set(products.flatMap((product) => product.tags));
// normal map would return an array like [[drink], [drink], [food, item]...] (not good)
// flatmap is basically .map(bla).flat and that flattens it into [drink, drink, food, item...]
// set removes duplicates, so [drink, food, item]
tagNames.forEach((tag) => {
    DOMSelectors.tag.insertAdjacentHTML(
        "beforeend",
        `		
            <div class="filter tag">
                <label for="${tag}">${tag}</label>
                <input name="${tag}" id="${tag}" type="checkbox" value="on" checked></input>
            </div>
        `
    );
});

// create a set (no duplicates) with all enabled tags
const tags = tagNames;
document.querySelectorAll(".tag").forEach((element) => {
    element.addEventListener("input", function () {
        if (element.children[1].checked) {
            tags.add(element.children[1].name);
        } else {
            tags.delete(element.children[1].name);
        }
        productDisplays();
    });
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

    // if the input should display its value, update the output here
    if (filterData[input.name].displayValue) {
        input.parentElement.querySelector("output").innerText =
            filterData[input.name].prefix +
            parseFloat(input.value).toFixed(filterData[input.name].places) +
            filterData[input.name].suffix;
    }

    // check which products should be displayed whenever a filter is updated
    productDisplays();

    // if the savings dropdown was updated, update the cards' discount display
    if (input.name === "savings") {
        products.forEach((product) => updateSavings(product));
    }
}

function productDisplays() {
    const filteredProducts = products.filter((product) => isFiltered(product));
    products.forEach((product) => {
        const card = DOMSelectors["app"].querySelector(
            `section[name="${product.name}"]`
        );
        if (filteredProducts.includes(product)) {
            card.style.display = "flex";
        } else {
            card.style.display = "none";
        }
    });
    if (filteredProducts.length === 0) {
        if (!DOMSelectors.app.querySelector(".oops")) {
            DOMSelectors.app.insertAdjacentHTML(
                "afterbegin",
                "<h2 class='oops'>No eligible items were found</h2>"
            );
        }
    } else {
        if (DOMSelectors.app.querySelector(".oops")) {
            DOMSelectors.app.querySelector(".oops").remove();
        }
    }
}

function updateSavings(product) {
    const card = DOMSelectors["app"].querySelector(
        `section[name="${product.name}"]`
    );
    const item = product.types[product.selected];
    if (!isNaN(item.price) && !isNaN(item.discounted)) {
        // show by default - if the savings is none, set display to none later
        card.querySelector(".saving").style.display = "unset";
        switch (inputs.savings.value) {
            case "percent":
                card.querySelector(".saving").innerText = `You save ${
                    Math.trunc(
                        (((item.price - item.discounted) * 100) / item.price) *
                            10
                    ) / 10
                }%`;
                break;
            case "number":
                // blame floating point
                card.querySelector(".saving").innerText = `You save $${(
                    (item.price * 100 - item.discounted * 100) /
                    100
                ).toFixed(2)}`;
                break;
            case "none":
                card.querySelector(".saving").style.display = "none";
                break;
        }
    } else {
        // out of stock products should never have a discount display
        card.querySelector(".saving").style.display = "none";
    }
}

// go through all the filters (inputs) and check product eligibility
function isFiltered(product) {
    const item = product.types[product.selected];

    // this block is for max price filtering
    // show out of stock products if user says so
    if (!(isNaN(item.price) && isNaN(item.discounted))) {
        if (getLowerNum(item.price, item.discounted) > inputs.maxprice.value) {
            return 0;
        }
    } else {
        // only show out of stock things if the checkbox is checked
        if (!inputs.stock.checked) {
            return 0;
        }
    }

    if (item.rating < inputs.rating.value) {
        return 0;
    }

    if (!product.tags.some((c) => tags.has(c))) {
        return 0;
    }

    // return 1 at the end if the product should be shown, return 0 early if it didn't meet filters
    return 1;
}

function getLowerNum(a, b) {
    // remove any nan
    const nums = [a, b].filter((x) => {
        if (isNaN(x)) {
            return 0;
        }
        return 1;
    });
    // then get the lower of the two (or the one if there's only one)
    // ... is spread operator, because Math.min doesn't actually take arrays
    return Math.min(...nums);
}

function insertCard(product) {
    // This is a blank card... too bad!
    DOMSelectors.app.insertAdjacentHTML(
        "beforeend",
        `
		<section class="card" name="${product.name}">
		</section>	
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
                        <h3 class="price">Old price: $${item.price}</h3>
                        <h3 class="discount">$${item.discounted}</h3>
                        <h3 class="saving">You save nothing!</h3>
                        <img src="./${item.image}" alt="${product.name}" />
                        <div class="rating" title="This item has a rating of ${item.rating} stars">
                            <div class="stars"></div>
                            <h4 class="startext">This item has a rating of ${item.rating} stars</h4>
                        </div>
                        <h4>${item.description}</h4>
                        <details>
                            <summary>Tags</summary>
                            <ul></ul>
                        </details>
                        <button id="buy" class="cart">
                        BUY NOW!!
                        </button>
    `;

    // add a select element if it doesn't already exist and we need it
    if (product.types.length > 1) {
        // first add a label for the select element
        card.querySelector("button").insertAdjacentHTML(
            "beforebegin",
            "<label>Select a product type: </label>"
        );

        // create the select element
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

        // insert in label
        card.querySelector("label").insertAdjacentElement("beforeend", select);

        // change alt text to represent type
        card.querySelector("img").setAttribute(
            "alt",
            `${product.name}: ${product.types[product.selected].type}`
        );

        card.querySelector("select").addEventListener("change", function () {
            // dropdowns can change the sort order, so sort everything again after a dropdown changes
            updateCard(card, product);
            updateFilter(inputs.sort);
        });
    }

    // If the item has no discount, make the discount element contain the price.
    // This is because the price is an h3 with strikethrough, so if we just deleted the discount then the price would still be an h3 with strikethrough.
    if (isNaN(item.discounted)) {
        card.querySelector(".discount").innerText = `$${item.price}`;
        card.querySelector(".price").remove();
        card.querySelector(".saving");
    }

    // hook up the buy button or remove it
    // also since there's no prices, laebl it as out of stock
    if (isNaN(item.price) && isNaN(item.discounted)) {
        card.querySelector("button").remove();
        card.querySelector(".discount").innerText =
            "This item is out of stock.";
    } else {
        card.querySelector("button").addEventListener("click", cart);
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

    // add tags
    product.tags.forEach((tag) => {
        card.querySelector("ul").insertAdjacentHTML(
            "beforeend",
            `<li>${tag}</li>`
        );
    });

    // check if card should display. update savings display.
    if (isFiltered(product)) {
        card.style.display = "flex";
    } else {
        card.style.display = "none";
    }
    updateSavings(product);
}

// handle cart shenanigans

let cartDisplay = 0;
function cart() {
    if (cartDisplay === 0) {
        // the cart is no longer empty. this class change will change the pointer hover
        DOMSelectors.cart.classList.remove("empty");
    }
    if (cartDisplay !== -1) {
        // play an animation whenever an item is added
        DOMSelectors.cart.classList.add("animation");
        setTimeout(function () {
            DOMSelectors.cart.classList.remove("animation");
        }, 50);
        cartDisplay += 1;
        DOMSelectors.cart.innerText = `🛒 ${cartDisplay}`;
        DOMSelectors.cart.style.bottom = "2vh";
        DOMSelectors.cart.style.transitionDuration =
            (10 / cartDisplay).toString() + "s";
    }
}

function payload() {
    if (cartDisplay > 0) {
        DOMSelectors.cart.removeEventListener("click", payload);
        setTimeout(function () {
            alert("oh dear");
            document.querySelectorAll("button").forEach((button) => {
                button.className = "nocart";
                button.addEventListener("click", function () {
                    alert("there's no more cart");
                });
            });
        }, 10500 / cartDisplay);
        // goodbye cart
        DOMSelectors.cart.style.left = "105%";
        // change cursor back to no clicking
        DOMSelectors.cart.classList.add("empty");
        cartDisplay = -1;
    }
}

DOMSelectors.cart.addEventListener("click", payload);

// handle theme selector down here
DOMSelectors.theme.addEventListener("input", function () {
    DOMSelectors.body.className =
        DOMSelectors.theme.selectedOptions[0].innerHTML;
});
