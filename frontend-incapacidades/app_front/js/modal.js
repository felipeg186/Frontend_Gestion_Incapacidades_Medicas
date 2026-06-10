const modal1 = document.getElementById('modal1');
const contentForm = document.getElementById('contentForm');

const showMsg = () => modal1.classList.remove('close');
const hideMsg = () => modal1.classList.add('close');
const showForm = () => contentForm.style.right = '0px';
const hideForm = () => contentForm.style.right = '-100vw';

modal1.getElementsByTagName('button')[0].addEventListener('click', () => hideMsg());