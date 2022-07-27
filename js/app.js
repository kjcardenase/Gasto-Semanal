//variables y selectores
const formulario = document.querySelector('#agregar-gasto');
const gastoListado = document.querySelector('#gastos ul');

//BOTON para borrar
const resetBtn = document.querySelector('#resetBtn');
resetBtn.classList.add('btn', 'btn-danger', 'borrar-gasto');

resetBtn.addEventListener('click', () => {
    localStorage.setItem('presupuesto', null);
    window.location.reload();
});
//eventos

eventListener();
function eventListener() {
    document.addEventListener('DOMContentLoaded', preguntarPresupuesto);

    formulario.addEventListener('submit', agregarGasto);
}

//clases
class Presupuesto {
    constructor(presupuesto) {
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
    }

    nuevoGasto(gasto) {
        this.gastos = [...this.gastos, gasto];
        this.calcularRestante();

        const presupuestoLocalStorage = JSON.parse(
            localStorage.getItem('presupuesto')
        );

        console.log(presupuestoLocalStorage);

        presupuestoLocalStorage.gastos = this.gastos;

        localStorage.setItem(
            'presupuesto',
            JSON.stringify(presupuestoLocalStorage)
        );

        console.log(presupuestoLocalStorage);
    }

    calcularRestante() {
        const gastado = this.gastos.reduce(
            (total, gasto) => total + gasto.cantidad,
            0
        );

        this.restante = this.presupuesto - gastado;

        const presupuestoLocalStorage = JSON.parse(
            localStorage.getItem('presupuesto')
        );
        presupuestoLocalStorage.restante = this.restante;
        localStorage.setItem(
            'presupuesto',
            JSON.stringify(presupuestoLocalStorage)
        );
    }

    eliminarGasto(id) {
        this.gastos = this.gastos.filter((gasto) => gasto.id !== id);
        this.calcularRestante();

        const presupuestoLocalStorage = JSON.parse(
            localStorage.getItem('presupuesto')
        );

        presupuestoLocalStorage.gastos = this.gastos;

        localStorage.setItem(
            'presupuesto',
            JSON.stringify(presupuestoLocalStorage)
        );

        // localStorage.setItem(
        //     'presupuesto',
        //     JSON.stringify(presupuestoLocalStorage)
        // );
    }
}

class UI {
    insertarPresupuesto(cantidad) {
        //extrayendo los valores
        const { presupuesto, restante } = cantidad;

        //agrgar al HTML
        document.querySelector('#total').textContent = presupuesto;
        document.querySelector('#restante').textContent = restante;
    }

    imprimirAlerta(mensaje, tipo) {
        //crear el div
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('text-center', 'alert');

        if (tipo === 'error') {
            divMensaje.classList.add('alert-danger');
        } else {
            divMensaje.classList.add('alert-success');
        }

        //mensaje error
        divMensaje.textContent = mensaje;

        //insertar en el HTML
        document
            .querySelector('.primario')
            .insertBefore(divMensaje, formulario);

        //quitar en el HTML
        setTimeout(() => {
            divMensaje.remove();
        }, 3000);
    }

    mostrarGastos(gastos) {
        this.limpiarHTML(); //elimina el html previo

        //iterar sobre los gastos
        gastos.forEach((gasto) => {
            const { cantidad, nombre, id } = gasto;

            //crear un LI
            const nuevoGasto = document.createElement('li');
            nuevoGasto.className =
                'list-group-item d-flex justify-content-between align-items-center';
            nuevoGasto.dataset.id = id;

            //agregar al THML
            nuevoGasto.innerHTML = `${nombre} <span class="badge badge-primary badge-pill"> $
        ${cantidad}</span>`;

            //BOTON para borrar al gasto
            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.innerHTML = 'Borrar &times';

            btnBorrar.onclick = () => {
                eliminarGasto(id);
            };

            nuevoGasto.appendChild(btnBorrar);

            //agregar al HTML

            gastoListado.appendChild(nuevoGasto);
        });
    }

