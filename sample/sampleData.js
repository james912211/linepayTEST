const orders = {
  1: {
    amount: 1000,
    currency: "TWD",
    packages: [
      {
        id: "products_1",
        amount: 1000,
        products: [
          {
            name: "測試產品1",
            quantity: 1,
            price: 1000,
          },
        ],
      },
    ],
  },
  2: {
    amount: 2000,
    currency: "TWD",
    packages: [
      {
        id: "products_1",
        amount: 2000,
        products: [
          {
            name: "測試產品1",
            quantity: 2,
            price: 1000,
          },
        ],
      },
    ],
  },
  3: {
    amount: 200,
    currency: "TWD",
    packages: [
      {
        id: "products_2",
        amount: 200,
        products: [
          {
            name: "測試產品2",
            quantity: 2,
            price: 100,
          },
        ],
      },
    ],
  },
};

module.exports = orders;
