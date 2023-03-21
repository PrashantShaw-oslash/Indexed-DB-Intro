// --------------------------------------------------------------
//                   IndexedDB implementation
// --------------------------------------------------------------
console.log('from script.js ##')
let hasIndexedDb = 'indexedDB' in window
const DB_NAME = 'carsDB'
const DB_VERSION = 2
const OBJ_STORES = ['cars']

if (!hasIndexedDb) {
    console.log('IndexedDb is NOT available')
}
else {
    console.log('IndexedDb is available')
}
const getDB = async () => {
    return await new Promise((resolve, reject) => {
        const requestOpenDB = indexedDB.open(DB_NAME, DB_VERSION)
        requestOpenDB.onupgradeneeded = (event) => {
            const db = event.target.result
            const usersObjectStore = db.createObjectStore(OBJ_STORES[0], { keyPath: 'id' })
            usersObjectStore.createIndex('car-color', 'color', { unique: false })
            usersObjectStore.createIndex('car-company', 'company', { unique: false })
        }
        requestOpenDB.onerror = (err) => {
            reject(new Error('Some error occurred while connecting to Indexed DB', err))
        }
        requestOpenDB.onsuccess = (event) => {
            resolve(event.target.result)
        }
    })
}
const getStore = async (storeName, operationType = 'readonly') => {
    const db = await getDB()
    const tx = db.transaction(storeName, operationType)
    return await tx.objectStore(storeName)
}
const getAllCars = async () => {
    const store = await getStore(OBJ_STORES[0])
    return await new Promise((resolve, reject) => {
        const request = store.getAll()
        request.onerror = (err) => reject(new Error('Cant Find cars', err))
        request.onsuccess = (event) => resolve(event.target.result)
    })
}
const addCar = async ({ company, color }) => {
    const store = await getStore(OBJ_STORES[0], 'readwrite')
    const id = (Math.random() * 10000).toString(16)
    return new Promise((resolve, reject) => {
        const request = store.add({ id, company, color })
        request.onerror = (err) => reject(new Error('Failed to add car', err))
        request.onsuccess = (event) => resolve(event.target.result)
    })
}
// --------------------------------------------------------------
//                      DOM manipulation
// --------------------------------------------------------------

const getCarsButton = document.getElementsByClassName('get-cars-btn')[0]
const carForm = document.getElementsByClassName('car-form')[0]
const carsTableBody = document.getElementById('cars-table-body')

let TABLE_BODY_HTML = carsTableBody.innerHTML

getAllCars().then((cars) => {
    cars.forEach((car, idx) => {
        TABLE_BODY_HTML += `
        <tr>
            <td>${idx + 1}</td>
            <td>${car.company}</td>
            <td>${car.color}</td>
        </tr>
        `
    })
    carsTableBody.innerHTML = TABLE_BODY_HTML
})

getCarsButton.onclick = async () => {
    const cars = await getAllCars()
    console.log("All cars :: ", cars)
}

carForm.onsubmit = async (e) => {
    e.preventDefault()
    const { company, color } = e.target
    console.log("Submitted car company :: ", company.value)
    console.log("Submitted car color :: ", color.value)
    const carDetails = {
        company: company.value,
        color: color.value
    }
    const data = await addCar(carDetails)
    TABLE_BODY_HTML += `
        <tr>
            <td>#</td>
            <td>${company.value}</td>
            <td>${color.value}</td>
        </tr>
        `
    carsTableBody.innerHTML = TABLE_BODY_HTML
    console.log('added car data :: ', data)
    carForm.reset()
}