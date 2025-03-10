import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';

const app = express();
const port = 3000;
const dataFile = path.join(__dirname, '../data/products.json');

app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

interface Product {
    id: number;
    name: string;
    price: number;
    imageBase64?: string;
}

async function readProducts(): Promise<Product[]> {
    try {
        const data = await fs.readFile(dataFile, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function saveProducts(products: Product[]): Promise<void> {
    await fs.writeFile(dataFile, JSON.stringify(products, null, 2), 'utf-8');
}

app.get('/products', async (req: Request, res: Response) => {
    const products = await readProducts();
    res.json(products);
});

app.post('/products', async (req: Request, res: Response) => {
    const { name, price, imageBase64 } = req.body;
    if (!name || !price) return res.status(400).json({ error: 'Nama dan harga diperlukan.' });
    
    const products = await readProducts();
    const newProduct: Product = {
        id: products.length ? products[products.length - 1].id + 1 : 1,
        name,
        price: parseFloat(price),
        imageBase64: imageBase64 || undefined
    };
    products.push(newProduct);
    await saveProducts(products);
    res.status(201).json(newProduct);
});

app.put('/products/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { name, price, imageBase64 } = req.body;
    const products = await readProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ error: 'Produk tidak ditemukan.' });

    if (name) products[index].name = name;
    if (price) products[index].price = parseFloat(price);
    if (imageBase64 !== undefined) products[index].imageBase64 = imageBase64;
    await saveProducts(products);
    res.json(products[index]);
});

app.delete('/products/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const products = await readProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ error: 'Produk tidak ditemukan.' });

    products.splice(index, 1);
    await saveProducts(products);
    res.status(204).send();
});

app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(port, async () => {
    try {
        await fs.mkdir(path.join(__dirname, '../data'), { recursive: true });
        if (!(await fs.access(dataFile).then(() => true).catch(() => false))) {
            await fs.writeFile(dataFile, '[]', 'utf-8');
        }
        console.log(`Server running at http://localhost:${port}`);
    } catch (error) {
        console.error('Gagal memulai server:', error);
    }
});