    limpiarHTML() {
        while (gastoListado.firstChild) {
            gastoListado.removeChild(gastoListado.firstChild);
        }
    }

    actualizarRestante(restante) {
        document.querySelector('#restante').textContent = restante;
    }

    comprobarPresupuesto(presupuestObj) {
        const { presupuesto, restante } = presupuestObj;

        const restanteDiv = document.querySelector('.restante');

        //comprobar 25%
        if (presupuesto / 4 > restante) {
            restanteDiv.classList.remove('alert-success', 'alert-warning');
            restanteDiv.classList.add('alert-danger');
        } else if (presupuesto / 2 > restante) {
            restanteDiv.classList.remove('alert-success');
            restanteDiv.classList.add('alert-warning');
        } else {
            restanteDiv.classList.remove('alert-danger', 'alert-warning');
            restanteDiv.classList.add('alert-success');
        }

        //si el total es 0 o menor
        if (restante <= 0) {
            ui.imprimirAlerta('El presupuesto se ha agotado', 'error');
            formulario.querySelector('button[type="submit"]').disabled = true;
        }
    }
}

//instanciar
const ui = new UI();
let presupuesto;

//funciones
function preguntarPresupuesto() {
    let presupuestoLocalStorage = localStorage.getItem('presupuesto');

    presupuestoLocalStorage = presupuestoLocalStorage
        ? JSON.parse(presupuestoLocalStorage)
        : presupuestoLocalStorage;

    if (!presupuestoLocalStorage) {
        const presupuestoUsuario = prompt('¿Cuál es tu presupuesto?');

        if (
            presupuestoUsuario === '' ||
            presupuestoUsuario === null ||
            isNaN(presupuestoUsuario) ||
            presupuestoUsuario <= 0
        ) {
            window.location.reload();
        }

        //presupuesto valido
        presupuesto = new Presupuesto(presupuestoUsuario);

        localStorage.setItem('presupuesto', JSON.stringify(presupuesto));
    } else {
        presupuesto = new Presupuesto(presupuestoLocalStorage.presupuesto);
        presupuesto.gastos = presupuestoLocalStorage.gastos;
        presupuesto.restante = presupuestoLocalStorage.restante;
        ui.mostrarGastos(presupuesto.gastos);
        ui.actualizarRestante(presupuesto.restante);
    }

    ui.insertarPresupuesto(presupuesto);
}

//añade gastos
function agregarGasto(e) {
    e.preventDefault();

    //leer los datos del formulario
    const nombre = document.querySelector('#gasto').value;
    const cantidad = Number(document.querySelector('#cantidad').value);

    //validar
    if (nombre === '' || cantidad === '') {
        ui.imprimirAlerta('Ambos campos son obligatorios', 'error');
        return;
    } else if (cantidad <= 0 || isNaN(cantidad)) {
        ui.imprimirAlerta('Cantidad no válida', 'error');
        return;
    }

    //generar un objeto con el gasto
    const gasto = { nombre, cantidad, id: Date.now() };

    console.log(presupuesto);

    //añade un nuevo gasto
    presupuesto.nuevoGasto(gasto);

    //mensaje todo bien
    ui.imprimirAlerta('Gasto agregado correctamente');

    console.log(presupuesto);

    //imprimir los gastos
    const { gastos, restante } = presupuesto;

    ui.mostrarGastos(gastos);

    ui.actualizarRestante(restante);

    ui.comprobarPresupuesto(presupuesto);
    formulario.reset();
}

function eliminarGasto(id) {
    //elimina del objeto
    presupuesto.eliminarGasto(id);

    //elimina los gastos del HTML
    const { gastos, restante } = presupuesto;
    ui.mostrarGastos(gastos);
    ui.actualizarRestante(restante);
    ui.comprobarPresupuesto(presupuesto);
}
