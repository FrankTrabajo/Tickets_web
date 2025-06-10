/**
 * Le añade una clase que oculta el elemento pasado.
 * @param {Array} arr 
 */
export function hideItems(arr){
    arr.forEach(element => {
        element.classList.add('d-none');
    });
}
/**
 * Le añade una clase que muestra el elemento pasado.
 * @param {Array} arr 
 */
export function showItems(arr){
    arr.forEach(element => {
        element.classList.remove('d-none');
    });
}

