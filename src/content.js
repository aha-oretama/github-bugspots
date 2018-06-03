/**
 * @author aha-oretama
 * @Date 2018/05/27.
 */
import Bugspots from './bugspots';

const commitBar = document.getElementsByClassName('commit-tease')[0];

let div = document.createElement('div');
div.className = 'github-bugspots-controller';
let button = document.createElement('button');
button.className = 'btn btn-sm notDisplayed';
button.innerHTML = 'bugspots';
button.addEventListener('click', function (event) {
    let button = event.target;
    if(button.classList.contains('notDisplayed')) {
        button.classList.remove('notDisplayed');
        button.classList.add('displayed');
        new Bugspots('aha-oretama', "TypoFixer", '98f5e32772d42332dce722f0ea3b39f2e5c117e0').analyze('*','master')
            .then(value => {
                console.log(value.fixes);
                console.log(value.spots);
            })
    }else {
        button.classList.remove('displayed');
        button.classList.add('notDisplayed')
    }
});

div.appendChild(button);
commitBar.appendChild(div);
