let db;

// Inicializar la base de datos IndexedDB
function iniciarBaseDeDatos() {
const request = indexedDB.open("CajeroDB", 1);

request.onupgradeneeded = function (event) {
    db = event.target.result;
    const store = db.createObjectStore("cuentas", { keyPath: "numeroCuenta" });
    store.createIndex("titular", "titular", { unique: false });
};

request.onsuccess = function (event) {
    db = event.target.result;
    console.log("Base de datos iniciada");
};

request.onerror = function () {
    console.error("Error al iniciar la base de datos");
};
}

// Mostrar una sección específica de la interfaz
function mostrarSeccion(id) {
document.querySelectorAll(".seccion").forEach((seccion) => {
    seccion.classList.add("oculta");
});
document.getElementById(id).classList.remove("oculta");
}

// Crear una nueva cuenta bancaria
function crearCuenta() {
  console.log("Función Corriendo");

  const titular = document.getElementById("nombre-titular").value;
  const id = document.getElementById("id-titular").value;
  const pin = document.getElementById("pin").value;

  if (!titular || !id || !/^\d{4}$/.test(pin)) {
      alert("Datos inválidos. Verifica los campos.");
      return;
  }

  const numeroCuenta = Date.now().toString();
  const nuevaCuenta = { numeroCuenta, titular, id, saldo: 0, pin, movimientos: [] };

  const tx = db.transaction(["cuentas"], "readwrite");
  const store = tx.objectStore("cuentas");
  store.add(nuevaCuenta);

  tx.oncomplete = function () { 
      alert(`Cuenta creada con éxito. Número: ${numeroCuenta}`);
      document.getElementById("nombre-titular").value = "";
      document.getElementById("id-titular").value = "";
      document.getElementById("pin").value = "";
  };

  tx.onerror = function () {
      alert("Error al crear la cuenta");
  };
}


// Consignar dinero en una cuenta
function consignarDinero() {
    const numeroCuenta = document.getElementById("numero-cuenta-consignar").value;
    const monto = parseFloat(document.getElementById("monto-consignar").value);

    if (!numeroCuenta || monto <= 0) {
    alert("Datos inválidos. Verifica los campos.");
    return;
    }

    const tx = db.transaction(["cuentas"], "readwrite");
    const store = tx.objectStore("cuentas");
    const request = store.get(numeroCuenta);

    request.onsuccess = function () {
    const cuenta = request.result;

    if (!cuenta) {
        alert("Cuenta no encontrada");
        return;
    }

    cuenta.saldo += monto;
    cuenta.movimientos.push(`Consignación de $${monto}`);

    store.put(cuenta);

    tx.oncomplete = function () {
        alert("Dinero consignado con éxito");
        document.getElementById("numero-cuenta-consignar").value = "";
        document.getElementById("monto-consignar").value = "";
        };
    };

    request.onerror = function () {
    alert("Error al consignar dinero");
        };
    }

// Retirar dinero de una cuenta
function retirarDinero() {
    const numeroCuenta = document.getElementById("numero-cuenta-retirar").value;
    const monto = parseFloat(document.getElementById("monto-retirar").value);
    const pin = document.getElementById("pin-retirar").value;

    if (!numeroCuenta || monto <= 0 || !/^\d{4}$/.test(pin)) {
    alert("Datos inválidos. Verifica los campos.");
    return;
    }

    const tx = db.transaction(["cuentas"], "readwrite");
    const store = tx.objectStore("cuentas");
    const request = store.get(numeroCuenta);

    request.onsuccess = function () {
    const cuenta = request.result;

    if (!cuenta) {
        alert("Cuenta no encontrada");
        return;
    }

    if (cuenta.pin !== pin) {
        alert("PIN incorrecto");
        return;
    }

    if (cuenta.saldo < monto) {
        alert("Saldo insuficiente");
        return;
    }

    cuenta.saldo -= monto;
    cuenta.movimientos.push(`Retiro de $${monto}`);

    store.put(cuenta);

    tx.oncomplete = function () {
        alert("Dinero retirado con éxito");
        document.getElementById("numero-cuenta-retirar").value = "";
        document.getElementById("monto-retirar").value = "";
        document.getElementById("pin-retirar").value = "";
        };
    };

    request.onerror = function () {
    alert("Error al retirar dinero");
    };
}

// Pagar un servicio
function pagarServicio() {
  const numeroCuenta = document.getElementById("numero-cuenta-pagar").value;
  const monto = parseFloat(document.getElementById("monto-servicio").value);
  const servicio = document.getElementById("servicio").value;

  if (!numeroCuenta || monto <= 0 || !servicio) {
    alert("Datos inválidos. Verifica los campos.");
    return;
  }

  const tx = db.transaction(["cuentas"], "readwrite");
  const store = tx.objectStore("cuentas");
  const request = store.get(numeroCuenta);

  request.onsuccess = function () {
    const cuenta = request.result;

    if (!cuenta) {
      alert("Cuenta no encontrada");
      return;
    }

    if (cuenta.saldo < monto) {
      alert("Saldo insuficiente");
      return;
    }

    cuenta.saldo -= monto;
    cuenta.movimientos.push(`Pago de ${servicio} por $${monto}`);

    store.put(cuenta);

    tx.oncomplete = function () {
      alert("Servicio pagado con éxito");
      document.getElementById("numero-cuenta-pagar").value = "";
      document.getElementById("monto-servicio").value = "";
      document.getElementById("servicio").value = "";
    };
  };

  request.onerror = function () {
    alert("Error al pagar el servicio");
  };
}

// Mostrar los movimientos de una cuenta
function mostrarMovimientos() {
  const numeroCuenta = document.getElementById("numero-cuenta-movimientos").value;

  if (!numeroCuenta) {
    alert("Ingrese un número de cuenta válido");
    return;
  }

  const tx = db.transaction(["cuentas"], "readonly");
  const store = tx.objectStore("cuentas");
  const request = store.get(numeroCuenta);

  request.onsuccess = function () {
    const cuenta = request.result;

    if (!cuenta) {
      alert("Cuenta no encontrada");
      return;
    }

    const listaMovimientos = document.getElementById("lista-movimientos");
    listaMovimientos.innerHTML = "";

    cuenta.movimientos.forEach((movimiento) => {
      const li = document.createElement("li");
      li.textContent = movimiento;
      listaMovimientos.appendChild(li);
    });
  };

  request.onerror = function () {
    alert("Error al obtener los movimientos");
  };
}

// Inicializar la base de datos al cargar la página
iniciarBaseDeDatos();
