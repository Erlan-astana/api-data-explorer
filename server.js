const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');

app.use(bodyParser.json());

const MOCK_DATA = require('./mockData');

app.post('/api/data', (req, res) => {
    let { search, filters, page, pageSize } = req.body;
    let data = JSON.parse(JSON.stringify(MOCK_DATA));

    const isDataField = key => key !== '_id';
    
    // Фильтрация
    if (filters && filters.length > 0) {
        data = data.filter(item => {
            let passesAllFilters = true;
    
            filters.forEach(filter => {
                if (filter.column === 'balance' && item[filter.column] !== undefined) {
                    const balanceNumber = parseFloat(item[filter.column].replace(/\$|,/g, '').replace(/\..*/, ''));
                    if (isNaN(balanceNumber) || balanceNumber < filter.value) {
                        passesAllFilters = false;
                    }
                } else if (filter.column === 'age' && item[filter.column] !== undefined) {
                    const ageValue = item[filter.column];
                    if (isNaN(ageValue) || ageValue < filter.value) {
                        passesAllFilters = false;
                    }
                } else if (isDataField(filter.column) && item[filter.column] !== filter.value) {
                    passesAllFilters = false;
                }
            });
    
            return passesAllFilters;
        });
    }

    // Поиск
    if (search) {
        const searchLowerCase = search.toLowerCase();
        data = data.filter(item =>
            Object.entries(item).some(([key, val]) =>
                isDataField(key) && typeof val === 'string' && val.toLowerCase().includes(searchLowerCase)
            )
        );
    }

    // Пагинация
    const totalItems = data.length;
    if (page || pageSize) {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        data = data.slice(start, end);
    }

    res.json({ data, totalItems });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
