import React, { useState, useEffect } from 'react';

const StockMarket = () => {
  const [stocks, setStocks] = useState([
    { name: "TCS", price: 3500, prevPrice: 3500 },
    { name: "Reliance", price: 2700, prevPrice: 2700 },
    { name: "Infosys", price: 1600, prevPrice: 1600 },
    { name: "HDFC Bank", price: 1500, prevPrice: 1500 },
    { name: "ICICI Bank", price: 930, prevPrice: 930 },
    { name: "Tata Motors", price: 670, prevPrice: 670 },
    { name: "SBI", price: 600, prevPrice: 600 },
    { name: "HUL", price: 2500, prevPrice: 2500 },
    { name: "Bajaj Finance", price: 7200, prevPrice: 7200 },
    { name: "Adani Green", price: 1300, prevPrice: 1300 },
    { name: "Axis Bank", price: 1100, prevPrice: 1100 },
    { name: "Maruti Suzuki", price: 10500, prevPrice: 10500 },
    { name: "Sun Pharma", price: 1200, prevPrice: 1200 },
    { name: "Bharti Airtel", price: 900, prevPrice: 900 },
    { name: "Asian Paints", price: 3200, prevPrice: 3200 },
    { name: "Tech Mahindra", price: 1250, prevPrice: 1250 },
    { name: "NTPC", price: 250, prevPrice: 250 },
    { name: "Power Grid", price: 280, prevPrice: 280 },
    { name: "Titan Company", price: 3100, prevPrice: 3100 },
    { name: "Coal India", price: 320, prevPrice: 320 },
    { name: "Tata Steel", price: 120, prevPrice: 120 },
    { name: "UltraTech Cement", price: 8500, prevPrice: 8500 },
    { name: "Dr Reddy's", price: 5400, prevPrice: 5400 },
    { name: "Nestle India", price: 22800, prevPrice: 22800 },
    { name: "JSW Steel", price: 800, prevPrice: 800 }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [wallet, setWallet] = useState(() => Number(localStorage.getItem('wallet')) || 100000);
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [portfolio, setPortfolio] = useState(() => JSON.parse(localStorage.getItem('portfolio')) || []);
  const [watchlist, setWatchlist] = useState(() => JSON.parse(localStorage.getItem('watchlist')) || []);

  useEffect(() => {
    const timer = setInterval(updatePrices, 2000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('wallet', wallet);
    localStorage.setItem('portfolio', JSON.stringify(portfolio));
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [wallet, portfolio, watchlist]);

  const updatePrices = () => {
    setStocks(prevStocks => 
      prevStocks.map(stock => {
        const prevPrice = stock.price;
        let change = 0;
        
        if (stock.price < 1000) change = Math.random() * 10;
        else if (stock.price < 2000) change = Math.random() * 20;
        else if (stock.price < 5000) change = Math.random() * 50;
        else if (stock.price < 10000) change = Math.random() * 100;
        else change = Math.random() * 200;
        
        const direction = Math.random() < 0.5 ? -1 : 1;
        const newPrice = Math.max(stock.price + direction * change, 1);
        
        return {
          ...stock,
          prevPrice,
          price: newPrice
        };
      })
    );
  };

  const buyStock = (stock) => {
    const totalCost = stock.price * quantity;
    if (totalCost > wallet) {
      alert('Insufficient funds!');
      return;
    }

    setWallet(prev => prev - totalCost);
    setPortfolio(prev => {
      const existingPosition = prev.find(p => p.name === stock.name);
      if (existingPosition) {
        return prev.map(p => 
          p.name === stock.name 
            ? { ...p, quantity: p.quantity + quantity, avgPrice: (p.avgPrice * p.quantity + stock.price * quantity) / (p.quantity + quantity) }
            : p
        );
      }
      return [...prev, { name: stock.name, quantity, avgPrice: stock.price }];
    });
  };

  const sellStock = (stock) => {
    const position = portfolio.find(p => p.name === stock.name);
    if (!position || position.quantity < quantity) {
      alert('Insufficient shares!');
      return;
    }

    const saleValue = stock.price * quantity;
    setWallet(prev => prev + saleValue);
    setPortfolio(prev => {
      const updated = prev.map(p => 
        p.name === stock.name 
          ? { ...p, quantity: p.quantity - quantity }
          : p
      ).filter(p => p.quantity > 0);
      return updated;
    });
  };

  const toggleWatchlist = (stockName) => {
    setWatchlist(prev => 
      prev.includes(stockName)
        ? prev.filter(name => name !== stockName)
        : [...prev, stockName]
    );
  };

  const filteredStocks = stocks.filter(stock => 
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="w-full max-w-4xl mx-auto p-4">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Stock Market</span>
          <span className="text-lg">Wallet: ₹{wallet.toFixed(2)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          type="text"
          placeholder="Search stocks..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="mb-4"
        />
        
        <div className="space-y-2">
          {filteredStocks.map(stock => (
            <div 
              key={stock.name}
              className={`p-4 rounded-lg border ${
                selectedStock?.name === stock.name ? 'bg-gray-100' : 'bg-white'
              } hover:bg-gray-50 transition-colors`}
              onClick={() => setSelectedStock(stock)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <h3 className="font-medium">{stock.name}</h3>
                  {watchlist.includes(stock.name) && <Eye className="w-4 h-4 text-blue-500" />}
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`flex items-center ${
                    stock.price > stock.prevPrice ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stock.price > stock.prevPrice ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                    ₹{stock.price.toFixed(2)}
                  </span>
                  <div className="flex items-center space-x-2">
                    {selectedStock?.name === stock.name && (
                      <>
                        <Input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-20"
                          onClick={e => e.stopPropagation()}
                        />
                        <Button 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            buyStock(stock);
                          }}
                        >
                          Buy
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            sellStock(stock);
                          }}
                        >
                          Sell
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWatchlist(stock.name);
                          }}
                        >
                          {watchlist.includes(stock.name) ? 'Remove Watch' : 'Watch'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedStock?.name === stock.name && portfolio.find(p => p.name === stock.name) && (
                <div className="mt-2 text-sm text-gray-600">
                  Your position: {portfolio.find(p => p.name === stock.name).quantity} shares
                  @ avg. ₹{portfolio.find(p => p.name === stock.name).avgPrice.toFixed(2)}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<StockMarket />);

export default StockMarket;