const Product = require('../models/product')

const pizzaCategories = new Set([
    'Pizza',
    'Cheese Pizza',
    'Spicy Pizza',
    'Pepperoni Pizza',
    'Meat Lovers Pizza',
    'Hawaiian Pizza',
    'Vegetarian Pizza'
])

const menuProducts = [
    {
        name: 'Tartufo Bianco',
        price: 580,
        description: 'White truffle cream, wild mushrooms, and mozzarella.',
        image: 'Tartufo Bianco.png'
    },
    {
        name: 'Diavola',
        price: 560,
        description: 'San Marzano tomatoes, mozzarella cheese, spicy salami, and chili peppers.',
        image: 'Diavola.png'
    },
    {
        name: 'Capricciosa',
        price: 610,
        description: 'San Marzano tomatoes, mozzarella cheese, Italian ham, mushrooms, artichokes, and black olives.',
        image: 'Capricciosa.png'
    },
    {
        name: 'Quattro Formaggi',
        price: 640,
        description: 'A rich blend of Gorgonzola, Taleggio, Fontina, and Parmesan cheeses, finished with fresh rosemary and black pepper.',
        image: 'Quattro Formaggi.png'
    },
    {
        name: 'Prosciutto e Rucola',
        price: 590,
        description: 'Prosciutto di Parma, fresh rocket greens, shaved parmesan cheese, and mozzarella.',
        image: 'Prosciutto e Rucola.png'
    },
    {
        name: 'Frutti di Mare',
        price: 680,
        description: 'A generous mix of fresh seafood: mussels, clams, calamari, and shrimp, with garlic, parsley, and tomato sauce.',
        image: 'Frutti di Mare.png'
    },
    {
        name: 'Caprese',
        price: 540,
        description: 'San Marzano tomato sauce, fresh buffalo mozzarella slices, fresh cherry tomatoes, basil pesto drizzle, and fresh basil leaves.',
        image: 'Caprese.png'
    },
    {
        name: 'Ortolana',
        price: 520,
        description: 'San Marzano tomato sauce, mozzarella, roasted bell peppers, grilled zucchini, eggplant, and red onions.',
        image: 'Ortolona.png'
    },
    {
        name: 'Calzone',
        price: 630,
        description: 'Folded pizza dough stuffed with mozzarella, ricotta, spicy salami, ham, and mushrooms, baked until golden brown.',
        image: 'Calzone.png'
    },
    {
        name: 'Pizza al Taglio',
        price: 550,
        description: 'Traditional rectangular Roman-style pizza crust topped with rich tomato sauce, fresh mozzarella, and aromatic garden herbs.',
        image: 'Pizza al Taglio.png'
    }
]

const seedMenuProducts = async () => {
    await Product.deleteMany({
        $or: [
            { name: { $regex: /^cheesezza$/i } },
            { name: { $regex: /^hawaiian delight$/i } },
            { name: { $regex: /^great manhattan$/i } },
            { name: { $regex: /^sandisk\s+ultra\s+128gb\s+sdxc\s+uhs-i\s+memory\s+card.*$/i } },
            { category: { $nin: [...pizzaCategories] } }
        ]
    })

    for (const { image, ...product } of menuProducts) {
        await Product.updateOne(
            { name: product.name },
            {
                $setOnInsert: {
                    ...product,
                    ratings: 0,
                    images: [{
                        public_id: `menu/${product.name.toLowerCase().replaceAll(' ', '-')}`,
                        url: `/images/${image}`
                    }],
                    category: 'Pizza',
                    seller: 'Pizzaro',
                    stock: 50,
                    numOfReviews: 0,
                    reviews: []
                }
            },
            { upsert: true }
        )
    }
}

module.exports = seedMenuProducts
