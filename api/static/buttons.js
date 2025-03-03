window.filter = () => {
    const filterValue = document.querySelector('input#filter').value
    document.querySelectorAll('.tree > a.searchable').forEach((el) => {
        const re = new RegExp(filterValue, 'i')
        const pattern = el.innerText.split(/_|-/).join(' ')
        if (re.test(pattern)) {
            el.classList.remove('filtered')
        } else {
            el.classList.add('filtered')
        }
    })
}
