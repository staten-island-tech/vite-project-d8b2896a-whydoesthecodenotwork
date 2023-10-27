import { products } from "./cards.js";
const html = document.querySelector("html");
const app = document.querySelector("#app");
html.insertAdjacentHTML(
	"beforeend",
	`<link rel="stylesheet" href="styles/style.css">`
);

document
	.querySelector('input[type="range"')
	.addEventListener("input", updateFilter);

function updateFilter(event) {
	try {
		event.preventDefault();
	} catch (error) {
		// we ran this function outside of an event listener... too bad!
	}
	app.replaceChildren();
	const hp = document.querySelector("label");
	hp.querySelector("em").innerText =
		hp.querySelector("input[type='range'").value;
	products.forEach((product) => {
		app.insertAdjacentHTML(
			"beforeend",
			`
					<h1>this is ${product}. here is a picture</h1>
					<img src="images/${product.image}"/>		
			`
		);
	});
}

updateFilter();
