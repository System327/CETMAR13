const toggleBtn = document.querySelector('.menu-toggle');
const menu = document.querySelector('.botones');

toggleBtn.addEventListener('click', () => {
    menu.classList.toggle('active');
});