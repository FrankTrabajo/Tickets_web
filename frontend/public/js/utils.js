export function hideItems(arr){
    arr.forEach(element => {
        element.classList.add('d-none');
    });
}

export function showItems(arr){
    arr.forEach(element => {
        element.classList.remove('d-none');
    });
}
