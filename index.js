// Objeto que contiene los porcentajes de impuestos
const impuestos = {
    IVA: 0.21,
    PAIS: 0.08,
    GANANCIAS: 0.30,
    PROVINCIA: 0.02
};

// Recuperar el historial del localStorage o inicializarlo si no existe
let historial = JSON.parse(localStorage.getItem('historial')) || [];

// Mostrar historial en el DOM
function mostrarHistorial() {
    const historialElement = document.getElementById('historial');
    historialElement.innerHTML = '';
    historial.forEach((item, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. Monto original: $${item.montoOriginal.toFixed(2)}, Monto con impuesto: $${item.montoConImpuesto.toFixed(2)}`;
        historialElement.appendChild(li);
    });
}

// Función para calcular el costo con impuesto
function calcularCostoConImpuesto(monto) {
    return monto + (monto * impuestos.IVA) + (monto * impuestos.PAIS) + (monto * impuestos.GANANCIAS) + (monto * impuestos.PROVINCIA);
}

// Manejar el envío del formulario
document.getElementById('formImpuestos').addEventListener('submit', function(e) {
    e.preventDefault();

    const montoOriginal = parseFloat(document.getElementById('monto').value);
    if (isNaN(montoOriginal) || montoOriginal <= 0) {
        alert('Por favor, ingrese un monto válido.');
        return;
    }

    const montoConImpuesto = calcularCostoConImpuesto(montoOriginal);

    // Guardar el cálculo en el historial
    const nuevoCalculo = {
        montoOriginal: montoOriginal,
        montoConImpuesto: montoConImpuesto
    };
    historial.push(nuevoCalculo);

    // Guardar el historial en localStorage
    localStorage.setItem('historial', JSON.stringify(historial));

    // Mostrar el resultado en el DOM
    document.getElementById('resultado').innerHTML = `
        <p>Monto original: $${montoOriginal.toFixed(2)}</p>
        <p>IVA (21%): $${(montoOriginal * impuestos.IVA).toFixed(2)}</p>
        <p>PAIS (8%): $${(montoOriginal * impuestos.PAIS).toFixed(2)}</p>
        <p>Ganancias (30%): $${(montoOriginal * impuestos.GANANCIAS).toFixed(2)}</p>
        <p>Provincia (2%): $${(montoOriginal * impuestos.PROVINCIA).toFixed(2)}</p>
        <p><strong>Monto total a pagar: $${montoConImpuesto.toFixed(2)}</strong></p>
    `;

    // Actualizar y mostrar el historial en el DOM
    mostrarHistorial();
});

// Mostrar el historial al cargar la página
document.addEventListener('DOMContentLoaded', mostrarHistorial);

// Borrar historial
document.getElementById('limpiarHistorial').addEventListener('click', function() {
    historial = [];
    localStorage.removeItem('historial');
    mostrarHistorial();
    alert('Historial limpiado.');
});

// Configuración
const API_URL = 'https://dolarapi.com/v1/dolares';
const SLIDE_INTERVAL = 6000; // 6 segundos
const UPDATE_INTERVAL = 300000; // 5 minutos
const MAX_DOLARES = 5;

// Variables globales
let dolaresData = [];
let currentIndex = 0;
let autoSlideInterval;
let updateInterval;

// Elementos del DOM
const carruselElement = document.getElementById('carrusel-dolares');
const containerElement = document.getElementById('dolares-container');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');

// Cargar los datos desde la API
async function cargarDolares() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        dolaresData = data.slice(0, MAX_DOLARES).map(({ nombre, compra, venta }) => ({ nombre, compra, venta }));
        mostrarDolar(currentIndex);
        iniciarAutoSlide();
    } catch (error) {
        console.error('Error al cargar la API:', error);
        containerElement.innerHTML = '<p>Error al cargar los datos. Por favor, intente más tarde.</p>';
    }
}

// Mostrar un dólar en el carrusel
function mostrarDolar(index) {
    const { nombre, compra, venta } = dolaresData[index];
    containerElement.innerHTML = `
        <div>
            <h4>${nombre}</h4>
            <p>Compra: $${compra.toFixed(2)}</p>
            <p>Venta: $${venta.toFixed(2)}</p>
        </div>
    `;
}

// Función para avanzar o retroceder en el carrusel
function cambiarDolar(direccion) {
    currentIndex = direccion === 'next'
        ? (currentIndex + 1) % dolaresData.length
        : (currentIndex - 1 + dolaresData.length) % dolaresData.length;
    mostrarDolar(currentIndex);
}

// Función para iniciar el carrusel automático
function iniciarAutoSlide() {
    detenerAutoSlide();
    autoSlideInterval = setInterval(() => cambiarDolar('next'), SLIDE_INTERVAL);
}

// Función para detener el carrusel automático
function detenerAutoSlide() {
    clearInterval(autoSlideInterval);
}

// Función para iniciar la actualización periódica
function iniciarActualizacionPeriodica() {
    updateInterval = setInterval(cargarDolares, UPDATE_INTERVAL);
}

// Carrusel Ev
carruselElement.addEventListener('mouseenter', detenerAutoSlide);
carruselElement.addEventListener('mouseleave', iniciarAutoSlide);
prevButton.addEventListener('click', () => cambiarDolar('prev'));
nextButton.addEventListener('click', () => cambiarDolar('next'));
document.addEventListener('DOMContentLoaded', () => {
    cargarDolares();
    iniciarActualizacionPeriodica();
});

// Limpieza al cerrar la página
window.addEventListener('beforeunload', () => {
    clearInterval(autoSlideInterval);
    clearInterval(updateInterval);
});
 
