# Product Manager

Aplikasi CRUD sederhana untuk mengelola produk menggunakan TypeScript, Express, dan penyimpanan JSON. Pengguna dapat menambah, mengedit, serta menghapus produk dengan gambar opsional (Base64).

## Fitur
- Tambah produk (nama, harga, gambar Base64).
- Lihat daftar produk beserta gambar.
- Edit dan hapus produk.
- Desain UI modern dan responsif.
- Data disimpan di `data/products.json`.

## Teknologi
- **Backend**: TypeScript, Express.js
- **Frontend**: HTML, CSS, JavaScript
- **Penyimpanan**: JSON lokal
- **Dependensi**: `express`, `cors`, `typescript`, `ts-node`

## Prasyarat
- Node.js (v14+)
- npm (v6+)

## Cara Menjalankan
   ```bash
  npm install
  npm start
  ```

Tambahkan Ke Public/index.html : 
  ```bash
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Manager</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #e0eafc, #cfdef3);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            padding: 30px;
        }
        h1 {
            text-align: center;
            color: #2d3748;
            margin-bottom: 20px;
            font-size: 2rem;
            font-weight: 600;
        }
        .form {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-bottom: 20px;
            background: #f7fafc;
            padding: 20px;
            border-radius: 8px;
            box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        .form input {
            flex: 1;
            min-width: 200px;
            padding: 12px;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            font-size: 1rem;
            transition: border-color 0.2s;
        }
        .form input:focus {
            border-color: #4299e1;
            outline: none;
        }
        .form button {
            padding: 12px 20px;
            background: #4299e1;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.3s;
        }
        .form button:hover {
            background: #3182ce;
        }
        #error {
            text-align: center;
            color: #e53e3e;
            margin: 10px 0;
            font-size: 0.9rem;
        }
        .product-list {
            display: grid;
            gap: 15px;
        }
        .product-item {
            display: flex;
            align-items: center;
            padding: 15px;
            background: #edf2f7;
            border-radius: 8px;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .product-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        .product-item img {
            width: 60px;
            height: 60px;
            object-fit: cover;
            border-radius: 6px;
            margin-right: 15px;
        }
        .product-item span {
            flex-grow: 1;
            color: #2d3748;
            font-size: 1.1rem;
        }
        .product-item button {
            padding: 8px 15px;
            border: none;
            border-radius: 6px;
            font-size: 0.9rem;
            cursor: pointer;
            transition: background 0.3s;
        }
        .edit-btn {
            background: #ecc94b;
            color: #fff;
            margin-right: 10px;
        }
        .edit-btn:hover {
            background: #d69e2e;
        }
        .product-item button {
            background: #e53e3e;
            color: #fff;
        }
        .product-item button:hover {
            background: #c53030;
        }
        @media (max-width: 600px) {
            .form {
                flex-direction: column;
            }
            .product-item {
                flex-direction: column;
                text-align: center;
            }
            .product-item img {
                margin: 0 0 10px 0;
            }
            .product-item button {
                margin: 5px 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>CRUD Product</h1>
        <div class="form">
            <input type="text" id="name" placeholder="Nama Produk">
            <input type="number" id="price" placeholder="Harga">
            <input type="file" id="image" accept="image/*">
            <button onclick="addProduct()">Tambah Produk</button>
        </div>
        <div id="error"></div>
        <div id="product-list" class="product-list"></div>
    </div>

    <script>
        async function fetchProducts() {
            const response = await fetch('/products');
            return await response.json();
        }

        async function loadProducts() {
            const products = await fetchProducts();
            const productList = document.getElementById('product-list');
            productList.innerHTML = '';
            products.forEach(product => {
                const div = document.createElement('div');
                div.className = 'product-item';
                div.innerHTML = `
                    ${product.imageBase64 ? `<img src="${product.imageBase64}" alt="${product.name}">` : ''}
                    <span>${product.name} - $${product.price}</span>
                    <div>
                        <button class="edit-btn" onclick="editProduct(${product.id})">Edit</button>
                        <button onclick="deleteProduct(${product.id})">Hapus</button>
                    </div>
                `;
                productList.appendChild(div);
            });
        }

        async function addProduct() {
            const name = document.getElementById('name').value;
            const price = parseFloat(document.getElementById('price').value);
            const image = document.getElementById('image').files[0];
            if (!name || isNaN(price)) {
                document.getElementById('error').textContent = 'Nama dan harga diperlukan.';
                return;
            }

            let imageBase64 = '';
            if (image) {
                imageBase64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(image);
                });
            }

            const productData = { name, price, imageBase64 };

            try {
                const response = await fetch('/products', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });
                if (!response.ok) throw new Error('Gagal menambah produk');
                document.getElementById('name').value = '';
                document.getElementById('price').value = '';
                document.getElementById('image').value = '';
                document.getElementById('error').textContent = '';
                loadProducts();
            } catch (error) {
                document.getElementById('error').textContent = error.message;
            }
        }

        async function editProduct(id) {
            const name = prompt('Masukkan nama baru:', '');
            const price = parseFloat(prompt('Masukkan harga baru:', ''));
            const image = document.getElementById('image').files[0];
            if (!name && isNaN(price) && !image) return;

            let imageBase64 = '';
            if (image) {
                imageBase64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(image);
                });
            }

            const productData = {};
            if (name) productData.name = name;
            if (!isNaN(price)) productData.price = price;
            if (imageBase64) productData.imageBase64 = imageBase64;

            try {
                const response = await fetch(`/products/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });
                if (!response.ok) throw new Error('Gagal mengedit produk');
                document.getElementById('image').value = '';
                loadProducts();
            } catch (error) {
                document.getElementById('error').textContent = error.message;
            }
        }

        async function deleteProduct(id) {
            if (confirm('Yakin ingin menghapus produk ini?')) {
                try {
                    const response = await fetch(`/products/${id}`, { method: 'DELETE' });
                    if (!response.ok) throw new Error('Gagal menghapus produk');
                    loadProducts();
                } catch (error) {
                    document.getElementById('error').textContent = error.message;
                }
            }
        }

        window.onload = loadProducts;
    </script>
</body>
</html>
  ```


# Salam Interaksi Bun...
