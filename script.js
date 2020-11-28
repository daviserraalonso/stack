$(document).ready(function(){


	//FUNCION PARA CHECKEAR LOS INPUT DE ABRIRINCIDENCIAS
	checkActivos();



	// VARIABLE PARA RECOGER EL ULTIMO ID DE INCIDENCIA
	var idIncidencia;


	


	// llenamos los select con articulos al abrir una actuación
	getArticulos();
	
	
	/* MOSTRAR SIEMPRE LAS INCIDENCIAS EN SUPER */
	
	mostrarTodasIncidenciasSUPER();




	// CONTAMOS LAS INCIDENCIAS QUE HAY PENDIENTES
	contadorPendientes();


	// BOTON PARA AÑADIR MÁS SEGUIMIENTOS EN EL LISTADO DE SEGUIMIENTOS DE UNA INCIDENCIA
	$("#annadirMasSeguimientos").on("click", function(){
		$("#modalSeguimiento").modal("show");

		$("#codigoIncidenciaModal").val($("#listadoSeguimientos").find('td:eq(3)').text());

		//llenamos el select con los productos
		getArticulos();
	});


	var formData;


	// VALIDACION DE FORMULARIO ALTA INCIDENCIA
	$("#formularioAlta").submit(function(e){

		e.preventDefault();

	}).validate({
		rules:{
			categoria: {
				required: true,
			},
			tecnicos: {
				 required: true,
			},
			solicitantes: {
				required: true,
			},
			prioridad: {
				required: true,
			},
			nombre: {
				required: true,
			},
			telefono: {
				required:true,
			},
			asunto: {
				required:true,
			},
			mensaje: {
				required:true,
			}
		},
		highlight: function (element) {
	        $(element).removeClass('correcto').addClass('error');
	    },
	    unhighlight: function (element) {
	        $(element).removeClass('error').addClass('correcto');
	    },
      	errorElement: 'span',
      	errorClass: 'help-block',
      	errorPlacement: function (error, element) {
	        if (element.length) {
	            error.insertAfter(element);
	        }else{
	            error.insertAfter(element);
	        }
		},
		messages:{
			categoria:{required:"Debe seleccionar una categoria"},
			tecnicos:{required:"Seleccione tecnico"},
			solicitantes:{required:"Escriba el nombre"},
			prioridad:{required:"Seleccione una prioridad"},
			nombre:{required: "Debe escribir su nombre"},
			telefono:{required: "Introduzca un teléfono de contacto"},
			asunto:{required: "Introduzca un asunto"},
			mensaje:{required:"Indique su problema"}
		},
		submitHandler: function(form) {

			/* DATOS PARA EL SOLICITANTE */

			var nombreSolicitante = $('#nombreSolicitante').val();  
			var codigoSolicitante = $('#solicitante').find('option').filter(function() {
							 		return $.trim( $(this).text() ) === nombreSolicitante;
							  	}).attr('id');

			/* DATOS PARA EL CLIENTE */

			var nombreCliente = $('#nombreClienteAbrir').val();  
			var codigoCliente = $('#clientesAbrir').find('option').filter(function() {
							 		return $.trim( $(this).text() ) === nombreCliente;
							  	}).attr('id');

			// ESTABLECEMOS UN ASUNTO AL EMAIL
			var asunto = $("#asunto").val() + " " + "ST INTEGRA " + nombreCliente + "|" + $("#telefonoContacto").val();

			$("#asunto").val(asunto);



			// LLAMAMOS A LA FUNCIÓN SELECCIONAR TECNICOS LA CUAL ASIGNA 
			// LA INCIDENCIA Y ENVIA EMAIL
			seleccionarTecnicos(codigoCliente, codigoSolicitante);
	    }
	});







	// VALIDACION DE FORMULARIO ALTA USUARIOS

	$("#formularioAltaUsuario").validate({
		rules: {
			nif: {
				minlength: 3,
			},
			nombre: {
				 required: true,
			},
			contrasenna: {
				required: true,
				minlength: 3,
			},
			codv3Usuario: {
				minlength: 3,
			},
			telefonoUsuario: {
				required: true,
				maxlength: 12
			},
			direccionUsuario: {
				minlength: 3,
			},
			emailUsuario: {
				required:true,
			},
			tipoPago: { 
				valueNotEquals: "default" 
			},
			perfil: {
				valueNotEquals: "default"
			},

		},
		highlight: function (element) {
	        $(element).removeClass('correcto').addClass('error');
	    },
	    unhighlight: function (element) {
	        $(element).removeClass('error').addClass('correcto');
	    },
      	errorElement: 'span',
      	errorClass: 'help-block',
      	errorPlacement: function (error, element) {
	        if (element.length) {
	            error.insertAfter(element);
	        }else{
	            error.insertAfter(element);
	        }
		},
		messages:{
			nif:{required:"La longitud minima es de 3 caracteres"},
			nombre:{required:"Debe introducir un nombre"},
			contrasenna:{required:"Debe introducir una contraseñay la longitud minima es de 3 caracteres"},
			codv3Usuario:{required:"La longitud minima es de 3 caracteres"},
			telefonoUsuario:{required: "Debe escribir el Teléfono del cliente"},
			direccionUsuario:{required: "La longitud minima de la dirección es de 3 caracteres"},
			emailUsuario:{required: "Debe introducir un email de usuario"},
			tipoPago:{required:"Indique el tipo de pago del usuario"},
			perfil:{required:"Indique el perfil del usuario"}
		},
		submitHandler: function(form) {
			crearUsuarios();
	    }
	});





	// ASIGNAR FECHA ACTUAL A ABRIR INCIDENCIA
	var fecha = new Date();

	var fecha = new Date();
	var mes = fecha.getMonth()+1;
	var dia = fecha.getDate(); 
	var fechaActual = fecha.getFullYear() + '/' + (mes < 10 ? '0' : '') + mes + '/' + (dia < 10 ? '0' : '') + dia;
	var horaActual = fecha.getHours() + ':' + fecha.getMinutes();

	$("#fechaSolicitud").val(fechaActual + " " + horaActual);



	// AL CARGAR LA WEB QUE EL SIDEBAR ESTÉ OCULTO
	$(".page-wrapper").removeClass("toggled");

	//CERRRAR SIDEBAR
	$("#close-sidebar").click(function() {
	  $(".page-wrapper").removeClass("toggled");
	});
	
	$("#show-sidebar").click(function() {
	  $(".page-wrapper").addClass("toggled");
	});




	//DIBUJAR EN CANVAS DESDE PC
		const paintCanvas = document.querySelector( '.js-paint' );
		const context = paintCanvas.getContext( '2d' );
		context.lineCap = 'round';


		let x = 0, y = 0;
		let isMouseDown = false;

		const stopDrawing = () => { isMouseDown = false; }
		const startDrawing = event => {
		    isMouseDown = true;   
		   [x, y] = [event.offsetX, event.offsetY];  
		}
		const drawLine = event => {
		    if ( isMouseDown ) {
		        const newX = event.offsetX;
		        const newY = event.offsetY;
		        context.beginPath();
		        context.moveTo( x, y );
		        context.lineTo( newX, newY );
		        context.stroke();
		        //[x, y] = [newX, newY];
		        x = newX;
		        y = newY;
		    }
		}


		paintCanvas.addEventListener( 'mousedown', startDrawing );
		paintCanvas.addEventListener( 'mousemove', drawLine );
		paintCanvas.addEventListener( 'mouseup', stopDrawing );
		paintCanvas.addEventListener( 'mouseout', stopDrawing );


		$("#borrar").on('click', function(){
		  context.clearRect(0, 0, canvas.width, canvas.height);
		});


		// dibujar firma en movil
		var canvas = document.getElementById("canvas");

		// Set up touch events for mobile, etc
		canvas.addEventListener("touchstart", function (e) {
		        mousePos = getTouchPos(canvas, e);
		  var touch = e.touches[0];
		  var mouseEvent = new MouseEvent("mousedown", {
		    clientX: touch.clientX,
		    clientY: touch.clientY
		  });
		  canvas.dispatchEvent(mouseEvent);
		}, false);
		canvas.addEventListener("touchend", function (e) {
		  var mouseEvent = new MouseEvent("mouseup", {});
		  canvas.dispatchEvent(mouseEvent);
		}, false);
		canvas.addEventListener("touchmove", function (e) {
		  var touch = e.touches[0];
		  var mouseEvent = new MouseEvent("mousemove", {
		    clientX: touch.clientX,
		    clientY: touch.clientY
		  });
		  canvas.dispatchEvent(mouseEvent);
		}, false);

		// Get the position of a touch relative to the canvas
		function getTouchPos(canvasDom, touchEvent) {
		  var rect = canvasDom.getBoundingClientRect();
		  return {
		    x: touchEvent.touches[0].clientX - rect.left,
		    y: touchEvent.touches[0].clientY - rect.top
		  };
		}

		// evitamos que se mueva la pantalla cuando dibujamos

		// Prevent scrolling when touching the canvas
		document.body.addEventListener("touchstart", function (e) {
		  if (e.target == canvas) {
		    e.preventDefault();
		  }
		}, false);
		document.body.addEventListener("touchend", function (e) {
		  if (e.target == canvas) {
		    e.preventDefault();
		  }
		}, false);
		document.body.addEventListener("touchmove", function (e) {
		  if (e.target == canvas) {
		    e.preventDefault();
		  }
		}, false);




	/***************************************** función para obtener el precio del articulo *******************/
	var precio = 0;

	function getPrecio(){
		$(".articuloSeleccionado").each(function(){
			precio = $("#tablaArticulosNuevos").find('td:eq(2)').text();
		});
	return precio;
	}


/**************************************** COMPROBAMOS SI LOS VALORES SON NULOS O VACIOS ****************************/

	// HACEMOS LAS COMPROVACIONES PARA VER SI LOS VALORES SON NULOS O VACIOS
	// Y LOS PONEMOS A 0 EN ESE CASO
	if($("#manoObra").val() != ""){
		manoObra = $("#manoObra").val();
	}else{
		manoObra = 0;
	}

	if($("#desplazamiento").val() != ""){
		desplazamiento = $("#desplazamiento").val();
	}else{
		desplazamiento = 0;
	}

	/******************************** COMPROBAMOS QUE LOS CAMPOS HAYAN CAMBIADO **************************************/

	$("#precio").on("change", function(){
		calcularTotal($("#precio").val(), manoObra, desplazamiento);
	});
	


	$("#manoObra").on("change", function(){

		calcularTotal($("#precio").val(), manoObra, desplazamiento);
	});


	$("#desplazamiento").on("change", function(){
		calcularTotal($("#precio").val(), manoObra, desplazamiento);
	});


	/********************************* AÑADIR SEGUIMIENTO SI UNA INCIDENCIA NO TIENE NINGUNO *************************/

	$("#seguimientoNuevo").on("click", function(){
		
		var canvas = document.querySelector( '.js-paint' );
    	var context = canvas.getContext('2d');

    	var fecha = new Date();

    	// OBTENEMOS IMAGEN DEL CANVAS
    	var dataURL = canvas.toDataURL();
    	var codigo_incidencia = $("#codigoIncidenciaSeguimientoNuevo").val();


    	var fechaSeguimiento = fecha.getDate() + "/" + (fecha.getMonth()+1) + "/" + fecha.getFullYear();

    	// fecha transformada para el insert en php, ya que con la otra fecha provoca error
    	var fechaSeguimientoInsert = fecha.getFullYear()+"-"+"0"+(fecha.getMonth()+1)+"-"+fecha.getDate();

    	var mensaje = $("#cuerpoSeguimiento").val();

    	var token = $("#token").val();

    	var facturable = 0;
    	var presupuesto = 0;
    	var conforme = 0;
    	var manoObra = $("#manoObra").val();
    	var desplazamiento = $("#desplazamiento").val();


    	var total = $("#total").val();
    	
    	var articulo = 0;

    	var nombreArticulo = $("#nombreArticulo").val();
		articulo = $('#articulos').find('option').filter(function() {
				return $.trim( $(this).text() ) === nombreArticulo;
			}).attr('id');


		//preguntamos si está vacio el campo del mensaje
		// si está vacio decimos que sea required

		if($("#cuerpoSeguimiento").val() == ""){
			alert("Debe introducir un mensaje de actuación");
		}



    	//PREGUNTAMOS SI FACTURABLE ES 1 O 0 

    	if($("#facturable").val() == 1){
    		facturable = 1;
    	}

    	//PREGUNTAMOS SI ES UN PRESUPUESTO 

    	if($("#presupuesto").val() == 1){
    		presupuesto = 1;
    	}

    	// PREGUNTAMOS SI ESTA CONFORME

    	if($("#conforme").val() == 1){
    		conforme = 1;
    	}


    	$.ajax({
    		url: "/nuevoSeguimiento",
    		type: "POST",
    		data: {
    			"fechaSeguimiento": fechaSeguimiento,
    			"fechaTransformada": fechaSeguimientoInsert,
    			"mensaje": mensaje,
    			"imagenCanvas": dataURL,
    			"codigo_incidencia": codigo_incidencia,
    			"facturable": facturable,
    			"presupuesto": presupuesto,
    			"conforme": conforme,
    			"articulo": articulo,
    			"manoObra": manoObra,
    			"desplazamiento": desplazamiento,
    			"total": total,
    			"_token": token
    		},
    		success: function(data){
    			$("#seguimientoCorrecto").show();
    			$("#seguimientoCorrecto").append("Seguimiento creado");

    			window.location.href = '/mostrarActuaciones/'+codigo_incidencia;
    		},
    		error: function(xhr){
	            var data = xhr.responseJSON;
	            console.log("Error: "+data);
	        }
    	});
	});



	/************************************* AÑADIR ACTUACIONES DESDE PAGINA MOSTRAR INCIDENCIAS ************************/

	// BOTON CON ICONO
	$(".seguimiento").on("click", function(){
		var canvas = document.querySelector( '.js-paint' );
    	var context = canvas.getContext('2d');

    	var fecha = new Date();

    	// OBTENEMOS IMAGEN DEL CANVAS
    	var dataURL = canvas.toDataURL();
    	var codigo_incidencia = $.trim($("#tablaIncidenciasTotales").find('td:eq(0)').text());

    	var fechaSeguimiento = fecha.getDate() + "/" + (fecha.getMonth()+1) + "/" + fecha.getFullYear();

    	// fecha transformada para el insert en php, ya que con la otra fecha provoca error
    	var fechaSeguimientoInsert = fecha.getFullYear()+"-"+"0"+(fecha.getMonth()+1)+"-"+fecha.getDate();

    	var mensaje = $("#textoSeguimiento").val();

    	$.ajax({
    		url: "setSeguimiento/",
    		type: "GET",
    		data: {
    			"imagenCanvas": dataURL,
    			"codigo_incidencia": codigo_incidencia,
    			"fechaSeguimiento": fechaSeguimiento,
    			"fechaTransformada": fechaSeguimientoInsert,
    			"mensaje": mensaje
    		},
    		success: function(data){
    			$("#seguimientoCorrecto").show();
    			$("#seguimientoCorrecto").append("Seguimiento creado");
    		},
    		error: function(xhr){
	            var data = xhr.responseJSON;
	            console.log(data);
	        }
    	});
	});

	/****************************** AÑADIR SEGUIMIENTOS MAS ACTUACIONES *****************************/

	$("#seguimientoHome").on("click", function(){
		var canvas = document.querySelector( '.js-paint' );
    	var context = canvas.getContext('2d');

    	var fecha = new Date();

    	// OBTENEMOS IMAGEN DEL CANVAS
    	var dataURL = canvas.toDataURL();
    	var codigo_incidencia = $("#codigoIncidenciaSeguimientoNuevo").val();


    	var fechaSeguimiento = fecha.getDate() + "/" + (fecha.getMonth()+1) + "/" + fecha.getFullYear();

    	// fecha transformada para el insert en php, ya que con la otra fecha provoca error
    	var fechaSeguimientoInsert = fecha.getFullYear()+"-"+"0"+(fecha.getMonth()+1)+"-"+fecha.getDate();

    	var mensaje = $("#textoSeguimiento").val();

    	//OBTENEMOS LA INCIDENCIA
    	var incidencia = $("#listadoSeguimientos").find("td:eq(3)").text();

    	// OBTENEMOS EL ARTICULO
    	var articulo = $("#tablaArticulos").find("td:eq(0)").text();


    	var token = $("#token").val();

    	var facturable = 0;
    	var presupuesto = 0;
    	var conforme = 0;
    	var manoObra = 0;
    	var desplazamiento = 0;


    	var total = $("#total").val();
    	
    	articulo = $("#tablaArticulos").find("td:eq(0)").text();


    	//PREGUNTAMOS SI FACTURABLE ES 1 O 0 

    	if($("#facturable").val() == 1){
    		facturable = 1;
    	}

    	//PREGUNTAMOS SI ES UN PRESUPUESTO 

    	if($("#presupuesto").val() == 1){
    		facturable = 1;
    	}

    	// PREGUNTAMOS SI ESTA CONFORME

    	if($("#conforme").val() == 1){
    		facturable = 1;
    	}

    	$.ajax({
    		url: "/setActuacion",
    		type: "POST",
    		data: {
    			"incidencia": incidencia,
    			"fechaSeguimiento": fechaSeguimiento,
    			"fechaTransformada": fechaSeguimientoInsert,
    			"mensaje": mensaje,
    			"imagenCanvas": dataURL,
    			"codigo_incidencia": codigo_incidencia,
    			"facturable": facturable,
    			"presupuesto": presupuesto,
    			"conforme": conforme,
    			"articulo": articulo,
    			"manoObra": manoObra,
    			"desplazamiento": desplazamiento,
    			"total": total,
    			"_token": token
    		},
    		success: function(data){
    			$("#seguimientoCorrecto").show();
    			$("#seguimientoCorrecto").append("Seguimiento creado");
    			$("#listadoSeguimientos").load(window.location + " #listadoSeguimientos");
    		},
    		error: function(xhr){
	            var data = xhr.responseJSON;
	            console.log("error: " + data);
	        }
    	});
	});

	$('.select2').select2();

	//LLAMAMOS A LA FUNCIÓN PARA CREAR USUARIO

	$("#crearUsuario").on("click", function(e){
		e.preventDefault();

		crearUsuarios();
	});



});//FIN JQUERY



