/* ============================================================
   Actividad 1 - Carrito de la compra AgoodShop
   DAW - Desarrollo Web en Entorno Cliente
   ============================================================ */


/* ---------- CLASE CARRITO ----------
   Esta clase solo guarda los datos y hace las cuentas.
   No usa document ni nada del HTML, como pide el enunciado. */

class Carrito {

  constructor(productos, moneda) {
    this.moneda = moneda;
    this.lineas = [];

    // Me guardo cada producto con mis propios nombres de propiedades
    // y empiezo todas las unidades a 0
    for (let i = 0; i < productos.length; i++) {
      this.lineas.push({
        sku: productos[i].SKU,
        nombre: productos[i].title,
        precio: parseFloat(productos[i].price), // la API manda el precio como texto
        unidades: 0
      });
    }
  }

  // Busca un producto por su sku (si no lo encuentra devuelve undefined)
  buscarProducto(sku) {
    return this.lineas.find(linea => linea.sku === sku);
  }

  actualizarUnidades(sku, unidades) {
    const linea = this.buscarProducto(sku);
    // No dejo que haya unidades negativas
    if (unidades < 0) {
      unidades = 0;
    }
    linea.unidades = unidades;
  }

  // Devuelve el sku y las unidades elegidas (como el ejemplo del PDF)
  obtenerInformacionProducto(sku) {
    const linea = this.buscarProducto(sku);
    return {
      sku: linea.sku,
      title: linea.nombre,
      price: linea.precio,
      quantity: linea.unidades
    };
  }

  // Precio x unidades de un producto
  calcularSubtotal(sku) {
    const linea = this.buscarProducto(sku);
    return linea.precio * linea.unidades;
  }

  // Devuelve solo los productos con unidades y el total de todo
  obtenerCarrito() {
    let total = 0;
    const products = [];

    for (const linea of this.lineas) {
      if (linea.unidades > 0) {
        products.push(this.obtenerInformacionProducto(linea.sku));
        total = total + this.calcularSubtotal(linea.sku);
      }
    }

    return {
      total: total.toFixed(2),
      currency: this.moneda,
      products: products
    };
  }
}


/* ---------- PARTE DEL DOM ---------- */

const listaProductos = document.getElementById("lista-productos");
const resumenCarrito = document.getElementById("resumen-carrito");
const precioTotal = document.getElementById("precio-total");
const mensaje = document.getElementById("mensaje");

let miCarrito; // aquí guardaré el carrito cuando lleguen los datos

// Pone el número con 2 decimales y el símbolo de la moneda
function formatoPrecio(cantidad) {
  return cantidad.toFixed(2) + miCarrito.moneda;
}

// Crea una fila de la tabla por cada producto (solo se hace una vez al cargar)
function crearListado() {
  for (const linea of miCarrito.lineas) {
    const fila = document.createElement("tr");

    // Columna del nombre y la referencia
    const tdNombre = document.createElement("td");
    tdNombre.innerHTML = "<strong>" + linea.nombre + "</strong><br><small>REF: " + linea.sku + "</small>";

    // Columna de cantidad con los botones - y +
    const tdCantidad = document.createElement("td");
    const botonRestar = document.createElement("button");
    botonRestar.textContent = "-";
    const spanUnidades = document.createElement("span");
    spanUnidades.id = "unidades-" + linea.sku; // le pongo id para encontrarlo luego
    spanUnidades.textContent = linea.unidades;
    const botonSumar = document.createElement("button");
    botonSumar.textContent = "+";
    tdCantidad.append(botonRestar, spanUnidades, botonSumar);

    // Columna del precio por unidad
    const tdPrecio = document.createElement("td");
    tdPrecio.textContent = formatoPrecio(linea.precio);

    // Columna del total de esa línea
    const tdSubtotal = document.createElement("td");
    tdSubtotal.id = "subtotal-" + linea.sku;
    tdSubtotal.textContent = formatoPrecio(0);

    // Eventos de los botones
    botonRestar.addEventListener("click", function () {
      miCarrito.actualizarUnidades(linea.sku, linea.unidades - 1);
      refrescar(linea.sku);
    });
    botonSumar.addEventListener("click", function () {
      miCarrito.actualizarUnidades(linea.sku, linea.unidades + 1);
      refrescar(linea.sku);
    });

    fila.append(tdNombre, tdCantidad, tdPrecio, tdSubtotal);
    listaProductos.appendChild(fila);
  }
}

// Cuando cambia un producto actualizo su fila y el cuadro del total
function refrescar(sku) {
  const info = miCarrito.obtenerInformacionProducto(sku);
  document.getElementById("unidades-" + sku).textContent = info.quantity;
  document.getElementById("subtotal-" + sku).textContent = formatoPrecio(miCarrito.calcularSubtotal(sku));

  pintarResumen();
}

// Vuelvo a pintar el cuadro gris de la derecha
function pintarResumen() {
  const datos = miCarrito.obtenerCarrito();
  resumenCarrito.innerHTML = ""; // primero lo vacío

  for (const producto of datos.products) {
    const li = document.createElement("li");
    li.innerHTML = "<span>" + producto.quantity + " x " + producto.title + "</span>" +
                   "<span>" + producto.quantity + " x " + formatoPrecio(producto.price) + "</span>";
    resumenCarrito.appendChild(li);
  }

  precioTotal.textContent = datos.total + datos.currency;
}


/* ---------- PETICIÓN A LA API ----------
   Uso fetch con .then() para pedir los productos a mi api.php */

fetch("api.php")
  .then(function (respuesta) {
    if (!respuesta.ok) {
      throw new Error("la API ha respondido con error " + respuesta.status);
    }
    return respuesta.json();
  })
  .then(function (datos) {
    miCarrito = new Carrito(datos.products, datos.currency);
    crearListado();
    pintarResumen();
    mensaje.textContent = "";
  })
  .catch(function (error) {
    mensaje.textContent = "Error al cargar los productos: " + error.message;
    console.log(error);
  });
