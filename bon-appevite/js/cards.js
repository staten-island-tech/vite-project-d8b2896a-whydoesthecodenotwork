// every product has at least 1 type by default and the selected property
// selected property saves the user's dropdown selection so filtering is easier to add
// even products with 1 type have it, but they don't get a dropdown

const products = [
	{
		selected: 0,
		name: "Dr. Breen's private reserve",
		types: [
			{
				type: "Original",
				image: "breenblue.png",
				description: "An original can of Dr. Breen's private reserve.",
				price: 1.99,
				discounted: 0.99,
				rating: 5,
			},
			{
				type: "Red",
				image: "breenred.png",
				description:
					"Dr. Breen's private reserve, now with a red twist.",
				price: 2.0,
				discounted: 1.0,
				rating: 4,
			},
			{
				type: "Yellow",
				image: "breenyellow.png",
				description:
					"A refreshing beverage for the citizens of City 17.",
				price: 1.79,
				discounted: 0.89,
				rating: 4.7,
			},
		],
	},
	{
		selected: 0,
		name: "Gelatinated Calorie Pastes",
		types: [
			{
				price: 3.99,
				discounted: NaN,
				rating: 1.3,
				image: "paste.png",
				description: "Egg flavored",
			},
		],
	},
	{
		selected: 0,
		name: "Desiccated Sustenance Bars",
		types: [
			{
				price: 2.99,
				discounted: NaN,
				rating: 3.1,
				image: "bar.png",
				description: "Water flavored",
			},
		],
	},
	{
		selected: 0,
		name: "Standard Ration",
		types: [
			{
				price: 5.99,
				discounted: 5.98,
				rating: 2.8,
				image: "ration.png",
				description: "Standard citizen ration",
			},
		],
	},
	{
		selected: 0,
		name: "Melon",
		types: [
			{
				price: 99.99,
				discounted: 99.98,
				rating: 5,
				image: "melon.png",
				description: "Melon",
			},
		],
	},
	{
		selected: 0,
		name: "Beer",
		types: [
			{
				price: NaN,
				discounted: NaN,
				rating: 100,
				image: "beer.png",
				description: `Out of stock because someone named "Barney" bought every beer we had... But he did say it was for a good cause(?)`,
			},
		],
	},
];

export { products };