// EVENTO SI CAMBIA EL SELECT DE ESTADO DE INCIDENCIA EN EL HOME DEL USUARIO

$(".estadoIncidencia").on("change", function(){
	// se usa closest para acceder al elemento padre de donde estamos generando el evento.
	var incidencia = $(this).closest('tr').find('td:eq(0)').text();
	var estado = $(this).find('option:selected').val();


	actualizarEstado(estado, incidencia);
});




// MOSTRAR TODAS INCIDENCIAS EN SUPERUSUARIO

	function mostrarTodasIncidenciasSUPER(){
		

		$.ajax({
		    url: '/listarIncidencias',
		    type: 'GET',
		    success:function (data) {
				

		    	//limpiamos toda la tabla antes de nada
		    	$("#tablaIncidenciasTotalesSUPER tbody tr").empty();

		    	// recorremos los datos y creamos la tabla dinámica
		    	for(var item of data){

		    		//CAMBIAMOS EL FORMATO DE FECHA
		    		let fechaHora = item.fecha_solicitud;

		    		let dia = fechaHora.substring(8,10);
		    		let mes = fechaHora.substring(5,7);
		    		let anno = fechaHora.substring(0,4);
		    		let hora = fechaHora.substring(11,18);

		    		let fechaTransformada = dia + "-" + mes + "-" + anno + " " + hora;



		    		let optionValue = '';   
	    
		            switch(item.asignadoA){
		                case null:
		                    optionValue = `<option value="0" selected>Sin asignar</option>`;
		                break;
		                case 0:
		                    optionValue = `<option value="0" selected>Jose Luís</option>`;
		                break;
		                case 1:
		                    optionValue = `<option value="1" selected>Fernando Reyes</option>`;
		                break;
		                case 2:
		                    optionValue = `<option value="2" selected>Victor Baena</option>`;
		                break;
		                case 3:
		                    optionValue = `<option value="3" selected>Fernando Burgos</option>`;
		                break;
		                case 4:
		                    optionValue = `<option value="4" selected>Roberto Quero</option>`;
		                break;
		                case 5:
		                    optionValue = `<option value="5" selected>David</option>`;
		                break;
		            }  

		    		$("#tablaIncidenciasTotalesSUPER tbody").append(`
						<tr>
							<td>${item.cod_incidencia}</td>
							<td>${fechaTransformada}</td>
							<td>${item.asunto}</td>
							<td>${item.categoria}</td>
							<td>
								<select class="tecnicos">
									${optionValue}
								</select>
							</td>
							<td>
								<select class="tecnicos">
									<option value="" selected>null</option>
										<option value="0">Jose Luís</option>
										<option value="1">Fernando Reyes</option>
										<option value="2">Victor Baena</option>
										<option value="3">Fernando Burgos</option>
										<option value="4">Roberto Quero</option>
										<option value="5">David Serrano</option>
								</select>
							</td>
							<td>${item.nombre}</td>
							<td>${item.prioridad}</td>
							<td><a href='/asignarIncidencia/${item.cod_incidencia}' class='btn btn-danger'><i class='fas fa-1x fa-hammer asignar'></i></td>
							<td>
								<select class='estado'>"
									<option>${item.estado}</option>
									<option value="en seguimiento">En seguimiento</option>
									<option value="finalizada">Finalizada</option>
								</select>
							</td>
							<td><a href="/mostrarActuaciones/${item.cod_incidencia}" class='btn btn-danger'><i class="fas fa-1x fa-clipboard seguimiento"></i></button></td></a>
							<td><button class="btn btn-danger visualizar" onclick='mostrarDatosIncidencia(${item.cod_incidencia})' data-toggle="modal" data-target="#modalIncidencia"><i class="fas fa-1x fa-eye"></i></button></td>
						</tr>
	    			`);

				}// FIN FOR


			},
		    error:function(xhr, ajaxOptions, thrownError){
		        $("#error").append(xhr.status);
		        console.log(thrownError);
		    }

		});
	}





