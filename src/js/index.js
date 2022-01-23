import { $ } from './utils/dom.js';
import store from './store/index.js';
import MenuApi from './api/index.js';


function App() {
  //상태 : 변할 수 있는 Data -> 메뉴명(개수(length))
  //상태 값 선언
  this.menu = {
    espresso: [],
    frappuccino: [],
    blended: [],
    teavana: [],
    desert: []
  };

  this.currentCategory = 'espresso'

  //카테고리에 따라 메뉴 불러옴
  this.init = async () => {
    this.menu[this.currentCategory] = await MenuApi.getAllMenuByCategory(
      this.currentCategory
    );
    render();
    initEventListeners();
  };
  
  const render = async () => {
    this.menu[this.currentCategory] = await MenuApi.getAllMenuByCategory(
      this.currentCategory
    );
    //메뉴별로 순회하면서 화면 마크업 만들기 & 새로운 배열 만듬
    const template = this.menu[this.currentCategory]
    .map((menuItem, index) => {
      return `
        <li data-menu-id="${
          menuItem.id
        }" class="menu-list-item d-flex items-center py-2">
          <span class="w-100 pl-2 menu-name ${
            menuItem.isSoldOut ? "sold-out" : ""
          } ">${menuItem.name}</span>
          <button
            type="button"
            class="bg-gray-50 text-gray-500 text-sm mr-1 menu-sold-out-button"
          >
            품절
          </button>
          <button
            type="button"
            class="bg-gray-50 text-gray-500 text-sm mr-1 menu-edit-button"
          >
            수정
          </button>
          <button
            type="button"
            class="bg-gray-50 text-gray-500 text-sm menu-remove-button"
          >
            삭제
          </button>
        </li>`;
    })
    .join('');  

    $('#menu-list').innerHTML = template;
    updateMenuCount();
  }

  //재사용 함수들
  const updateMenuCount= () => {
    const menuCount = this.menu[this.currentCategory].length;
    $('.menu-count').innerText = `총 ${menuCount} 개`;
  };

  const addMenuName = async () => {
    if($('#menu-name').value === '') {
      alert('메뉴를 입력해주세요.');
      return;
    }

    const duplicatedItem = this.menu[this.currentCategory].find(
      (menuItem) => menuItem.name === $('#menu-name').value
      );
      if (duplicatedItem) {
        alert('이미 등록된 메뉴입니다.');
        $('#menu-name').value = '';
        return;
      }

    const menuName = $('#menu-name').value;
    await MenuApi.createMenu(this.currentCategory, menuName);
    render();
    $('#menu-name').value = '';
  };

  const updateMenuName = async (e) => {
    const menuId = e.target.closest('li').dataset.menuId;
    const $menuName = e.target.closest('li').querySelector('.menu-name');
    const updatedMenuName = prompt('메뉴명을 수정하세요.', $menuName.innerText);

    await MenuApi.updateMenu(this.currentCategory, updatedMenuName, menuId);
   
    render();
  };

  const removeMenuName = async (e) => {
    if (confirm('메뉴명을 삭제하시겠습니까?')) {
      const menuId = e.target.closest('li').dataset.menuId;

      await MenuApi.deleteMenu(this.currentCategory, menuId);
     
      render();
    }
  };
  
  const soldOutMenu = async (e) => {
    const menuId = e.target.closest('li').dataset.menuId;
    await MenuApi.toggleSoldOutMenu(this.currentCategory, menuId);
    
    render();
  };

  const changeCategory = (e) => {
    const isCategoryButton = 
    e.target.classList.contains('cafe-category-name')
    if (isCategoryButton) {
      const categoryName = e.target.dataset.categoryName;
      this.currentCategory = categoryName;
      $('#category-title').innerText = `${e.target.innerText} 메뉴 관리`;
      
      render();
    }
  }

  const initEventListeners = () => {
    //품절&수정&삭제 버튼 클릭
    $('#menu-list').addEventListener('click', (e) => {
      //메뉴 품절 기능
      if (e.target.classList.contains('menu-sold-out-button')) {
        soldOutMenu(e);
        return;
      }

      //메뉴 수정 기능
      if (e.target.classList.contains('menu-edit-button')) {
        updateMenuName(e);
        return;
      }

      //메뉴 삭제 기능
      if (e.target.classList.contains('menu-remove-button')) {
        //const $menuName = e.target.closest('li')
        removeMenuName(e);
        return;
      }
    });

    //메뉴 작성 기능
    $('#menu-form').addEventListener('submit', (e) => {
      e.preventDefault();
    });

    $('#menu-submit-button').addEventListener('click', addMenuName);

    $('#menu-name').addEventListener('keypress', (e) => {
      if (e.key !== 'Enter') {
        return;
      }
      addMenuName();
    });

    $('nav').addEventListener('click',changeCategory);

  
  };
}

const app = new App();
app.init();
