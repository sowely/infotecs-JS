// объявляю основные элементы, к которым буду обращаться
const tableHeader = document.querySelector('.table-header')
const tableTitles = document.querySelectorAll('.table-header__title')
const tableBody = document.querySelector('.table-body')
const tableFooter = document.querySelector('.table-footer')
const form = document.querySelector('.form')
const columnsVisibilities = document.querySelector('.columns-visibilities')
let reverse = false // это для смены сортировки по возрастанию/убыванию
let tempData

// получаем данные из JSON файла
const requestURL = './json/data.json'
const request = new XMLHttpRequest()
request.open('GET', requestURL)
request.responseType = 'json'
request.send()

// рендерю таблицу и навешиваю слушатели событий
request.onload = () => {
	const data = request.response;
	loadColumnsVision() //рендер чекбоксов для показа/скрытия колонок
	loadTable(data) //рендер таблицы
	tempData = JSON.parse(JSON.stringify(data)) //скопировала данные из исходного JSON, чтобы было удобно сортировать и тд

	// при клике на заголовок таблицы - сортировка колонки
	tableHeader.addEventListener('click', (e) => sorting(e, tempData, reverse))

	// если нажата кнопка "Изменить направление сортировки" меняем флаг и если надо сортируем
	document.querySelector('.sort-reverse').addEventListener('click', (e) => {
		reverse == false ? reverse = true : reverse = false
		if (tableHeader.querySelector('.sorted')) { sorting(e, tempData, reverse) }
	})
	// при клике на строку появляется форма изменения данных этой строки
	tableBody.addEventListener('click', selectRow)

	// если чекбокс для показа/скрытия колонки нажат показываем/скрываем колонки 
	columnsVisibilities.addEventListener('click', (e) => columnVisibility(e.target.id))
}

// рендер чекбоксов
const loadColumnsVision = () => {
	tableTitles.forEach(title => {
		const start = title.innerText.indexOf('(')
		const end = title.innerText.indexOf(')')
		const engTitle = title.innerText.slice(start + 1, end) // находим заголовки
		// вставка чекбоксов
		columnsVisibilities.insertAdjacentHTML('beforeend',
			`
			<input class="column-visibility" checked type="checkbox" class="btn" id="${engTitle}"/>
			<label for="${engTitle}">${title.textContent}</label>
		`)
	})
}

// получаем id (название колонки), скрываем/показываем нужные заголовки и строки 
const columnVisibility = (id, rerender = true) => {
	columnName = id
	if (!columnName) return // если у колонки нет id то выходим (клик может прийти на label, у label нет id)

	// тоглим класс hidden (display: none) на заголовки и ячейки таблицы и формы 
	for (let i = 0; i < tableTitles.length; i++) {
		if (tableTitles[i].classList.contains(`${columnName}`)) {
			if (rerender) tableTitles[i].classList.toggle('hidden')
			document.querySelectorAll(`td.${columnName}`).forEach(td => td.classList.toggle('hidden'))
			form.querySelector(`.${columnName}`).classList.toggle('hidden')
			return
		}
	}
}

// рендер body и foot таблицы
const loadTable = (data) => {
	// все очищаем, прячем форму
	tableBody.innerHTML = ''
	tableFooter.innerHTML = ''
	form.classList.add('hidden')

	// вставляем строки в таблицу
	data.forEach(obj => {
		tableBody.insertAdjacentElement('beforeend', createRow(obj))
	})

	// считаем количество необходимых страниц и рендерим в foot переключатели страниц
	const pagesCount = Math.ceil(data.length / 10)
	let pagesHTML = ''
	for (let i = 1; i <= pagesCount; i++) {
		pagesHTML += `<span class="page">${i}</span>`
	}
	tableFooter.insertAdjacentHTML('afterbegin',
		`<tr>
			<td colspan="${tableTitles.length}">${pagesHTML}</td>
		</tr>`
	)

	// добавляем для первой страницы стили
	tableFooter.querySelector('.page').classList.add('current-page')
	// выводим по 10 строк на страницу
	changePage()
	// при клике переходим на другую страницу (рисуем другие 10 строк)
	tableFooter.onclick = e => changePage(e.target.textContent)

	// если чекбокс на показ/скрытие колонки не отмечен скрываем колонку
	const columnsVisibility = document.querySelectorAll('.column-visibility')
	columnsVisibility.forEach((elem) => {
		if (!(elem.checked)) columnVisibility(elem.id, false)
	})

}

// показываем по 10 строк на страницу
const changePage = (targetText = null) => {
	// определение текущей страницы
	if (targetText) {
		const pageNumbers = tableFooter.querySelectorAll('.page')
		pageNumbers.forEach(pageNumber => pageNumber.textContent == targetText
			? pageNumber.classList.add('current-page')
			: pageNumber.classList.remove('current-page'))
	}
	// вывод по 10 нужных строк
	const currentPage = tableFooter.querySelector('.current-page').textContent
	const rows = tableBody.querySelectorAll('.table-row')
	rows.forEach((row, i) => {
		(i < currentPage * 10 && i >= (currentPage - 1) * 10)
			? row.classList.remove('hidden')
			: row.classList.add('hidden')
	});
}