// FUNCIÓN PARA CONTAR LAS INCIDENCIAS PENDIENTES

function contadorPendientes(){
		$.ajax({
			url: '/getIncidenciasPendientes',
			type: 'GET',
			success: function(data){
				$(".contadorPendientes").append("Incidencias Pendientes: "+data);
			},
			error: function(jqXHR, textStatus, errorThrown ) {
			  if (jqXHR.status === 0){
			    console.log('Not connect: Verify Network.');
			}else if (jqXHR.status == 404){
				console.log('Requested page not found [404]');
			}else if (jqXHR.status == 500){
				console.log('Internal Server Error [500].');
			}else if (textStatus === 'parsererror'){
				console.log('Requested JSON parse failed.');
			}else if (textStatus === 'timeout'){
				console.log('Time out error.');
			}else if (textStatus === 'abort'){
				console.log('Ajax request aborted.');
			}
		}
	});
}






// EVENTO PARA VISUALIZAR LOS DETALLES DE LA INCIDENCIA

$(".visualizar").on("click", function(){

	//CONTRIM ELIMINAMOS LOS ESPACIOS EN BLANCO
	var codigoIncidencia = $.trim($(this).closest('tr').find('td:eq(0)').text());

	mostrarDatosIncidencia(codigoIncidencia);
});




