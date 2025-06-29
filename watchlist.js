// Initialize wallet balance with better error handling
let walletBalance = (() => {
    try {
        const storedBalance = localStorage.getItem("walletBalance");
        return storedBalance !== null ? parseFloat(storedBalance) : 100000;
    } catch (e) {
        console.error("Error initializing wallet balance:", e);
        return 100000;
    }
})();

// Utility function to safely get JSON from localStorage
const getLocalStorageItem = (key, defaultValue = []) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
        console.error(`Error parsing ${key} from localStorage:`, e);
        return defaultValue;
    }
};

// Utility function to safely set localStorage
const setLocalStorageItem = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error(`Error setting ${key} in localStorage:`, e);
    }
};

function loadWatchlist() {
    const watchlist = getLocalStorageItem("watchlist");
    const stocks = getLocalStorageItem("stocks");
    const watchlistContainer = document.getElementById("watchlistContainer");
    
    if (!watchlistContainer) {
        console.error("Watchlist container not found");
        return;
    }

    watchlistContainer.innerHTML = "";

    if (!watchlist.length) {
        watchlistContainer.innerHTML = "<p>No stocks in watchlist</p>";
        return;
    }

    watchlist.forEach(stockName => {
        const stock = stocks.find(s => s?.name === stockName);
        if (!stock) return;

        const stockItem = createStockElement(stock);
        watchlistContainer.appendChild(stockItem);
    });
}

function createStockElement(stock) {
    const existingElement = document.getElementById(`stock-${stock.name}`);
    const selectedQuantity = existingElement?.querySelector(`#quantity-${stock.name}`)?.value || 1;

    const stockItem = document.createElement("div");
    stockItem.classList.add("stock-item");
    stockItem.id = `stock-${stock.name}`;
    stockItem.innerHTML = `
        <h3>${stock.name}</h3>
        <p>Price: ₹<span class="stock-price">${stock.price.toFixed(2)}</span></p>
        <input type="number" id="quantity-${stock.name}" min="1" value="${selectedQuantity}" step="1">
        <button class="buy-btn">Buy</button>
        <button class="sell-btn">Sell</button>
        <button class="remove-btn">Remove</button>
    `;

    // Add event listeners
    stockItem.querySelector(".buy-btn").addEventListener("click", () => buyStock(stock.name));
    stockItem.querySelector(".sell-btn").addEventListener("click", () => sellStock(stock.name));
    stockItem.querySelector(".remove-btn").addEventListener("click", () => removeFromWatchlist(stock.name));

    return stockItem;
}

function updateStockPrices() {
    const stocks = getLocalStorageItem("stocks");
    
    stocks.forEach((stock, index) => {
        if (!stock?.price) return;

        const price = stock.price;
        let change = 0;

        switch (true) {
            case price >= 100 && price < 500:
                change = Math.random() * (2 - 1) + 1;
                break;
            case price >= 500 && price < 1000:
                change = Math.random() * (10 - 5) + 5;
                break;
            case price >= 1000 && price < 2000:
                change = Math.random() * (20 - 10) + 10;
                break;
            case price >= 2000:
                change = Math.random() * (50 - 20) + 20;
                break;
        }

        stock.price = Math.max(0, stock.price + (Math.random() < 0.5 ? -change : change));
        stocks[index] = stock;
    });

    setLocalStorageItem("stocks", stocks);
    updateStockDisplay(stocks);
}

function updateStockDisplay(stocks) {
    document.querySelectorAll(".stock-item").forEach(item => {
        const stockName = item.id.replace("stock-", "");
        const stock = stocks.find(s => s?.name === stockName);
        if (stock) {
            const priceElement = item.querySelector(".stock-price");
            if (priceElement) {
                priceElement.textContent = stock.price.toFixed(2);
            }
        }
    });
}

function buyStock(name) {
    const stocks = getLocalStorageItem("stocks");
    const stock = stocks.find(s => s?.name === name);
    if (!stock) return;

    const quantityInput = document.getElementById(`quantity-${name}`);
    const quantity = parseInt(quantityInput?.value) || 0;

    if (quantity <= 0) {
        alert("Please enter a valid quantity");
        return;
    }

    const totalCost = stock.price * quantity;
    if (walletBalance < totalCost) {
        alert("Insufficient balance!");
        return;
    }

    walletBalance -= totalCost;
    setLocalStorageItem("walletBalance", walletBalance);

    const portfolio = getLocalStorageItem("portfolio");
    const existingStock = portfolio.find(s => s?.name === name);

    if (existingStock) {
        existingStock.quantity += quantity;
        existingStock.buyPrice = ((existingStock.buyPrice * existingStock.quantity) + (stock.price * quantity)) / (existingStock.quantity + quantity);
    } else {
        portfolio.push({ name, buyPrice: stock.price, quantity });
    }

    setLocalStorageItem("portfolio", portfolio);
    alert(`${quantity} shares of ${name} bought successfully!`);
    updateWalletDisplay();
}

function sellStock(name) {
    const portfolio = getLocalStorageItem("portfolio");
    const stock = portfolio.find(s => s?.name === name);

    if (!stock) {
        alert("You do not own this stock!");
        return;
    }

    const quantity = parseInt(document.getElementById(`quantity-${name}`)?.value) || 0;
    if (quantity <= 0 || quantity > stock.quantity) {
        alert("Invalid quantity to sell");
        return;
    }

    const stocks = getLocalStorageItem("stocks");
    const marketStock = stocks.find(s => s?.name === name);
    if (!marketStock) return;

    const totalSell = marketStock.price * quantity;
    walletBalance += totalSell;
    setLocalStorageItem("walletBalance", walletBalance);

    stock.quantity -= quantity;
    if (stock.quantity === 0) {
        portfolio.splice(portfolio.findIndex(s => s.name === name), 1);
    }

    setLocalStorageItem("portfolio", portfolio);
    alert(`${quantity} shares of ${name} sold successfully!`);
    updateWalletDisplay();
}

function removeFromWatchlist(name) {
    const watchlist = getLocalStorageItem("watchlist");
    const updatedWatchlist = watchlist.filter(stock => stock !== name);
    setLocalStorageItem("watchlist", updatedWatchlist);
    loadWatchlist();
}

function updateWalletDisplay() {
    const walletElement = document.getElementById("walletBalance");
    if (walletElement) {
        walletElement.textContent = `Wallet Balance: ₹${walletBalance.toFixed(2)}`;
    }
}

// Search functionality with debouncing
let searchTimeout;
document.getElementById("searchWatchlist")?.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const query = e.target.value.toLowerCase();
        const watchlist = getLocalStorageItem("watchlist");
        const stocks = getLocalStorageItem("stocks");
        const filteredStocks = watchlist.filter(stockName => 
            stockName.toLowerCase().includes(query)
        );

        const watchlistContainer = document.getElementById("watchlistContainer");
        if (watchlistContainer) {
            watchlistContainer.innerHTML = "";
            filteredStocks.forEach(stockName => {
                const stock = stocks.find(s => s?.name === stockName);
                if (stock) {
                    watchlistContainer.appendChild(createStockElement(stock));
                }
            });
        }
    }, 300); // Debounce delay of 300ms
});

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    loadWatchlist();
    updateWalletDisplay();
    setInterval(updateStockPrices, 1000);
});