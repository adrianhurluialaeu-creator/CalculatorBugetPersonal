(function () {
  var root = document.querySelector('[data-cashport-budget-root]');

  if (!root) {
    return;
  }

  var inputs = Array.prototype.slice.call(root.querySelectorAll('.cashport-budget-input'));
  var resultNodes = Array.prototype.slice.call(root.querySelectorAll('[data-result]'));
  var segmentContainer = root.querySelector('[data-chart="segments"]');
  var legendContainer = root.querySelector('[data-chart="legend"]');
  var incomeBar = root.querySelector('[data-chart="incomeBar"]');
  var expenseBar = root.querySelector('[data-chart="expenseBar"]');
  var donutRadius = 42;
  var donutCenter = 60;

  var numberFormatter = new Intl.NumberFormat('ro-RO', {
    maximumFractionDigits: 0
  });

  var percentFormatter = new Intl.NumberFormat('ro-RO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  });

  var categoryLabels = {
    housing: 'Locuință',
    transport: 'Transport',
    food: 'Alimentație',
    health: 'Sănătate',
    education: 'Educație',
    clothing: 'Îmbrăcăminte',
    entertainment: 'Divertisment',
    subscriptions: 'Abonamente',
    debt: 'Credite',
    savings: 'Economii',
    investments: 'Investiții',
    other: 'Alte cheltuieli'
  };

  var palette = ['#29e16d', '#57c7ff', '#8b5cf6', '#ffbf47', '#fb7185', '#2dd4bf', '#f97316', '#60a5fa', '#c084fc', '#14b8a6', '#facc15', '#94a3b8'];

  function parseLocalizedNumber(value) {
    return typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  }

  function sanitizeValue(value) {
    var numericValue = parseLocalizedNumber(value);

    if (!Number.isFinite(numericValue) || numericValue < 0) {
      return 0;
    }

    return numericValue;
  }

  function formatCurrency(value) {
    return numberFormatter.format(value || 0) + ' lei';
  }

  function formatPercent(value) {
    return percentFormatter.format(value || 0) + '%';
  }

  function getPaletteColor(index) {
    return palette.length ? palette[index % palette.length] : '#29e16d';
  }

  function setResult(name, value, attributes) {
    resultNodes.forEach(function (node) {
      if (node.getAttribute('data-result') !== name) {
        return;
      }

      node.textContent = value;

      if (attributes) {
        Object.keys(attributes).forEach(function (attributeName) {
          if (attributes[attributeName] === null) {
            node.removeAttribute(attributeName);
          } else {
            node.setAttribute(attributeName, attributes[attributeName]);
          }
        });
      }
    });
  }

  function percentage(part, total) {
    if (!total) {
      return 0;
    }

    return (part / total) * 100;
  }

  function buildCategoryTotals() {
    return inputs.reduce(function (accumulator, input) {
      var type = input.getAttribute('data-type');
      var category = input.getAttribute('data-category');
      var value = sanitizeValue(input.value);

      if (type === 'expense') {
        accumulator.expenses[category] = (accumulator.expenses[category] || 0) + value;
        accumulator.expenseTotal += value;
      } else if (type === 'income') {
        accumulator.incomeTotal += value;
      }

      return accumulator;
    }, {
      expenses: {},
      incomeTotal: 0,
      expenseTotal: 0
    });
  }

  function getStatus(metrics) {
    if (metrics.balance < 0 || metrics.debtRate > 45) {
      return { label: 'Critic', key: 'critic' };
    }

    if (metrics.housingRate > 40 || metrics.savingsRate < 10 || metrics.investmentRate < 10) {
      return { label: 'Atenție', key: 'atentie' };
    }

    if (metrics.savingsRate >= 20 && metrics.investmentRate >= 10 && metrics.debtRate <= 30 && metrics.balance >= 0) {
      return { label: 'Excelent', key: 'excelent' };
    }

    return { label: 'Bun', key: 'bun' };
  }

  function buildRecommendations(metrics) {
    var items = [];

    if (!metrics.incomeTotal && !metrics.expenseTotal) {
      items.push('Introdu valorile lunare pentru a genera analiza completă a bugetului.');
      return items;
    }

    if (metrics.housingRate > 35) {
      items.push('Cheltuielile pentru locuință sunt prea ridicate comparativ cu venitul lunar.');
    }

    if (metrics.debtRate > 35) {
      items.push('Gradul de îndatorare depășește 35% și merită redus pentru mai multă flexibilitate financiară.');
    }

    if (metrics.savingsRate < 10) {
      items.push('Economiile sunt sub 10% din venit și ar trebui consolidate treptat.');
    }

    if (metrics.investmentRate < 10) {
      items.push('Investițiile sunt sub 10% din venit și pot fi crescute după stabilizarea fondului de siguranță.');
    }

    if (metrics.balance < 0) {
      items.push('Soldul lunar este negativ, deci cheltuielile depășesc venitul disponibil.');
    }

    if (!items.length) {
      items.push('Bugetul este bine echilibrat și susține o disciplină financiară sănătoasă.');
    }

    return items;
  }

  function updateRecommendations(items) {
    var recommendationContainer = root.querySelector('[data-result="recommendations"]');
    recommendationContainer.innerHTML = '';

    items.forEach(function (item) {
      var listItem = document.createElement('li');
      listItem.className = 'cashport-budget-recommendation';
      listItem.textContent = item;
      recommendationContainer.appendChild(listItem);
    });
  }

  function updateBars(incomeTotal, expenseTotal) {
    var maxValue = Math.max(incomeTotal, expenseTotal, 1);
    incomeBar.style.width = percentage(incomeTotal, maxValue) + '%';
    expenseBar.style.width = percentage(expenseTotal, maxValue) + '%';
  }

  function updateDonut(expenses, expenseTotal) {
    segmentContainer.innerHTML = '';
    legendContainer.innerHTML = '';

    var circumference = 2 * Math.PI * donutRadius;
    var offset = 0;
    var entries = Object.keys(categoryLabels)
      .map(function (category) {
        return {
          key: category,
          label: categoryLabels[category],
          value: expenses[category] || 0
        };
      })
      .filter(function (entry) {
        return entry.value > 0;
      });

    if (!entries.length) {
      var emptyItem = document.createElement('li');
      emptyItem.className = 'cashport-budget-legend-item';
      emptyItem.textContent = 'Nu există cheltuieli introduse încă.';
      legendContainer.appendChild(emptyItem);
      setResult('largestCategory', 'Nicio categorie');
      return;
    }

    var largestEntry = entries.reduce(function (largest, entry) {
      return entry.value > largest.value ? entry : largest;
    }, entries[0]);

    entries.forEach(function (entry, index) {
      var share = entry.value / expenseTotal;
      var dashLength = share * circumference;
      var segmentColor = getPaletteColor(index);
      var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('class', 'cashport-budget-donut-segment');
      circle.setAttribute('cx', String(donutCenter));
      circle.setAttribute('cy', String(donutCenter));
      circle.setAttribute('r', String(donutRadius));
      circle.setAttribute('stroke', segmentColor);
      circle.setAttribute('stroke-dasharray', dashLength + ' ' + (circumference - dashLength));
      circle.setAttribute('stroke-dashoffset', String(-offset));
      segmentContainer.appendChild(circle);
      offset += dashLength;

      var item = document.createElement('li');
      var label = document.createElement('span');
      var dot = document.createElement('span');
      var percentageValue = document.createElement('strong');

      item.className = 'cashport-budget-legend-item';
      label.className = 'cashport-budget-legend-label';
      dot.className = 'cashport-budget-legend-dot';
      dot.style.background = segmentColor;
      label.appendChild(dot);
      label.appendChild(document.createTextNode(entry.label));
      percentageValue.textContent = formatPercent(percentage(entry.value, expenseTotal));
      item.appendChild(label);
      item.appendChild(percentageValue);
      legendContainer.appendChild(item);
    });

    setResult('largestCategory', largestEntry.label + ' · ' + formatPercent(percentage(largestEntry.value, expenseTotal)));
  }

  function updateCalculator() {
    var totals = buildCategoryTotals();
    var balance = totals.incomeTotal - totals.expenseTotal;
    var metrics = {
      incomeTotal: totals.incomeTotal,
      expenseTotal: totals.expenseTotal,
      balance: balance,
      savingsRate: percentage(totals.expenses.savings || 0, totals.incomeTotal),
      investmentRate: percentage(totals.expenses.investments || 0, totals.incomeTotal),
      debtRate: percentage(totals.expenses.debt || 0, totals.incomeTotal),
      housingRate: percentage(totals.expenses.housing || 0, totals.incomeTotal)
    };

    var status = getStatus(metrics);
    var tone = balance < 0 ? 'negative' : (balance > 0 ? 'positive' : '');

    setResult('incomeTotal', formatCurrency(metrics.incomeTotal));
    setResult('incomeTotalCompact', formatCurrency(metrics.incomeTotal));
    setResult('expenseTotal', formatCurrency(metrics.expenseTotal));
    setResult('expenseTotalCompact', formatCurrency(metrics.expenseTotal));
    setResult('expenseTotalBar', formatCurrency(metrics.expenseTotal));
    setResult('balance', formatCurrency(balance), { 'data-tone': tone });
    setResult('balanceCompact', formatCurrency(balance));
    setResult('savingsRate', formatPercent(metrics.savingsRate));
    setResult('investmentRate', formatPercent(metrics.investmentRate));
    setResult('debtRate', formatPercent(metrics.debtRate));
    setResult('housingRate', formatPercent(metrics.housingRate));
    setResult('status', status.label, { 'data-status': status.key });

    updateDonut(totals.expenses, totals.expenseTotal);
    updateBars(metrics.incomeTotal, metrics.expenseTotal);
    updateRecommendations(buildRecommendations(metrics));
  }

  inputs.forEach(function (input) {
    input.addEventListener('input', function () {
      var parsedValue = parseLocalizedNumber(input.value);
      var sanitizedValue = sanitizeValue(parsedValue);

      if (input.value && (!Number.isFinite(parsedValue) || parsedValue < 0)) {
        input.value = String(sanitizedValue);
      }

      updateCalculator();
    });

    input.addEventListener('blur', function () {
      if (sanitizeValue(input.value) === 0) {
        input.value = '';
      }
    });
  });

  updateCalculator();
})();