//LLAMAMOS A LA FUNCIÓN PARA ACTUALIZAR LA FECHA RESPUESTA

$(".fechaRespuesta").on("click", function(e){
	e.preventDefault();
	
	actualizarFechaRespuesta()

});





// COMPROBAR CHECK CALENDARIOS ACTIVOS
$("#calendarioTodos").on("click", function(){
	if($(this).is(":checked")){
		$("#calendarioTodosIframe").show();
		$("#calendarioReyesIframe").hide();
		$("#calendarioBurgosIframe").hide();
		$("#calendarioVictorIframe").hide();

		// MOSTRAMOS LOS FORMULARIOS
		$("#formularioCalendario").show();
		$("#formularioCalendarioFernandoReyes").hide();
		$("#formularioCalendarioFernandoBurgos").hide();
		$("#formularioCalendarioVictor").hide();
	}else{
		$("#calendarioReyesIframe").show();
		$("#calendarioBurgosIframe").show();
		$("#calendarioVictorIframe").show();

		// MOSTRAMOS LOS FORMULARIOS
		$("#formularioCalendario").show();
		$("#formularioCalendarioFernandoReyes").show();
		$("#formularioCalendarioFernandoBurgos").show();
		$("#formularioCalendarioVictor").show();
	}

});

$("#calendarioVictor").on("click", function(){
	if(!$(this).is(":checked")){
		$("#calendarioVictorIframe").hide();
		$("#formularioCalendarioVictor").hide();
	}else{
		$("#calendarioVictorIframe").show();
		$("#formularioCalendarioVictor").show();

		$("#calendarioReyesIframe").hide();
		$("#calendarioBurgosIframe").hide();

		// MOSTRAMOS LOS FORMULARIOS
		$("#calendarioTodosIframe").hide();
		$("#formularioCalendario").hide();
		$("#formularioCalendarioFernandoReyes").hide();
		$("#formularioCalendarioFernandoBurgos").hide();
	}
});

