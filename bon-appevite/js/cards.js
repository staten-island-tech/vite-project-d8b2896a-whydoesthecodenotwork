const products = [
	{
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
				rating: 5,
			},
			{
				type: "Yellow",
				image: "breenyellow.png",
				description: "Now with replicated artifical lemon flavor!",
				price: 1.79,
				discounted: 0.89,
				rating: 5,
			},
		],
	},
	{
		name: "Gelatinated Calorie Pastes",
		price: 3.99,
		discounted: NaN,
		rating: 1.3,
		image: "paste.png",
		description: "Egg flavored",
	},
	{
		name: "Desiccated Sustenance Bars",
		price: 2.99,
		discounted: NaN,
		rating: 3.1,
		image: "bar.png",
		description: "Water flavored",
	},
	{
		name: "Standard Ration",
		price: 5.99,
		discounted: 5.98,
		rating: 2.8,
		image: "ration.png",
		description: "Standard citizen ration",
	},
	{
		name: "Melon",
		price: 99.99,
		discounted: 99.98,
		rating: 5,
		image: "melon.png",
		description: "Melon",
	},
	{
		name: "Beer",
		price: NaN,
		discounted: NaN,
		rating: 5,
		image: "beer.png",
		description: "Melon",
	},
];

export { products };
