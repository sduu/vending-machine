// 숫자에 콤마를 추가하는 함수
const addComma = function (num) {
    const money = parseInt(num).toLocaleString();
    return money;
};

const productData = [
    {name: 'Original_Cola', type: 'cola-original', price: '1000', stock: '3'},
    {name: 'Violet_Cola', type: 'cola-violet', price: '1000', stock: '3'},
    {name: 'Yellow_Cola', type: 'cola-yellow', price: '1000', stock: '3'},
    {name: 'Cool_Cola', type: 'cola-cool', price: '1000', stock: '3'},
    {name: 'Green_Cola', type: 'cola-green', price: '1000', stock: '3'},
    {name: 'Orange_Cola', type: 'cola-orange', price: '1000', stock: '3'},
];

const changeEl = document.querySelector('.txt-change span');
const walletEl = document.querySelector('.txt-wallet span');
const totalEl = document.querySelector('.ordered-total span');
const returnButton = document.querySelector('.btn-return');
const insetButton = document.querySelector('.btn-insert');
const getButton = document.querySelector('.btn-get');
const cartList = document.querySelector('.counter .checkout-list');

let walletVal = 5000;
let changeVal = 0;
let totalVal = 0;
let cartVal = 0;

let productItems = [];
let cartItems = [];

// 음료 데이터로 요소 생성
class Product {
    constructor(el, data) {
        this.productList = el;
        this.data = {...data};

        this.createProductItem();
    }

    createProductItem() {
        const li = document.createElement('li');
        li.classList.add('product-item');
        li.setAttribute('data-type', this.data.type);
        li.innerHTML = `
            <button type="button">
                <img class="img" src="assets/${this.data.type}.svg" alt="" />
                <strong class="name">${this.data.name}</strong>
                <span class="price">${this.data.price}원</span>
            </button>
        `;
        this.productItem = li;
        this.productList.appendChild(this.productItem);
    }

    setSoldout() {
        if (this.data.stock === 0) {
            this.productItem.classList.add('is-soldout');
            this.productItem.querySelector('button').disabled = true;
        } else {
            this.productItem.classList.remove('is-soldout');
            this.productItem.querySelector('button').disabled = false;
        }
    }
}

// 장바구니 아이템 요소 생성
class Cart {
    constructor(el, data) {
        this.cartList = el;
        this.data = {...data};

        this.createCartItem();
    }

    createCartItem() {
        const li = document.createElement('li');
        li.classList.add('checkout-item');
        li.setAttribute('data-type', this.data.type);
        li.innerHTML = `
            <img class="img" src="assets/${this.data.type}.svg" alt="" />
            <strong class="name">${this.data.name}</strong>
            <span class="count" aria-label="${this.data.num}개">${this.data.num}</span>
            <button class="btn-delete" type="button" aria-label="음료 삭제하기"></button>
        `;
        this.cartItem = li;
        this.cartList.appendChild(this.cartItem);
    }

    updateItem() {
        this.cartItem.setAttribute('aria-label', `${this.data.num}개`);
        this.cartItem.querySelector('.count').innerText = this.data.num;
    }
}

// 초기화
initProductList();
setInnerText();
bindEvent();

// 음료 판매 리스트 추가
function initProductList() {
    const productList = document.querySelector('.product .product-list');
    productData.forEach(data => productItems.push(new Product(productList, data)));
}

// 이벤트 바인딩
function bindEvent() {
    returnButton.addEventListener('click', returnMoney);
    insetButton.addEventListener('click', insertMoney);
    getButton.addEventListener('click', getProduct);
    productItems.forEach(item => {
        item.productItem.addEventListener('click', () => addCart(item));
    });
}

// 입력 값을 금액에 업데이트
function setInnerText() {
    walletEl.innerText = `${addComma(walletVal)} 원`;
    changeEl.innerText = `${addComma(changeVal)} 원`;
}

// 음료 클릭
function addCart(product) {
    if (changeVal < parseInt(product.data.price)) {
        alert('잔액이 부족합니다.');
        return false;
    }

    // 잔액 반영
    cartVal += parseInt(product.data.price);
    changeVal -= parseInt(product.data.price);
    setInnerText();

    --product.data.stock;

    // 장바구니 리스트 업데이트
    // TODO : find() 보다 좋은 방법이 있는지 찾아보기
    const cartItem = cartItems.find(item => item.data.type === product.data.type);
    if (!cartItem) {
        const data = {
            name: product.data.name,
            type: product.data.type,
            num: 1,
        };
        const item = new Cart(cartList, data);
        cartItems.push(item);
        // TODO : 동적으로 생성된 요소에 이벤트 바인딩 하는 방법 찾아보기
        item.cartItem.querySelector('.btn-delete').addEventListener('click', deleteCart);
    } else {
        cartItem.data.num++;
        cartItem.updateItem();
    }

    // 재고 소진 시 품절 표시
    if (product.data.stock === 0) {
        product.setSoldout();
    }
}

// 입금 버튼
function insertMoney() {
    const depositInput = document.querySelector('.input-deposit');
    const depositVal = +depositInput.value;

    // 유효성 검사
    if (depositVal === 0) {
        alert('입금할 금액을 입력해주세요.');
        depositInput.focus();
        return false;
    }

    if (walletVal < depositVal) {
        alert('소지금이 부족합니다.');
        depositInput.focus();
        return false;
    }

    changeVal += depositVal;
    walletVal -= depositVal;
    depositInput.value = '';
    setInnerText();
}

// 거스름돈 반환 버튼
function returnMoney() {
    // 유효성 검사
    if (changeVal === 0) {
        alert('잔액이 부족합니다.');
        return false;
    }

    walletVal += changeVal;
    changeVal = 0;
    setInnerText();
}

// 획득 버튼
function getProduct() {
    const orderedList = document.querySelector('.ordered .checkout-list');

    // TODO : 반복문을 쓰지 않는 방법이 있을지 찾아보기
    cartItems.forEach(item => {
        if (!orderedList.querySelector(`[data-type=${item.data.type}]`)) {
            const clone = item.cartItem.cloneNode(true);
            clone.querySelector('button').remove();
            orderedList.appendChild(clone);
        } else {
            const orderedItem = orderedList.querySelector(`[data-type=${item.data.type}]`);
            const num = parseInt(orderedItem.querySelector('.count').innerText);
            orderedItem.querySelector('.count').setAttribute('aria-label', `${num + item.data.num} 개`);
            orderedItem.querySelector('.count').innerText = num + item.data.num;
        }

        item.cartItem.remove();
    });

    // 초기화
    cartItems = [];

    // 총금액 반영
    totalVal += cartVal;
    cartVal = 0;
    totalEl.innerText = `${addComma(totalVal)} 원`;
}

// 장바구니에서 삭제
function deleteCart() {
    const li = this.parentNode;
    const index = [...cartList.children].indexOf(li);
    // TODO : find() 보다 좋은 방법이 있는지 찾아보기
    const productItem = productItems.find(item => item.data.type === li.dataset.type);

    // 금액에 반영
    changeVal += cartItems[index].data.num * productItem.data.price;
    totalVal -= cartItems[index].data.num * productItem.data.price;
    setInnerText();

    // 제품 재고애 반영
    productItem.data.stock += cartItems[index].data.num;
    productItem.setSoldout();

    cartItems.splice(index, 1);
    li.remove();
}
