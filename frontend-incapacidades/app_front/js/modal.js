const modal1 = document.getElementById('modal1');
const contentForm = document.getElementById('contentForm');
const overlay = document.getElementById('overlay');

const showMsg = () => modal1.classList.remove('close');
const hideMsg = () => modal1.classList.add('close');
const showForm = () => {contentForm.classList.add('open');overlay.classList.add('active');};
const hideForm = () => {contentForm.classList.remove('open');overlay.classList.remove('active');};

modal1.getElementsByTagName('button')[0].addEventListener('click', () => hideMsg());