$("#calendarioReyes").on("click", function(){
	if($(this).is(":checked")){
		$("#calendarioReyesIframe").show();
		$("#formularioCalendarioFernandoReyes").show();

	}else{
		$("#calendarioReyesIframe").hide();
		$("#formularioCalendarioFernandoReyes").hide();
	}
});

$("#calendarioBurgos").on("click", function(){
	if($(this).is(":checked")){
		$("#formularioCalendarioFernandoBurgos").show();
		$("#calendarioBurgosIframe").show();
	}else{
		$("#formularioCalendarioFernandoBurgos").hide();
		$("#calendarioBurgosIframe").hide();
	}
});






// ASIGNAMOS LA INCIDENCIA DESDE EL CALENDARIO CUANDO VIAJAMOS DESDE EL EMAIL

$("#asignacion").on("click", function(){
	asignarIncidenciaEmail();
});








// FUNCIÓN PARA BUSCAR POR CLIENTE
$("#nombreCliente").on("change", function(){
	var nombreCliente = $('#nombreCliente').val();  
	var codigoCliente = $('#clientes').find('option').filter(function() {
					return $.trim( $(this).text() ) === nombreCliente;
				}).attr('id');

	busquedaPorCliente(codigoCliente);
});





// LLAMAMOS A LA FUNCIÓN PARA MOSTRAR TODAS LAS INCIDENCIAS

$("#todasIncidencias").on('click', function(){
	if($("#todasIncidencias").is(":checked")){
		mostrarTodasIncidencias();
	}else{
		mostrarIncidencias();
	}
});

	










// ESTABLECEMOS LA FECHA ACTUAL EN LA ACTUACION
var fecha = new Date();

var mes = fecha.getMonth()+1;
var dia = fecha.getDate();
var anno = fecha.getFullYear();


$("#fechaActuacion").val(dia+"-"+"0"+mes+"-"+anno);



// FUNCION PARA IMPRIMIR LA ACTUACION
$("#imprimir").on('click', function(){
	var respuesta = confirm("¿desea imprimir el albaran con precio o sin él?");
	if(respuesta){
		window.print();
	}else{
		window.print();
	}
});





//FUNCIÓN PARA ESTABLECER LOS CHECK ACTIVOS EN ABRIRINCIDENCIA

function checkActivos(){
	$(".checkAbrirIncidencia").each(function(){
		this.checked = true;
	});
}



// FUNCIÓN PARA DETECTAR LOS CHECKBOX DE LOS TÉCNICOS SELECCIONADOS PARA ENVIAR EMAIL SOLO A ESOS TÉCNICOS.

