import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/product.model.js";

dotenv.config();

const products = [
    { name: "Bruno", description: "Irish Terrier, 1 year. Fearless, loyal and always up for a run. Vaccinated and dewormed.", price: 24999, category: "Dogs", image: "https://images.dog.ceo/breeds/terrier-irish/n02093991_3234.jpg", stock: 1 },
    { name: "Shadow", description: "Whippet, 2 years. Lightning fast outdoors, a total couch potato indoors.", price: 31999, category: "Dogs", image: "https://images.dog.ceo/breeds/whippet/n02091134_15210.jpg", stock: 2 },
    { name: "Biscuit", description: "Dandie Dinmont Terrier, 8 months. Fluffy top-knot, gentle and very cuddly.", price: 27999, category: "Dogs", image: "https://images.dog.ceo/breeds/terrier-dandie/n02096437_4466.jpg", stock: 3 },
    { name: "Rocky", description: "Lakeland Terrier, 1.5 years. Playful, clever and great with kids.", price: 22999, category: "Dogs", image: "https://images.dog.ceo/breeds/terrier-lakeland/n02095570_434.jpg", stock: 2 },
    { name: "Bailey", description: "Wheaten Terrier, 1 year. Silky coat, sunny temperament, hypoallergenic.", price: 34999, category: "Dogs", image: "https://images.dog.ceo/breeds/terrier-wheaten/n02098105_4120.jpg", stock: 1 },
    { name: "Coco", description: "Toy Terrier, 6 months. Tiny, energetic and perfect for apartments.", price: 18999, category: "Dogs", image: "https://images.dog.ceo/breeds/terrier-toy/n02087046_568.jpg", stock: 4 },
    { name: "Max", description: "Schnauzer, 2 years. Bearded gentleman, alert watchdog, very obedient.", price: 29999, category: "Dogs", image: "https://images.dog.ceo/breeds/schnauzer/n02097209_8.jpg", stock: 0 },
    { name: "Duke", description: "Ibizan Hound, 3 years. Elegant athlete with satellite ears and a big heart.", price: 39999, category: "Dogs", image: "https://images.dog.ceo/breeds/hound-ibizan/n02091244_5517.jpg", stock: 1 },
    { name: "Luna", description: "Domestic shorthair, 1 year. Calm, curious and loves window naps.", price: 9999, category: "Cats", image: "https://cdn2.thecatapi.com/images/MTkxNTA0MA.jpg", stock: 2 },
    { name: "Milo", description: "Tabby, 7 months. Chaotic zoomies at 3am, purrs like an engine.", price: 7999, category: "Cats", image: "https://cdn2.thecatapi.com/images/c1e.jpg", stock: 3 },
    { name: "Oreo", description: "Tuxedo cat, 2 years. Dressed for a gala, behaves like a gremlin.", price: 8999, category: "Cats", image: "https://cdn2.thecatapi.com/images/MTQ5NDY5Mw.jpg", stock: 1 },
    { name: "Simba", description: "Ginger, 1 year. Fearless king of the house, very affectionate.", price: 11999, category: "Cats", image: "https://cdn2.thecatapi.com/images/brt.jpg", stock: 2 },
    { name: "Nala", description: "Kitten, 4 months. Tiny paws, huge eyes, litter trained.", price: 12999, category: "Cats", image: "https://cdn2.thecatapi.com/images/bsc.jpg", stock: 4 },
    { name: "Cleo", description: "Long-haired, 3 years. Regal, quiet and expects to be served.", price: 14999, category: "Cats", image: "https://cdn2.thecatapi.com/images/b60.jpg", stock: 1 }
];

const seed = async () => {
    await mongoose.connect(process.env.MONGO_URL);

    // "npm run seed -- --reset" replaces the catalog; otherwise only an empty collection is seeded
    if (process.argv.includes("--reset")) {
        const { deletedCount } = await Product.deleteMany({});
        console.log(`Removed ${deletedCount} existing products`);
    }

    const existing = await Product.countDocuments();
    if (existing > 0) {
        console.log(`Products collection already has ${existing} products, skipping seed`);
    } else {
        await Product.insertMany(products);
        console.log(`Inserted ${products.length} products`);
    }

    await mongoose.disconnect();
};

seed().catch((err) => {
    console.log(err);
    process.exit(1);
});
