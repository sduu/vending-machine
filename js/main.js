// 금액에서 콤마를 제거하는 함수
function removeComma(str) {
    const number = parseInt(str.replace(',', ''));
    return number;
}

// 숫자에 콤마를 추가하는 함수
function addComma(num) {
    const money = parseInt(num).toLocaleString();
    return money;
}

const productData = [
    {name: 'Original_Cola', type: 'cola-original', price: '1000', stock: '3', basket: 0},
    {name: 'Violet_Cola', type: 'cola-violet', price: '1000', stock: '3', basket: 0},
    {name: 'Yellow_Cola', type: 'cola-yellow', price: '1000', stock: '3', basket: 0},
    {name: 'Cool_Cola', type: 'cola-cool', price: '1000', stock: '3', basket: 0},
    {name: 'Green_Cola', type: 'cola-green', price: '1000', stock: '3', basket: 0},
    {name: 'Orange_Cola', type: 'cola-orange', price: '1000', stock: '3', basket: 0},
];

const change = document.querySelector('.txt-change span');
const deposit = document.querySelector('.input-deposit');
const wallet = document.querySelector('.txt-wallet span');
const total = document.querySelector('.ordered-total span');
const returnButton = document.querySelector('.btn-return');
const insetButton = document.querySelector('.btn-insert');
const getButton = document.querySelector('.btn-get');
const productList = document.querySelector('.product .product-list');
const orderedList = document.querySelector('.ordered .checkout-list');
const counterList = document.querySelector('.counter .checkout-list');

let productListItems;
let depositValue;
let walletValue;
let changeValue;
let totalAmount = 0;

initProduct(productData);
initWallet(5000);

// 판매중인 제품 목록 초기화
function initProduct(productData) {
    productData.forEach(data => {
        /* insertAdjacentHTML vs appendChild */
        productList.insertAdjacentHTML('beforeend', createProductItem(data));
    });
    productListItems = productList.querySelectorAll('.product-item');
}

// 제품 목록 아이템 생성
function createProductItem(data) {
    return `
    <li class="product-item" data-type=${data.type}>
        <button type="button" >
            <img class="img" src="assets/${data.type}.svg" alt="" />
            <strong class="name">${data.name}</strong>
            <span class="price">${data.price}원</span>
        </button>
    </li>
    `;
}

// 소지금 초기화
function initWallet(money = 0) {
    wallet.innerText = `${addComma(money)} 원`;
}

insetButton.addEventListener('click', insertMoney);
returnButton.addEventListener('click', returnMoney);
getButton.addEventListener('click', getProduct);
[...productListItems].forEach(function (item) {
    item.addEventListener('click', addBasket);
});

// 금액 관련 값 가져오기
function getCounterValue() {
    walletValue = removeComma(wallet.innerText);
    changeValue = removeComma(change.innerText);
    depositValue = deposit.value;
}

// 입금 버튼
function insertMoney() {
    getCounterValue();

    // 유효성 검사
    if (depositValue === '') {
        alert('입금할 금액을 입력해주세요.');
        deposit.focus();
        return false;
    }

    if (walletValue < depositValue) {
        alert('소지금이 부족합니다.');
        deposit.focus();
        return false;
    }

    change.innerText = `${addComma(changeValue + +depositValue)} 원`;
    wallet.innerText = `${addComma(walletValue - +depositValue)} 원`;
    deposit.value = '';
}

// 거스름돈 반환 버튼
function returnMoney() {
    getCounterValue();

    // 유효성 검사
    if (changeValue === 0) {
        alert('잔액이 부족합니다.');
        return false;
    }

    change.innerText = `0 원`;
    wallet.innerText = `${addComma(walletValue + changeValue)} 원`;
}

// 음료 버튼
function addBasket() {
    const _this = this;
    const targetData = productData.filter(function (data) {
        return data.type === _this.dataset.type;
    })[0];

    targetData.basket === 0 ? initBasketItem('counter', targetData) : addBasketNum('counter', targetData);

    totalAmount += +targetData.price;

    if (targetData.stock === 0) {
        _this.classList.add('is-soldout');
        _this.querySelector('button').disabled = true;
    }
}

// 장바구니 아이템 개수 증가
function addBasketNum(list, data) {
    if (list == 'ordered') {
        const ordered = orderedList.querySelector(`[data-type=${data.type}]`);
        const before = parseInt(ordered.querySelector('.count').innerText);
        ordered.setAttribute('aria-label', `${before + data.basket}개`);
        ordered.querySelector('.count').innerText = before + data.basket;
    } else {
        const checkout = counterList.querySelector(`[data-type=${data.type}]`);
        data.basket++;
        data.stock--;
        checkout.setAttribute('aria-label', `${data.basket}개`);
        checkout.querySelector('.count').innerText = data.basket;
    }
}

// 장바구니 아이템 추가
function initBasketItem(list, data) {
    if (list == 'ordered') {
        orderedList.insertAdjacentHTML('beforeend', createBasketItem(data));
    } else {
        data.basket++;
        data.stock--;
        counterList.insertAdjacentHTML('beforeend', createBasketItem(data));
    }
}

// 장바구니 아이템 생성
function createBasketItem(data) {
    return `
    <li class="checkout-item" data-type=${data.type}>
        <img class="img" src="assets/${data.type}.svg" alt="" />
        <strong class="name">${data.name}</strong>
        <span class="count" aria-label="${data.basket}개">${data.basket}</span>
    </li>
    `;
}

// 획득 버튼
function getProduct() {
    getCounterValue();

    // 유효성 검사
    if (totalAmount === 0) {
        alert('구매하실 음료를 선택해 주세요.');
        return false;
    }

    if (changeValue < totalAmount) {
        alert('잔액이 부족합니다');
        return false;
    }

    const orderedData = productData.filter(item => item.basket > 0);

    orderedData.forEach(function (data) {
        if (orderedList.querySelector(`[data-type=${data.type}]`) !== null) {
            addBasketNum('ordered', data);
        } else {
            initBasketItem('ordered', data);
        }
    });

    change.innerText = `${addComma(+changeValue - totalAmount)} 원`;
    addTotalMoney();

    // 초기화
    productData.forEach(function (data) {
        data.basket = 0;
    });
    counterList.replaceChildren();
    totalAmount = 0;
}

function addTotalMoney() {
    const before = removeComma(total.innerText);
    total.innerText = `${addComma(before + totalAmount)} 원`;
}