// создание строки таблицы
const createRow = obj => {
	const tr = document.createElement('tr')
	tr.classList.add('table-row')
	if (obj.id) tr.id = obj.id


	for (const key in obj) {
		switch (key) {
			case 'name':
				const { firstName = '-', lastName = '-' } = obj.name
				const firstNameElement = document.createElement('td')
				const lastNameElement = document.createElement('td')
				firstNameElement.classList.add('firstName')
				lastNameElement.classList.add('lastName')
				firstNameElement.textContent = firstName
				lastNameElement.textContent = lastName
				tr.appendChild(firstNameElement)
				tr.appendChild(lastNameElement)
				break
			case 'about':
				const aboutElement = document.createElement('td')
				aboutElement.classList.add(key)
				aboutElement.textContent = obj[key]
				tr.appendChild(aboutElement)
				break
			case 'eyeColor':
				const eyeColorElement = document.createElement('td')
				eyeColorElement.classList.add(key)
				// eyeColorElement.textContent = obj[key]
				const colorBox = document.createElement('span')
				colorBox.style.display = 'inline-block'
				colorBox.style.borderRadius = '10px'
				colorBox.style.height = '20px'
				colorBox.style.width = '20px'
				colorBox.style.backgroundColor = `${obj[key]}`
				eyeColorElement.appendChild(colorBox)
				tr.appendChild(eyeColorElement)
				break
			default:
				// const td = document.createElement('td')
				// td.classList.add(`${key}`)
				// td.textContent = obj[key]
				// tr.appendChild(td)
				break
		}
	}
	return tr // возвращаем эелемент строки в loadTable
}
// сортировка
const sorting = (e, data, reverse) => {
	const title = e.target // на какой заголовок нажали

	if (title.classList.contains('sorted')) { // если уже отсортировано рисуем таблицу заново
		title.classList.remove('sorted')
		loadTable(data)
		return
	}
	// чистим все заголовки
	tableTitles.forEach((title) => title.classList.remove('sorted'))
	// сборс сортировки при нажатии кнопки смены направления сортировки
	if (title.classList.contains('sort-reverse')) { loadTable(data); return }

	// для нажатого загаловки добавляем соответствующие стили
	title.classList.add('sorted')

	// ищем по по какому критерию сортируем
	const start = title.innerText.indexOf('(')
	const end = title.innerText.indexOf(')')
	const sortBy = title.innerText.slice(start + 1, end)

	const temp = JSON.parse(JSON.stringify(data)) //копируем пришедшие данные

	// сортировка пузырьком
	switch (sortBy) {
		case 'firstName':
		case 'lastName':
			temp.sort((a, b) => a.name[sortBy] > b.name[sortBy] ? 1 : -1)
			break;
		default:
			temp.sort((a, b) => a[sortBy] > b[sortBy] ? 1 : -1)
			break;
	}
	// если стоит флаг, то возвращаем массив в обратном порядке
	if (reverse) {
		loadTable(temp.reverse())
		return
	}
	// рендерим таблицу
	loadTable(temp)
}

// выбор строки и отрисовка формы
const selectRow = (e) => {
	// получаем нажатую строку
	const row = e.target.closest('.table-row')
	const tableRows = document.querySelectorAll('.table-row')

	if (row.classList.contains('selected')) { // тоглим если уже выбрана строка, прячем форму и выходим из функции
		row.classList.remove('selected')
		form.classList.add('hidden')
		return
	}

	// для выбранной строки устанавливаем стили, для остальных их убираем
	tableRows.forEach(row => row.classList.remove('selected'))
	row.classList.add('selected')

	// появление формы с инпутами
	form.classList.remove('hidden')
	form.querySelector('.firstName').value = row.querySelector('.firstName').textContent
	form.querySelector('.lastName').value = row.querySelector('.lastName').textContent
	form.querySelector('.about').value = row.querySelector('.about').textContent
	form.querySelector('.eyeColor').value = row.querySelector('span').style.backgroundColor //потому что для спана указан bgc

	// на изменение данных в форме передаем их и перерисовывем строку
	form.querySelector('.btn').onclick = (e) => changeData(e, obj = {
		id: row.id,
		firstName: form.querySelector('.firstName').value,
		lastName: form.querySelector('.lastName').value,
		about: form.querySelector('.about').value,
		eyeColor: form.querySelector('.eyeColor').value,
	})
}

// измененная в форме строка перерисовывается
const changeData = (e, { id, firstName, lastName, about, eyeColor }) => {
	e.preventDefault()

	const row = document.getElementById(`${id}`)
	let index
	tempData.find((obj, i) => {
		index = i
		return obj.id == id
	})

	// меняем в дате данные, чтобы после loadTable данные оставались уже измененные
	tempData[index].name.firstName = firstName
	tempData[index].name.lastName = lastName
	tempData[index].about = about
	tempData[index].eyeColor = eyeColor
	row.querySelector('.firstName').textContent = firstName
	row.querySelector('.lastName').textContent = lastName
	row.querySelector('.about').textContent = about
	// row.querySelector('.eyeColor').textContent = eyeColor //раньше eyeColor был текстом, но ниже я заменила его на цветной спан
	row.querySelector('.eyeColor').innerHTML = `<span style="display: inline-block; border-radius: 10px; height: 20px; width: 20px; background-color: ${eyeColor};"></span>`
}