function seleccionarTecnicos(codigoCliente, codigoSolicitante){


	var contador = 0;
	var tecnicoSeleccionado = "";

	// variable para saber los técnicos seleccionado
	var tecnicosSeleccionados = new Array();


	$('input[type=checkbox]:checked').each(function() {
	    if($(this).is(":checked")){

	    	contador++;

	    	tecnicoSeleccionado = $(this).val();

	    	// si se seleccionan varios
	    	tecnicosSeleccionados.push($(this).val());
	    }
	});



	

	/* Si solo hay un técnico seleccionado,
	* se envía el email a ese técnico y se le asigna la incidencia,
	* también se genera la incidencia.
	* si no se envia un email a los seleccionados
	* Si se seleccionan varios, se envía email a esos técnicos
	*/
	
	if(contador == 1){

		/*
		* Tenemos que crear un formData, para enviar el archivo adjunto
		* Una vez creado, debemos añadirle todos los campos del formulario
		* Así los recibiremos en el controlador.
		*/

		var fechaSolicitud = $("#fechaSolicitud").val();
		var categoria = $("#categoria").val();
		var prioridad = $("#Abrirprioridad").val();
		var telefono = $("#telefonoContacto").val();
		var asunto = $("#asunto").val();
		var mensaje = $("#cuerpoMensaje").val();
		var token = $("#token").val();
		var archivo = $('input[type="file"]')[0];
		var nombreArchivo = $("#adjunto").val();
		var datosFormulario = new FormData();

		datosFormulario.append('adjunto[]', archivo);
		datosFormulario.append('fechaSolicitud', fechaSolicitud);
		datosFormulario.append('categoria', categoria);
		datosFormulario.append('prioridad', prioridad);
		datosFormulario.append('asunto', asunto);
		datosFormulario.append('mensaje', mensaje);
		datosFormulario.append('solicitante', codigoSolicitante);
		datosFormulario.append('cliente', codigoCliente);
		datosFormulario.append('tecnico', tecnicoSeleccionado);
		datosFormulario.append('telefono', telefono);


		$.ajax({
			url: "/setIncidencia",
			type: "POST",
			headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
			contentType: false,
            processData: false,   
            cache: false, 
			data: datosFormulario,
			success: function(data){
				$("#correcto").show();
	    		$("#correcto").append("Incidencia Generada");

	    		console.log(data);
	    		console.log(datosFormulario);

				//UNA VEZ CREADA LA INCIDENCIA ENVIAMOS EL EMAIL DESDE EL CONTROLADOR Y REDIRECCIONAMOS A:
	    		//window.location.href = "/home";
			},
			error: function(xhr){
	            var data = xhr.responseJSON;
	            console.log("Error: "+xhr.status);
				$("#error").show();
	            $("#error").append("Ha ocurrido un error al crear la incidencia -> Código de Error: " + xhr.status);
	        }
		});	

	}// fin if


	// SI SELECCIONAMOS VARIOS TECNICOS
	if(contador > 1){

		var fechaSolicitud = $("#fechaSolicitud").val();
		var categoria = $("#categoria").val();
		var prioridad = $("#Abrirprioridad").val();
		var telefono = $("#telefonoContacto").val();
		var asunto = $("#asunto").val();
		var mensaje = $("#cuerpoMensaje").val();
		var token = $("#token").val();
		var archivo = $("#adjunto").prop('files')[0];
		var nombreArchivo = $("#adjunto").val();
		var formData = new FormData();

		formData.append('file', archivo);
		formData.append('fechaSolicitud', fechaSolicitud);
		formData.append('categoria', categoria);
		formData.append('prioridad', prioridad);
		formData.append('asunto', asunto);
		formData.append('mensaje', mensaje);
		formData.append('solicitante', codigoSolicitante);
		formData.append('cliente', codigoCliente);
		formData.append('tecnicos', JSON.stringify(tecnicosSeleccionados));
		formData.append('telefono', telefono);

		$.ajax({
			url: "/setIncidenciaVarios",
			type: "POST",
			headers: {'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
			contentType: false,
            processData: false,   
            cache: false, 
			data: formData,
			success: function(data){
				$("#correcto").show();
	    		$("#correcto").append("Incidencia Generada");
	    		console.log(data);

				//UNA VEZ CREADA LA INCIDENCIA ENVIAMOS EL EMAIL DESDE EL CONTROLADOR Y REDIRECCIONAMOS A:
	    		window.location.href = "/home";
			},
			error: function(xhr){
	            var data = xhr.responseJSON;
	            console.log("Error: "+xhr.status);
	            $("#mensaje").append(xhr.status);
	        }
		});	
	}
}








// FUNCIÓN PARA ASIGNAR INCIDENCIA DESDE EMAIL CUANDO NOS ENVIA AL CALENDARIO

function asignarIncidenciaEmail(){
	var token = $("#token").val();
	var url = window.location.href;

	console.log(url);

	/*$.ajax({
	    url: '/asignarIncidenciaEmail',
	    type: 'GET',
	    success:function (data) {
	    	$("#asignadoEmail").show();
	    	$("#asignadoEmail").append("Incidencia Asignada");
		},
	    error:function(xhr, ajaxOptions, thrownError){
	        $("#error").append(xhr.status);
	    }
	});*/
}








function completarCampos(cod_cliente){
	$.ajax({
	    url: '/getUsuarios',
	    type: 'GET',
	    dataType: 'json',
	    success:function (data) {
	    	for(var item of data){
	    		$("#clientes").append(`
	    				<option id="${item.cod_usuario}" value="${item.nombre}">${item.nombre}</option>
	    			`)   		

	    	}
		},
	    error:function(xhr, ajaxOptions, thrownError){
	        $("#error").append(xhr.status);
	    }
	});
}






function verIncidencia(cod_incidencia){
	$("#modalIncidencia").show();
	$.ajax({
	    url: 'getIncidencia/'+cod_incidencia,
	    type: 'GET',
	    success:function (data) {
	    	$("#cod_incidencia").val(data[0]["cod_incidencia"]);
	    	$("#fechaSolicitud").val(data[0]["fecha_solicitud"]);
	    	$("#fechaRespuesta").val(data[0]["fecha_respuesta"]);
	    	$("#categoria").val(data[0]["categoria"]);
	    	$("#asignado").val(data[0]["asignadoA"]);
	    	$("#solicitante").val(data[0]["solicitante"]);
	    	$("#prioridad").val(data[0]["prioridad"]);
	    	$("#prioridad").val(data[0]["prioridad"]);
	    	$("#asunto").val(data[0]["asunto"]);
	    	$("#cuerpo").val(data[0]["cuerpo"]);	


		},
	    error:function(xhr, ajaxOptions, thrownError){
	        console.log(xhr.status);
	    }
	});
}



// FUNCION PARA MOSTRAR LAS INCIDENCIAS SIN ASIGNAR

function mostrarIncidencias(){
	$.ajax({
	    url: '/mostrarIncidenciasSinAsignar',
	    type: 'GET',
	    success:function (data) {

	    	//limpiamos la tabla
	    	$("#tablaIncidenciasTotales tbody tr").remove();

	    	// recorremos los datos y creamos la tabla dinámica
	    	for(var item of data){


	    		console.log(item.fecha_solicitud);
	    		//CAMBIAMOS EL FORMATO DE FECHA
	    		let fechaHora = item.fecha_solicitud;

	    		let dia = fechaHora.substring(8,10);
	    		let mes = fechaHora.substring(5,7);
	    		let anno = fechaHora.substring(0,4);
	    		let hora = fechaHora.substring(11,18);

	    		let fechaTransformada = dia + "-" + mes + "-" + anno + " " + hora;


	    		$("#tablaIncidenciasTotales tbody").append(`
					<tr>
						<td>${item.cod_incidencia}</td>
						<td>${fechaTransformada}</td>
						<td>${item.asunto}</td>
						<td>${item.categoria}</td>
						<td>
							<select class='tecnicos'>
								<option value='0' class='asignado'>${item.asignadoA}</option>
								<option value='1'>Fernando Reyes</option>
								<option value='2'>Victor Baena</option>
								<option value='3'>Fernando Burgos</option>
								<option value='4'>Roberto Quero</option>
								<option value='5'>David Serrano</option>
								<option value=''></option>
							</select>
						</td>
						<td>${item.nombre}</td>
						<td>${item.prioridad}</td>
						<td><a href='/asignarIncidencia/${item.cod_incidencia}' class='btn btn-danger'><i class='fas fa-1x fa-hammer asignar'></i></td>
						<td>
							<select class='estado'>"
								<option>${item.estado}</option>
								<option value="en seguimiento">En seguimiento</option>
								<option value="finalizada">Finalizada</option>
							</select>
						</td>
						<td><a href='/mostrarActuaciones/${item.cod_incidencia}' class='btn btn-danger'><i class='fas fa-1x fa-clipboard seguimiento'></i></button></td></a>
					</tr>
    			`);
		    }

		    $(".estado").on("change", function(){
				var incidencia = $("#tablaIncidencias").find('td:eq(0)').text();
				var estado = $('.estado option').filter(':selected').val();

				//actualizarEstado(estado, incidencia);
			});


		},
	    error:function(xhr, ajaxOptions, thrownError){
	        $("#error").append(xhr.status);
	    }
	});
}







	


// FUNCION PARA MOSTRAR TODAS LAS INCIDENCIAS ASIGNADAS Y SIN ASIGNAR

function mostrarTodasIncidencias(){

	$.ajax({
	    url: '/listarIncidencias',
	    type: 'GET',
	    success:function (data) {

	    	//limpiamos toda la tabla antes de nada
	    	$("#tablaIncidenciasTotales tbody tr").empty();

	    	// recorremos los datos y creamos la tabla dinámica
	    	for(var item of data){

	    		//CAMBIAMOS EL FORMATO DE FECHA
	    		let fechaHora = item.fecha_solicitud;

	    		let dia = fechaHora.substring(8,10);
	    		let mes = fechaHora.substring(5,7);
	    		let anno = fechaHora.substring(0,4);
	    		let hora = fechaHora.substring(11,18);

	    		let fechaTransformada = dia + "-" + mes + "-" + anno + " " + hora;

	    		let optionValue = '';   
    
	            switch(item.asignadoA){
	                case null:
	                    optionValue = `<option value="0" selected>Sin asignar</option>`;
	                break;
	                case 0:
	                    optionValue = `<option value="0" selected>Jose Luís</option>`;
	                break;
	                case 1:
	                    optionValue = `<option value="1" selected>Fernando Reyes</option>`;
	                break;
	                case 2:
	                    optionValue = `<option value="2" selected>Victor Baena</option>`;
	                break;
	                case 3:
	                    optionValue = `<option value="3" selected>Fernando Burgos</option>`;
	                break;
	                case 4:
	                    optionValue = `<option value="4" selected>Roberto Quero</option>`;
	                break;
	                case 5:
	                    optionValue = `<option value="5" selected>David</option>`;
	                break;
	            }  

	    		$("#tablaIncidenciasTotales tbody").append(`
					<tr>
						<td>${item.cod_incidencia}</td>
						<td>${fechaTransformada}</td>
						<td>${item.asunto}</td>
						<td>${item.categoria}</td>
						<td>
							<select class="tecnicos">
								${optionValue}
							</select>
						</td>
						<td>
							<select class="tecnicosReasignar">
								<option value="" selected>null</option>
									<option value="0">Jose Luís</option>
									<option value="1">Fernando Reyes</option>
									<option value="2">Victor Baena</option>
									<option value="3">Fernando Burgos</option>
									<option value="4">Roberto Quero</option>
									<option value="5">David Serrano</option>
							</select>
						</td>
						<td>${item.nombre}</td>
						<td>${item.prioridad}</td>
						<td><a href='/asignarIncidencia/${item.cod_incidencia}' class='btn btn-danger'><i class='fas fa-1x fa-hammer asignar'></i></td>
						<td>
							<select class='estado'>"
								<option>${item.estado}</option>
								<option value="en seguimiento">En seguimiento</option>
								<option value="finalizada">Finalizada</option>
							</select>
						</td>
						<td><a href="/mostrarActuaciones/${item.cod_incidencia}" class='btn btn-danger'><i class="fas fa-1x fa-clipboard seguimiento"></i></button></td></a>
					</tr>
    			`);

    			// EVENTO SI CAMBIA EL SELECT DE ESTADO DE INCIDENCIA EN MOSTRAR INCIDENCIAS
				$(".estado").on("change", function(){

					// se usa closest para acceder al elemento padre de donde estamos generando el evento.
					var incidencia = $(this).closest('tr').find('td:eq(0)').text();
					var estado = $(this).find('option:selected').val();

					actualizarEstado(estado, incidencia);
				});


				$(".tecnicosReasignar").on("change", function(e){

					var cod_incidencia = $(this).closest("tr").find("td:eq(0)").text();
					var cod_tecnico = $(this).find('option:selected').val();

					cambiarTecnico(cod_incidencia, cod_tecnico);

				});



			}// FIN FOR

		},
	    error:function(xhr, ajaxOptions, thrownError){
	        $("#error").append(xhr.status);
	        console.log(thrownError);
	    }

	});
}













// FUNCION PARA REASIGNAR UNA INCIDENCIA A UN TECNICO SELECCIONANDO EN EL SELECT DE LA TABLA

function cambiarTecnico(cod_incidencia, cod_tecnico){

	var token = $("#token").val();

	$.ajax({
	    url: '/asignarReasignarATecnico/' + cod_incidencia + "/" + cod_tecnico,
	    type: 'POST',
	    data: {
        	"cod_incidencia": cod_incidencia,
        	"asignadoA": cod_tecnico,
        	"_token": token
    	},
	    success:function (data) {
	    	$("#mensaje").show();
	    	$("#mensaje").append("Incidencia Asignada");
		},
	    error:function(xhr, ajaxOptions, thrownError){
	        $("#error").append(xhr.status);
	    }
	});
}


// FUNCIÓN PARA OBTENER LOS ARTICULOS EN LA ACTUACION
function getArticulos(){

	$.ajax({
	    url: '/getArticulos',
	    type: 'GET',
	    success:function (data) {
	    	for(var item of data){
	    		$("#articulos").append(`
	    				<option id="${item.cod_articulo}" name="${item.PVP}" value="${item.descripcion}">${item.descripcion}</option>
	    			`)
	    	}

	    	$('#nombreArticulo').on("change", function(){
	    		var nombreArticulo = $(this).val();
	    		var pvp = $('#articulos').find('option').filter(function() {
						return $.trim( $(this).text() ) === nombreArticulo;
					}).attr('name');

	    		$("#precio").val(pvp);

		    	$("#total").val($("#precio").val());
	    	});
		},
	    error:function(xhr, ajaxOptions, thrownError){
	        $("#error").append(xhr.status);
	    }
	});
}






// FUNCIÓN PARA CALCULAR EL TOTAL DE LA ACTUACION


function calcularTotal(precio, manoObra, desplazamiento){

	var manoObra = $("#manoObra").val();
	var desplazamiento = $("#desplazamiento").val();

	// Aquí valido si hay un valor previo, si no hay datos, le pongo un cero "0".
    manoObra = (manoObra == null || manoObra == undefined || manoObra == "") ? 0 : manoObra;
    desplazamiento = (desplazamiento == null || desplazamiento == undefined || desplazamiento == "") ? 0 : desplazamiento;

	// TRANSFORMO A NUMEROS LAS VARIABLES Y LAS VUELVO A ASIGNAR
	precio = parseInt(precio);
	manoObra = parseInt(manoObra);
	desplazamiento = parseInt(desplazamiento);

	var resultado = (parseInt(precio) + parseInt(manoObra) + parseInt(desplazamiento));

	$("#total").val(resultado);
}


// FUNCION PARA ASIGNAR UNA INCIDENCIA A UN TECNICO HACIENDO CLICK EN EL ICONO

function asignarIncidencia(){
	var token = $("#token").val();
	var codIncidencia;

	codIncidencia = $.trim($("#tablaIncidenciasTotales").closest('tr').find('td:eq(0)').text());

	$.ajax({
	    url: '/asignarIncidencia/' + codIncidencia,
	    type: 'POST',
	    data: {
        	"codigo_incidencia": codIncidencia,
    	},
	    success:function (data) {
	    	$("#correcto").show();
	    	$("#correcto").append("Incidencia Asignada");
		},
	    error:function(xhr, ajaxOptions, thrownError){
	        $("#error").append(xhr.status);
	    }
	});
}


function mostrarDatosIncidencia(codigoIncidencia){

	
	// MOSTRAMOS LOS DATOS DE LA INCIDENCIA
	$.ajax({
		url: '/mostrarDetallesIncidencia',
		type: 'POST',
		data: { 
			"codigoIncidencia": codigoIncidencia,
			"_token": $("#token").val(),
		},
		success: function(data){
			$("#modalIncidencia").modal("show");

			console.log(data[0]);
			$("#cod_incidencia").val(data[0]["cod_incidencia"]);
			$("#fechaSolicitud").val(data[0]["fecha_solicitud"]);
			$("#fechaRespuesta").val(data[0]["fecha_respuesta"]);
			$("#categoria").val(data[0]["categoria"]);
			$("#asignado").val(data[0]["nombre"]);
			$("#solicitante").val(data[0]["nombre"]);
			$("#prioridad").val(data[0]["prioridad"]);
			$("#asunto").val(data[0]["asunto"]);
			$("#cuerpo").val(data[0]["cuerpo"]);

			
		},
		error: function(xhr, ajaxOptions, thrownError){
	        $("#error").append(xhr.status);
	        console.log(xhr.status);
	    }
	});

}




function mostraraActuaciones(cod_seguimiento){
	$(".seguimiento").on("click", function(){
		// con TRIM ELIMINAMOS LOS ESPACIOS EN BLANCO QUE PROVOCA Y LO ASIGNAMOS AL CAMPO
		$("#codigoIncidenciaModal").val($.trim($(this).closest('tr').find('td:eq(0)').text())).prop('disabled', true);
		$("#prioridadModal").val($.trim($(this).closest('tr').find('td:eq(5)').text()));
		$("#asuntoModal").val($.trim($(this).closest('tr').find('td:eq(2)').text()));
		$("#categoriaModal").val($.trim($(this).closest('tr').find('td:eq(3)').text()));

		// mostrar el modal con los datos de la incidencia
		$("#modalSeguimientoListado").modal("show");

		
	});
}






/***************************** FUNCIÓN PARA ACTUALIZAR EL ESTADO DE UNA INCIDENCIA **************/

function actualizarEstado(estado, codigo_incidencia){

	var token = $("#token").val();
	$.ajax({
	    url: '/cambiarEstado/'+codigo_incidencia+"/"+estado,
	    type: 'POST',
	    data: {
	    	"estado": estado,
	    	"cod_incidencia": codigo_incidencia,
	    	"_token": token
	    },
	    success:function (data) {
	    	$("#mensaje").show();
	    	$("#mensaje").append("Incidencia actualizada de estado");

	    	console.log(data);
		},
	    error:function(xhr, ajaxOptions, thrownError){
	        $("#error").append(xhr.status);
	        console.log(xhr.status)
	    }
	});
}



/********************************* FUNCIÓN PARA ENVIAR EMAIL AL TECNICO SELECCIONADO *****************************/


function enviarEmailTecnicos(idIncidencia){

	var personaContacto = $("#nombreContacto").val();
	var telefonoContacto = $("#telefonoContacto").val();

	if(personaContacto == "" || telefonoContacto == ""){
		$("#nombreContacto").addClass("error");
		$("#telefonoContacto").addClass("error");
	}else{
		$("#nombreContacto").removeClass("error").addClass("correcto");
		$("#telefonoContacto").removeClass("error").addClass("correcto");

		var asunto = $("#asunto").val();


		$.ajax({
		    url: '/enviarEmail',
		    type: 'GET',
		    data: {
		    	"_token": $("#token").val(),
		    	"categoria": $("#categoria").val(),
		    	"solicitante": $("#solicitante").val(),
		    	"prioridad": $("#Abrirprioridad").val(),
		    	"asunto": asunto,
		    	"ultimoIdIncidencia":idIncidencia,
		    	"mensaje": $("#cuerpoMensaje").val(),
		    	"adjunto": $("#adjunto").val(),
		    	"cliente": $("#nombreClienteAbrir").val(),
		    	"telefono": $("#telefonoContacto").val(),
		    },
		    success:function (data) {
		    	$("#correcto").append("\nAviso enviado, Gracias!");

		    	//Enviamos al listado de incidencias
		    	$(location).attr('href','/mostrarIncidencias');
			},
		    error:function(xhr, ajaxOptions, thrownError){
		        $("#error").append(xhr.status);
		        console.log("error: " + xhr.status)
		    }
		});

	}//FIN ELSE
}



/****************************************** FUNCION TABLAS RESPONSIVE ***************************************/

$('table').stacktable();


/***************************************************************************************************************/


/* FUNCION PARA CREAR USUARIOS */

function crearUsuarios(){
	$.ajax({
		url: '/altaUsuarios',
		method: 'POST',
		data: {"nif":$("#nif").val(), "nombreUsuario": $("#nombreUsuario").val(), "contrasenna": $("#contrasenna").val(),
			   "codv3Usuario": $("#codv3Usuario").val(), "telefonoUsuario":$("#telefonoUsuario").val(), "direccionUsuario":$("#direccionUsuario").val(),
			   "emailUsuario":$("#emailUsuario").val(), "tipoPago": $("#tipoPago").val(), "perfil": $("#perfil").val(),
				"_token": $("#_token").val(),
			},
		success:function (data) {
	    	console.log(data);
		},
	    error:function(xhr, ajaxOptions, thrownError){
	        console.log("error: " + xhr.status)
	    }
	});
}
