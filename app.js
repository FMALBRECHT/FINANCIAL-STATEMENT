const STORAGE_KEY = 'cashflow-life-v1';

const state = loadState();

const els = {
  profileName: document.getElementById('profileName'),
  profileProfession: document.getElementById('profileProfession'),
  profileDream: document.getElementById('profileDream'),
  incomeName: document.getElementById('incomeName'),
  incomeAmount: document.getElementById('incomeAmount'),
  incomeType: document.getElementById('incomeType'),
  expenseName: document.getElementById('expenseName'),
  expenseAmount: document.getElementById('expenseAmount'),
  assetName: document.getElementById('assetName'),
  assetAmount: document.getElementById('assetAmount'),
  assetCategory: document.getElementById('assetCategory'),
  liabilityName: document.getElementById('liabilityName'),
  liabilityAmount: document.getElementById('liabilityAmount'),
  dealName: document.getElementById('dealName'),
  dealCost: document.getElementById('dealCost'),
  dealCashflow: document.getElementById('dealCashflow'),
  dealType: document.getElementById('dealType'),
  incomeList: document.getElementById('incomeList'),
  expenseList: document.getElementById('expenseList'),
  assetList: document.getElementById('assetList'),
  liabilityList: document.getElementById('liabilityList'),
  dealList: document.getElementById('dealList'),
  activeIncomeTotal: document.getElementById('activeIncomeTotal'),
  passiveIncomeTotal: document.getElementById('passiveIncomeTotal'),
  expensesTotal: document.getElementById('expensesTotal'),
  cashflowTotal: document.getElementById('cashflowTotal'),
  assetsTotal: document.getElementById('assetsTotal'),
  liabilitiesTotal: document.getElementById('liabilitiesTotal'),
  netWorthTotal: document.getElementById('netWorthTotal'),
  freedomPercent: document.getElementById('freedomPercent'),
  freedomBadge: document.getElementById('freedomBadge'),
  gapText: document.getElementById('gapText'),
  exportBtn: document.getElementById('exportBtn'),
  importFile: document.getElementById('importFile'),
  resetDataBtn: document.getElementById('resetDataBtn'),
  addIncomeBtn: document.getElementById('addIncomeBtn'),
  addExpenseBtn: document.getElementById('addExpenseBtn'),
  addAssetBtn: document.getElementById('addAssetBtn'),
  addLiabilityBtn: document.getElementById('addLiabilityBtn'),
  addDealBtn: document.getElementById('addDealBtn'),
  convertDealBtn: document.getElementById('convertDealBtn'),
  template: document.getElementById('itemTemplate')
};

bindEvents();
render();

function defaultState() {
  return {
    profile: { name: '', profession: '', dream: '' },
    income: [],
    expenses: [],
    assets: [],
    liabilities: [],
    deals: [],
    selectedDealId: null
  };
}

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultState();
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function currency(num) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(num || 0));
}

