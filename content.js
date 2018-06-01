/**
 * @author aha-oretama
 * @Date 2018/05/27.
 */
const commitBar = document.getElementsByClassName('commit-tease')[0];

let div = document.createElement('div');
div.className = 'github-bugspots-controller';
button = document.createElement('button');
button.className = 'btn btn-sm notDisplayed';
button.innerHTML = 'bugspots';
button.addEventListener('click', function (event) {
    let button = event.target;
    if(button.classList.contains('notDisplayed')) {
        button.classList.remove('notDisplayed');
        button.classList.add('displayed');
    }else {
        button.classList.remove('displayed');
        button.classList.add('notDisplayed')
    }
});

div.appendChild(button);
commitBar.appendChild(div);