function sum(items) {
  return items.reduce((acc, item) => acc + Number(item.amount || item.value || item.cashflow || 0), 0);
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function bindEvents() {
  ['profileName', 'profileProfession', 'profileDream'].forEach(key => {
    els[key].addEventListener('input', () => {
      state.profile.name = els.profileName.value;
      state.profile.profession = els.profileProfession.value;
      state.profile.dream = els.profileDream.value;
      saveState();
    });
  });

  els.addIncomeBtn.addEventListener('click', () => {
    const name = els.incomeName.value.trim();
    const amount = Number(els.incomeAmount.value);
    if (!name || !amount) return;
    state.income.push({ id: uid(), name, amount, type: els.incomeType.value });
    els.incomeName.value = '';
    els.incomeAmount.value = '';
    commit();
  });

  els.addExpenseBtn.addEventListener('click', () => {
    const name = els.expenseName.value.trim();
    const amount = Number(els.expenseAmount.value);
    if (!name || !amount) return;
    state.expenses.push({ id: uid(), name, amount });
    els.expenseName.value = '';
    els.expenseAmount.value = '';
    commit();
  });

  els.addAssetBtn.addEventListener('click', () => {
    const name = els.assetName.value.trim();
    const value = Number(els.assetAmount.value);
    if (!name || !value) return;
    state.assets.push({ id: uid(), name, value, category: els.assetCategory.value });
    els.assetName.value = '';
    els.assetAmount.value = '';
    commit();
  });

  els.addLiabilityBtn.addEventListener('click', () => {
    const name = els.liabilityName.value.trim();
    const amount = Number(els.liabilityAmount.value);
    if (!name || !amount) return;
    state.liabilities.push({ id: uid(), name, amount });
    els.liabilityName.value = '';
    els.liabilityAmount.value = '';
    commit();
  });

  els.addDealBtn.addEventListener('click', () => {
    const name = els.dealName.value.trim();
    const cost = Number(els.dealCost.value);
    const cashflow = Number(els.dealCashflow.value);
    if (!name) return;
    state.deals.push({ id: uid(), name, cost: cost || 0, cashflow: cashflow || 0, type: els.dealType.value });
    els.dealName.value = '';
    els.dealCost.value = '';
    els.dealCashflow.value = '';
    commit();
  });

  els.convertDealBtn.addEventListener('click', () => {
    const deal = state.deals.find(d => d.id === state.selectedDealId);
    if (!deal) return alert('Select a deal first.');
    state.assets.push({ id: uid(), name: deal.name, value: deal.cost, category: deal.type === 'real_estate' ? 'real_estate' : deal.type === 'business' ? 'business' : 'other' });
    if (deal.cashflow > 0) {
      state.income.push({ id: uid(), name: `${deal.name} Cash Flow`, amount: deal.cashflow, type: 'passive' });
    }
    state.deals = state.deals.filter(d => d.id !== deal.id);
    state.selectedDealId = null;
    commit();
  });

  els.exportBtn.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'cashflow-life-data.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  els.importFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      const incoming = JSON.parse(text);
      Object.assign(state, defaultState(), incoming);
      commit();
    } catch {
      alert('Invalid JSON file.');
    }
    e.target.value = '';
  });

  els.resetDataBtn.addEventListener('click', () => {
    if (!confirm('Reset all app data?')) return;
    Object.assign(state, defaultState());
    commit();
  });
}

function commit() {
  saveState();
  render();
}

function render() {
  els.profileName.value = state.profile.name || '';
  els.profileProfession.value = state.profile.profession || '';
  els.profileDream.value = state.profile.dream || '';

  const activeIncome = state.income.filter(x => x.type === 'active').reduce((a, b) => a + Number(b.amount), 0);
  const passiveIncome = state.income.filter(x => x.type === 'passive').reduce((a, b) => a + Number(b.amount), 0);
  const expenses = sum(state.expenses);
  const assets = state.assets.reduce((a, b) => a + Number(b.value), 0);
  const liabilities = sum(state.liabilities);
  const cashflow = activeIncome + passiveIncome - expenses;
  const netWorth = assets - liabilities;
  const freedomGap = Math.max(expenses - passiveIncome, 0);
  const freedomRatio = expenses > 0 ? Math.min((passiveIncome / expenses) * 100, 999) : 0;
  const free = passiveIncome >= expenses && expenses > 0;

  els.activeIncomeTotal.textContent = currency(activeIncome);
  els.passiveIncomeTotal.textContent = currency(passiveIncome);
  els.expensesTotal.textContent = currency(expenses);
  els.cashflowTotal.textContent = currency(cashflow);
  els.assetsTotal.textContent = currency(assets);
  els.liabilitiesTotal.textContent = currency(liabilities);
  els.netWorthTotal.textContent = currency(netWorth);
  els.freedomPercent.textContent = `${Math.round(freedomRatio)}%`;
  els.gapText.textContent = free ? 'You are financially free.' : `Freedom gap: ${currency(freedomGap)}`;
  els.freedomBadge.textContent = free ? 'Financially Free' : 'In Rat Race';
  els.freedomBadge.className = `badge ${free ? 'free' : 'locked'}`;

  renderList(els.incomeList, state.income, item => `${capitalize(item.type)} income`, item => currency(item.amount), id => {
    state.income = state.income.filter(x => x.id !== id);
    commit();
  });
  renderList(els.expenseList, state.expenses, item => 'Monthly expense', item => currency(item.amount), id => {
    state.expenses = state.expenses.filter(x => x.id !== id);
    commit();
  });
  renderList(els.assetList, state.assets, item => capitalize(item.category.replace('_', ' ')), item => currency(item.value), id => {
    state.assets = state.assets.filter(x => x.id !== id);
    commit();
  });
  renderList(els.liabilityList, state.liabilities, item => 'Liability', item => currency(item.amount), id => {
    state.liabilities = state.liabilities.filter(x => x.id !== id);
    commit();
  });
  renderDeals();
  renderCharts(activeIncome, passiveIncome, expenses, assets, liabilities, freedomRatio, freedomGap);
}

function renderList(container, items, metaFn, amountFn, onRemove) {
  container.innerHTML = '';
  if (!items.length) {
    container.innerHTML = '<p class="muted">Nothing here yet.</p>';
    return;
  }
  items.forEach(item => {
    const node = els.template.content.firstElementChild.cloneNode(true);
    node.querySelector('.item-title').textContent = item.name;
    node.querySelector('.item-meta').textContent = metaFn(item);
    node.querySelector('.item-amount').textContent = amountFn(item);
    node.querySelector('.remove-btn').addEventListener('click', () => onRemove(item.id));
    container.appendChild(node);
  });
}

function renderDeals() {
  els.dealList.innerHTML = '';
  if (!state.deals.length) {
    els.dealList.innerHTML = '<p class="muted">No deals yet. Add your real-life opportunities here.</p>';
    return;
  }
  state.deals.forEach(item => {
    const node = els.template.content.firstElementChild.cloneNode(true);
    node.querySelector('.item-title').textContent = item.name;
    const roi = item.cost > 0 ? ((item.cashflow * 12 / item.cost) * 100).toFixed(1) : '—';
    node.querySelector('.item-meta').textContent = `${capitalize(item.type.replace('_', ' '))} · Monthly cash flow ${currency(item.cashflow)} · Annual ROI ${roi}%`;
    node.querySelector('.item-amount').textContent = `Cost ${currency(item.cost)}`;
    if (state.selectedDealId === item.id) node.style.outline = '2px solid rgba(255,255,255,.4)';
    node.addEventListener('click', () => {
      state.selectedDealId = item.id;
      saveState();
      render();
    });
    node.querySelector('.remove-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      state.deals = state.deals.filter(x => x.id !== item.id);
      if (state.selectedDealId === item.id) state.selectedDealId = null;
      commit();
    });
    els.dealList.appendChild(node);
  });
}

function renderCharts(activeIncome, passiveIncome, expenses, assets, liabilities, freedomRatio, freedomGap) {
  Plotly.newPlot('gaugeChart', [{
    type: 'indicator',
    mode: 'gauge+number',
    value: Math.min(freedomRatio, 200),
    number: { suffix: '%' },
    gauge: {
      axis: { range: [0, 200] },
      bar: { color: '#ffffff' },
      steps: [
        { range: [0, 100], color: 'rgba(255,94,108,0.25)' },
        { range: [100, 200], color: 'rgba(38,208,124,0.25)' }
      ],
      threshold: { line: { color: '#26d07c', width: 4 }, thickness: .75, value: 100 }
    },
    title: { text: freedomGap > 0 ? 'Freedom Progress' : 'Freedom Achieved' }
  }], plotLayout(), {displayModeBar:false, responsive:true});

  Plotly.newPlot('barChart', [{
    type: 'bar',
    x: ['Active Income', 'Passive Income', 'Expenses'],
    y: [activeIncome, passiveIncome, expenses],
    marker: { color: ['#8aa0ff', '#26d07c', '#ff5e6c'] }
  }], { ...plotLayout(), margin: { t: 24, r: 12, b: 48, l: 50 } }, {displayModeBar:false, responsive:true});

  const categories = ['Cash', 'Stocks', 'Real Estate', 'Business', 'Other'];
  const values = categories.map(cat => state.assets.filter(a => normalizeCategory(a.category) === normalizeCategory(cat)).reduce((acc, item) => acc + Number(item.value), 0));

  Plotly.newPlot('assetChart', [{
    type: 'pie',
    labels: categories,
    values,
    textinfo: 'label+percent',
    hole: 0.55
  }], { ...plotLayout(), margin: { t: 12, r: 12, b: 12, l: 12 } }, {displayModeBar:false, responsive:true});
}

function plotLayout() {
  return {
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { color: '#f4f7fb', family: '-apple-system, BlinkMacSystemFont, SF Pro Display, Inter, Arial, sans-serif' },
    margin: { t: 32, r: 20, b: 24, l: 24 }
  };
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function normalizeCategory(value) {
  return String(value).toLowerCase().replace(/\s+/g, '_');
}
