<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Google_Client;
use App\Http\Controllers\ReflectionObject;
use DateTime;
use Google_Service_Calendar;
use App\Http\Controllers\array_filer;
use Illuminate\Database\MySqlConnection;
use PDO;
use App\actuacion;
use App\incidencia;
use App\Http\Requests\JsonRequest;

class Incidencias extends Controller{

	

    //VARIABLE USADA PARA SABER EL ÚLTIMO ID INSERTADO QUE SE USARÁ PARA ENVIAR EL EMAIL PARA ASIGNAR
    public $idIncidencia;



    //FUNCION PARA MOSTRAR LA VISTA

    public function setIncidencia(){
        return view("incidencias.abrirIncidencia");
    }



    // FUNCIÓN PARA ABRIR UNA INCIDENCIA Y AÑADIR ARCHIVOS ADJUNTOS

	public function setIncidenciaPost(Request $request){


        $uploadedFile = "";
        $filename = "";


        // bloque para adjuntar fichero al email al abrirIncidencia


        if($request->file('file') != ""){

            $uploadedFile = $request->file('file');
            $destino = public_path().'/subidas';

            for($i = 0; $i < count($uploadedFile); $i++){
                $filename = $uploadedFile[$i]->getClientOriginalName();

                $uploadedFile[$i]->move($destino, $filename);
            }


            
        }

        echo var_dump($request->all());

        exit();


    	$resultado = \DB::table('incidencias')->insert([
                    				                     'fecha_solicitud' => $request["fechaSolicitud"],
                    				                     'fecha_respuesta' => $request["fechaRespuesta"],
                    				                           'categoria' => $request["categoria"],
                                                               'asignadoA' => $request["tecnico"],
                           					                 'solicitante' => $request["solicitante"],
                                                               'prioridad' => $request["prioridad"],
                                                                  'estado' => "pendiente",
                    							                  'asunto' => $request["asunto"],
                    							                  'cuerpo' => $request["mensaje"],
                                                                 'cliente' => $request["cliente"],
                                                                 'adjunto' => $filename
                                                        ]);

        $idIncidencia = \DB::getPdo()->lastInsertId();

        // ENVIA EMAIL A LOS TÉCNICOS CUANDO SE GENERA LA INCIDENCIA
        $this->enviarEmail($request);

	}

    //FUNCION PARA ABRIR UNA INCIDENCIA, PERO HABIENDO SELECCIONADO VARIOS TECNICOS (NO SE ASIGNA, SE MANDA EMAIL)
    // FUNCIÓN PARA ABRIR UNA INCIDENCIA

    public function setIncidenciaVarios(Request $request){

        $uploadedFile = "";
        $filename = "";

        // bloque para adjuntar fichero al email al abrirIncidencia

        if($request->file('file') != ""){

            $uploadedFile = $request->file('file');
            $destino = public_path().'/subidas';

            $filename = $uploadedFile->getClientOriginalName();

            $uploadedFile->move($destino, $filename);

            //\Storage::disk('local')->putFileAs(public_path().'/subidas', $uploadedFile, $filename);
            
            //fin bloque
        }

        $resultado = \DB::table('incidencias')->insert([
                                                         'fecha_solicitud' => $request["fechaSolicitud"],
                                                         'fecha_respuesta' => $request["fechaRespuesta"],
                                                               'categoria' => $request["categoria"],
                                                             'solicitante' => $request["solicitante"],
                                                               'prioridad' => $request["prioridad"],
                                                                  'estado' => "pendiente",
                                                                  'asunto' => $request["asunto"],
                                                                  'cuerpo' => $request["mensaje"],
                                                                 'cliente' => $request["cliente"],
                                                                 'adjunto' => $filename
                                                        ]);


        $idIncidencia = \DB::getPdo()->lastInsertId();

        // ENVIA EMAIL A LOS TÉCNICOS CUANDO SE GENERA LA INCIDENCIA
        $this->enviarEmail($request);

        return \Redirect::to('/mostrarIncidencias');
    }








	// OBTENEMOS LOS DATOS DE UNA INCIDENCIA
    public function getIncidencia(Request $request){
    	$cod_incidencia = $request['cod_incidencia'];

    	$incidencia = \DB::table('incidencias')->where('cod_incidencia','LIKE','%'.$cod_incidencia."%")->get();

    return $incidencia;
    }


    // OBTENEMOS LAS INCIDENCIAS ASIGNADAS A UN TECNICO
    public function getIncidencias(Request $request){
    	$cod_incidencia = $request['cod_incidencia'];

    	$incidencia = \DB::table('incidencias')->where('cod_incidencia','LIKE','%'.$cod_incidencia."%" ." ORDER BY (cod_incidencia) DESC")->get();

    return $incidencia;
    }


    // OBTENEMOS EL TOTAL DE INCIDENCIAS PENDIENTES QUE QUEDAN

    public function getIncidenciasPendientes(){
        $numeroDePendientes = \DB::select(\DB::raw('SELECT COUNT(cod_incidencia) as incidencias 
                                                    FROM incidencias 
                                                    WHERE estado = "pendiente"'));

    return $numeroDePendientes[0]->incidencias;
    }




    // ASIGNAR INCIDENCIA A UN TECNICO
    public function asignarIncidencia(Request $request){
    	$cod_incidencia = $request["cod_incidencia"];
    	$cod_tecnico = \Auth::user()->cod_usuario;
    	
    	$fechaRespuesta = date("Y-m-d H:i:s");

    	


    	// UPDATE
    	$incidencia = \DB::table('incidencias')->where('cod_incidencia', '=', $cod_incidencia)
										    	->update(array(
										    		'asignadoA'			=> $cod_tecnico,
										    		'fecha_respuesta'	=> $fechaRespuesta
										    	));
                                                
    return redirect()->back()->with('asignar', 'Incidencia asignada');
    }


    //MOSTRAMOS TODAS LAS INCIDENCIAS ASIGNADAS Y NO ASIGNADAS
    public function mostrarIncidencias(){
    	
        $resultado = \DB::select(\DB::raw('
            SELECT DISTINCT cod_incidencia, fecha_solicitud, categoria, asignadoA, usuarios.nombre, asunto, cuerpo, prioridad, estado 
            FROM `incidencias`, usuarios
            WHERE estado in ("pendiente", "en seguimiento", "agendada")
            AND incidencias.solicitante = usuarios.cod_usuario
            ORDER BY (cod_incidencia) DESC'
        ));


    return $resultado;
    }


    //MOSTRAMOS TODAS LAS INCIDENCIAS QUE NO ESTÉN ASIGNADAS
    public function mostrarIncidenciasSinAsignar(){
        $incidencias = \DB::select(\DB::raw('
                SELECT DISTINCT cod_incidencia, fecha_solicitud, categoria, asignadoA, usuarios.nombre, asunto, cuerpo, prioridad, estado 
                FROM `incidencias`, usuarios 
                where incidencias.solicitante = usuarios.cod_usuario
                AND incidencias.asignadoA = usuarios.cod_usuario
                and incidencias.asignadoA is null'));


    return $incidencias;
    }


    // MOSTRAR DETALLES DE LAS INCIDENCIAS

    public function mostrarDetallesIncidencia(Request $request){

        $codIncidencia = $request["codigoIncidencia"];



        $detallesIncidencia = \DB::select(\DB::raw('
                                            SELECT *
                                            FROM incidencias, usuarios
                                            WHERE incidencias.cliente = usuarios.cod_usuario
                                            AND incidencias.cod_incidencia = '.$codIncidencia));

    return $detallesIncidencia;
    }






    //OBTENEMOS EL NOMBRE DE A QUIEN SE LE ASIGNA UNA INCIDENCIA

    public function getAsignacionIncidencia(){
    	$incidencias = \DB::table('incidencias')->join("usuarios","usuarios.cod_usuario", "=", "incidencias.asignadoA")
        ->get();

    return $incidencias;
    }

    //OBTENEMOS LOS CLIENTES Y USUARIOS

    public function getUsuarios(){
    	$usuarios = \DB::table('usuarios')->get();

    return $usuarios;
    }


    // ENVIAR EMAIL AL SELECCIONAR TECNICO EN ALTA DE INCIDENCIAS

    public function enviarEmail(Request $request){

        /* VARIABLES PARA ADJUNTAR FICHERO AL EMAIL (NOMBRE FICHERO ADJUNTO Y UBICACION)*/
        $archivoAdjunto = "";
        $nombreAdjunto = "";
        $destino = "";
        $adjunto = "";

        // fin variables email

        $tecnicos = array();

        $solicitante = \DB::table("usuarios")->where("cod_usuario", '=', $request["solicitante"])->get();
        $prioridad = $request["prioridad"];
        $categoria = $request["categoria"];
        $asunto = $request["asunto"];
        $mensaje = $request["mensaje"];


        // variable para enviar email a un solo técnico
        $tecnico = $request["tecnico"];


        $cliente = \DB::table("usuarios")->where("cod_usuario", '=', $request["cliente"])->get();
        $telefonoContacto = $request["telefono"];

        //obtenemos el último ID
        $idIncidencia = incidencia::latest('cod_incidencia')->first();

        $adjunto = $request->file('file');


        // ADJUNTAR FICHERO EMAIL USAMOS ESTA CONSULTA PARA SACAR EL NOBMRE DEL ARCHIVO MÁS ABAJO LO CONCATENAMOS
        $archivo = \DB::table("incidencias")->where("cod_incidencia", '=', $idIncidencia["cod_incidencia"])->first();


        //$enlaceAsignacion = "http://avisos.integrainformatica.es/mostrarCalendarioEmail/incidencia/".$idIncidencia;
        $enlaceAsignacion = "http://avisos.integrainformatica.es/mostrarCalendarioEmail/incidencia/".$idIncidencia["cod_incidencia"];


        $datos = array(
            "solicitante"  => $solicitante,
            "prioridad"    => $prioridad,
            "categoria"    => $categoria,
            "tecnico"      => $tecnico,
            "cliente"      => $cliente,
            "telefono"     => $telefonoContacto,
            "asunto"       => $asunto,
            "mensaje"      => $mensaje,
            "enlace"       => $enlaceAsignacion,
        );

        $salida = array();
        $email = "";

        // AVERIGUAMOS CUANTOS TECNICOS HEMOS SELECCIONADO
        $tamano = count(collect($request["tecnico"]));
    
        // MANDAR EMAIL A UN SOLO TÉCNICO
        if($tamano == 1){

            $email = \DB::select( \DB::raw("SELECT email FROM usuarios WHERE id =". $request["tecnico"] ));

            $emailUnico = $email[0]->email;


            //PREGUNTAMOS SI VIENE EL ADJUNTO O NO

            if($request->file("file") != null){

                $subject = $asunto;
                $adjunto = public_path().'/subidas/'. $archivo->adjunto;


                $nombreAdjunto = $archivo->adjunto;


                \Mail::send('email', $datos, function($msj) use($subject, $emailUnico, $adjunto, $nombreAdjunto){

                    $msj->from("administrador@incidencias.integra.com","Incidencias");
                    $msj->subject($subject);
                    $msj->to($emailUnico);
                    $msj->attach($adjunto, array(
                            'as' => $nombreAdjunto,
                            'mime' => 'application/pdf',
                        )// fin array
                    );
                });
            }else{
                $email = \DB::select( \DB::raw("SELECT email FROM usuarios WHERE id =". $request["tecnico"] ));

                $emailUnico = $email[0]->email;


                //PREGUNTAMOS SI VIENE EL ADJUNTO O NO

                if($request->file("file") == null){

                    $subject = $asunto;

                    \Mail::send('email', $datos, function($msj) use($subject, $emailUnico){

                        $msj->from("administrador@incidencias.integra.com","Incidencias");
                        $msj->subject($subject);
                        $msj->to($emailUnico);
                    });
                }
            }

        }else{
            // ENVIAMOS UN EMAIL A LOS TECNICOS SELECCIONADOS
            
            // COMO HEMOS CREADO UN JSON EN AJAX, DEBEMOS DESCOMPONERLO
            $emails = json_decode($_POST['tecnicos']);
            $emailsCadena = "";
            $emailsFinal = array();

            echo var_dump($emails);

            for($i=0; $i < count($emails); $i++){
                //creamos la cadena
                $emailsCadena .= $emails[$i].",";
            }

            //eliminamos la última , de la cadena de los emails que recibimos de AJAX
            $longitud = strlen($emailsCadena) - 1;

            //creamos el substring
            $emailsCadena = substr($emailsCadena, 0, $longitud);

            // generamos la consulta con los emails resultantes
            $salida = \DB::select( \DB::raw("SELECT email FROM usuarios WHERE id in (".$emailsCadena.")" ));


            //INTRODUCIMOS LOS EMAILS RESULTANTES EN UN NUEVO ARRAY, YA QUE SI NO ES UNA CADENA, EL ARRAY
            // RESULTANTE DE LA CONSULTA ES UNA MATRIZ

            for($i=0; $i < count($salida); $i++){
                $emailsFinal[] = $salida[$i]->email;
            }


            if($archivo->adjunto == ""){
                 $subject = $asunto;
    
                \Mail::send('email', $datos, function($msj) use($subject, $emailsFinal){

                    $msj->from("administrador@incidencias.integra.com","Incidencias");
                    $msj->subject($subject);
                    $msj->to($emailsFinal);
                });

            }else{

                $subject = $asunto;
                $adjunto = public_path().'/subidas/'. $archivo->adjunto;
                $nombreAdjunto = $archivo->adjunto;

                \Mail::send('email', $datos, function($msj) use($subject, $emailsFinal, $adjunto, $nombreAdjunto){

                    $msj->from("administrador@incidencias.integra.com","Incidencias");
                    $msj->subject($subject);
                    $msj->to($emailsFinal);
                    $msj->attach($adjunto, array(
                            'as' => $nombreAdjunto,
                            'mime' => 'application/pdf',
                        )// fin array
                    );
                });
            }
        }
    return back()->with('correcto', "Se ha enviado el email");
    }




    public function asignarIncidenciaEmail(Request $request){

        $cod_incidencia = $request["cod_incidencia"];

        echo $cod_incidencia;
        exit();

        /*$cod_tecnico = \Auth::user()->cod_usuario;
        
        $fechaRespuesta = date("Y-m-d H:i:s");

        

        // UPDATE
        $incidencia = \DB::table('incidencias')->where('cod_incidencia', '=', $cod_incidencia)
                                                ->update(array(
                                                    'asignadoA'         => $cod_tecnico,
                                                    'fecha_respuesta'   => $fechaRespuesta
                                                ));

    return redirect()->back()->with('success', 'Incidencia asignada');*/

    }





    /********************************** ESTABLECER ACTUACIONES **************************************/

    
    // FUNCIÓN PARA ESTABLECER NUEVAS ACTUACIONES (SI PREVIAMENTE SE HA CREADO UNA)

    public function setActuacion(Request $request){
        
        $firma = $request->get("imagenCanvas");
  
        $fechaTransformada = $request->get("fechaTransformada");
        $mensaje = $request->get("mensaje");

        $incidencia = $request["incidencia"];



        // CON ESTO GENERAMOS LA IMAGEN 
        $this->generateImage($firma, $incidencia, $fechaTransformada);

        $ruta = "images/".($incidencia+1)."_".$fechaTransformada.".png";

        // INSERTAMOS EL SEGUIMIENTO EN LA BASE DE DATOS
        $seguimiento = \DB::table('actuacion')->insert([
                                            'fecha' => $fechaTransformada,
                                            'mensaje' => $mensaje,
                                            'incidencia' => $incidencia,
                                            'firma' => $ruta,
                                            'facturable' => $request["facturable"],
                                            'presupuesto' => $request["presupuesto"],
                                            'conforme'	=> $request['conforme'],
                                            'articulo' => $request["articulo"],
                                            'manoObra' => $request["manoObra"],
                                            'desplazamiento' => $request["desplazamiento"],
                                            'total' => $request["total"],
                                        ]);
    }


    // MOSTRAMOS LOS SEGUIMIENTOS EN LA VISTA HOME (LA VISTA SE CARGA EN HOMECONTROLLER)
    public function mostrarSeguimientos(Request $request){
        //mostramos los seguimientos de las incidencias
        $cod_seguimiento = $request->get("codigo_incidencia");

        $seguimientos = \DB::table('actuacion')->where("incidencia", '=', $cod_seguimiento)->get();

        return $seguimientos;
    }

    // NUEVA ACTUACION SI NO SE HA CREADO ANTES OTRA
     public function nuevaActuacion(Request $request){

        $firma = $request->get("imagenCanvas");
        $codigo_incidencia = $request->get("codigo_incidencia");


        $fechaTransformada = $request->get("fechaTransformada");
        $mensaje = $request->get("mensaje");


        // CON ESTO GENERAMOS LA IMAGEN 
        $this->generateImage($firma, $codigo_incidencia, $fechaTransformada);

        $ruta = "images/".($codigo_incidencia+1)."_".$fechaTransformada.".png";

        // INSERTAMOS EL SEGUIMIENTO EN LA BASE DE DATOS
        $seguimiento = \DB::table('actuacion')->insert([
                                            'fecha' => $fechaTransformada,
                                            'mensaje' => $mensaje,
                                            'incidencia' => $codigo_incidencia,
                                            'firma' => $ruta,
                                            'facturable' => $request["facturable"],
                                            'presupuesto' => $request["presupuesto"],
                                            'conforme'	=> $request['conforme'],
                                            'articulo' => $request["articulo"],
                                            'manoObra' => $request["manoObra"],
                                            'desplazamiento' => $request["desplazamiento"],
                                            'total' => $request["total"],
                                        ]);
     }



     // FUNCIÓN PARA GENERAR LA IMAGEN DEL CANVAS
    public function generateImage($img, $codigo_incidencia, $fechaSeguimiento){

        $nombreImagen = str_replace('/', '-', $fechaSeguimiento);

        $cadenaNombre = ($codigo_incidencia+1)."_".$nombreImagen;
        
        $nombreImagen = str_replace(' ', '', $cadenaNombre);

        $path = "images/".$nombreImagen.".png";
        
        $imgTran1 = str_replace('data:image/png;base64,', '', $img);
        $imgTran2 = str_replace(' ', '+', $imgTran1);
        $data = base64_decode($imgTran2, true);

        $success = file_put_contents($path, $data);
    }

    /************************************************* FIN SEGUIMIENTOS *********************************************/



    // FUNCION PARA ASIGNAR O REASIGNAR UNA INCIDENCIA DESDE EL SELECT DE LA TABLA

    public function asignarReasignarATecnico(Request $request){

        $asignarIncidencia = \DB::table("incidencias")
                                                ->where('cod_incidencia', $request["cod_incidencia"])
                                                ->update(array(
                                                    "asignadoA" => $request["asignadoA"]
                                                ));

        $tecnico = \DB::Table("usuarios")->where("cod_usuario", "=", $request["asignadoA"])->get();

        $codigo_incidencia = $request["cod_incidencia"];

        $datosIncidencia = \DB::select(\DB::raw("SELECT * 
                                                 FROM incidencias, usuarios 
                                                 WHERE incidencias.cliente = usuarios.cod_usuario
                                                 AND incidencias.cod_incidencia = $codigo_incidencia
                                                 "
                                                ));

        //obtenemos el nombre a quien se le asigna
        $tecnico = \DB::Table("usuarios")->where("cod_usuario", "=", $datosIncidencia[0]->asignadoA)->get();

        //obtenemos el nombre del cliente
        $cliente = \DB::Table("usuarios")->where("cod_usuario", "=", $datosIncidencia[0]->cliente)->get();



        $enlaceAsignacion = "http://avisos.integrainformatica.es/mostrarCalendarioEmail/incidencia/".$request["cod_incidencia"];



        // ENVIAMOS UN EMAIL AL TÉCNICO AL CUAL SE LE HA REASIGNADO UNA INCIDENCIA.
        $subject = "Se le ha reasignado una incidencia";

        $for = $tecnico[0]->email;

        $datos = array(
            "solicitante"  => $datosIncidencia[0]->solicitante,
            "prioridad"    => $datosIncidencia[0]->prioridad,
            "categoria"    => $datosIncidencia[0]->categoria,
            "tecnico"      => $tecnico[0]->nombre,
            "cliente"      => $cliente[0]->nombre,
            "telefono"     => $datosIncidencia[0]->telefono,
            "asunto"       => $datosIncidencia[0]->asunto,
            "mensaje"      => $datosIncidencia[0]->cuerpo,
            "enlace"       => $enlaceAsignacion,
        );


        \Mail::send('emailReasignacion', $datos, function($msj) use($subject,$for){
            $msj->from("admin.avisos@integrainformatica.es","Administrador avisos Integra");
            $msj->subject($subject);
            $msj->to($for);
        });
                                               

    return $asignarIncidencia;
    }


    // FUNCIÓN PARA CAMBIAR EL ESTADO DE UNA INCIDENCIA

    public function cambiarEstado($codigo_incidencia, $estado){
        $estado = \DB::table("incidencias")
                            ->where('cod_incidencia', '=', $codigo_incidencia)
                            ->update(array(
                                "estado" => $estado
                            ));

        echo $codigo_incidencia . "\n" . $estado;


    }






    // FUNCIÓN PARA ACTUALIZAR LA FECHA DE RESPUESTA DE UNA INCIDENCIA Y SU ESTADO

    public function actualizarFechaRespuesta($codigo_incidencia){

        //ESTABLECEMOS LA ZONA HORARIA ANTES DE NADA
        date_default_timezone_set("Europe/Madrid");
        $fechaRespuesta = date("y-m-d H:i:s");


        $fecha = \DB::table('incidencias')->where('cod_incidencia', $codigo_incidencia)
        											->update(['fecha_respuesta' => $fechaRespuesta]);

        $agendada = \DB::table('incidencias')->where('cod_incidencia',$codigo_incidencia)
        											->update(['estado' => 'agendada']);   
    }







    // FUNCIÓN PARA AGENDAR INCIDENCIA (GOOGLE CALENDAR) 'calendario todos'

    public function agendarIncidencias(Request $request){
        date_default_timezone_set('Europe/Madrid');


        //configurar variable de entorno / set enviroment variable
        $salida = putenv('GOOGLE_APPLICATION_CREDENTIALS='.__DIR__.'/apicalendarincidencias-e491d45b925f.json');


        $client = new \Google_Client();
        $client->useApplicationDefaultCredentials();
        $client->setScopes(['https://www.googleapis.com/auth/calendar']);

        // ID calendario
        $id_calendar = 'ioddeqjlr44sc7a6gukje7u7lg@group.calendar.google.com';//
        

        $fechaInicio = new DateTime($request["fechaInicio"]);
        $fechaFin = new DateTime($request["fechaFin"]);

        $horaInicio = $fechaInicio->format(\DateTime::RFC3339);
        $horaFin = $fechaFin->format(\DateTime::RFC3339);

        try{
            
            //instanciamos el servicio
             $calendarService = new Google_Service_Calendar($client);
         
            //crear evento
            $event = new \Google_Service_Calendar_Event();
            $event->setSummary($request["incidencia"]);
            $event->setDescription($request["detalles"]);

            //fecha inicio
            $inicio = new \Google_Service_Calendar_EventDateTime();
            $inicio->setDateTime($horaInicio);
            $event->setStart($inicio);

            //fecha fin
            $fin = new \Google_Service_Calendar_EventDateTime();
            $fin->setDateTime($horaFin);
            $event->setEnd($fin);

          
            $createdEvent = $calendarService->events->insert($id_calendar, $event);
            $idEvento = $createdEvent->getId();
            $linkEvento = $createdEvent->gethtmlLink();


        }catch(Google_Service_Exception $gs){
         
          $errores = json_decode($gs->getMessage());
          $errores = $errores->error->message;

        }catch(Exception $e){
            $errores = "Error aqui: ".$e->getMessage();
          
        }
    }



    // FUNCIÓN PARA AGENDAR INCIDENCIA (GOOGLE CALENDAR) 'CALENDARIO JOSE LUÍS

    public function agendarIncidenciasJoseLuis(Request $request){
        date_default_timezone_set('Europe/Madrid');


        //configurar variable de entorno / set enviroment variable
        $salida = putenv('GOOGLE_APPLICATION_CREDENTIALS='.__DIR__.'/apicalendarincidencias-e491d45b925f.json');


        $client = new \Google_Client();
        $client->useApplicationDefaultCredentials();
        $client->setScopes(['https://www.googleapis.com/auth/calendar']);

        // ID calendario
        $id_calendar = 'b01althtgj3e7a3s7r4fu6ke9o@group.calendar.google.com';//
        

        $fechaInicio = new DateTime($request["fechaInicioJose"]);
        $fechaFin = new DateTime($request["fechaFinJose"]);

        $horaInicio = $fechaInicio->format(\DateTime::RFC3339);
        $horaFin = $fechaFin->format(\DateTime::RFC3339);

        try{


            //instanciamos el servicio
             $calendarService = new Google_Service_Calendar($client);
         
            //crear evento
            $event = new \Google_Service_Calendar_Event();
            $event->setSummary($request["incidenciaJose"]);
            $event->setDescription($request["detallesJose"]);

            //fecha inicio
            $inicio = new \Google_Service_Calendar_EventDateTime();
            $inicio->setDateTime($horaInicio);
            $event->setStart($inicio);

            //fecha fin
            $fin = new \Google_Service_Calendar_EventDateTime();
            $fin->setDateTime($horaFin);
            $event->setEnd($fin);

          
            $createdEvent = $calendarService->events->insert($id_calendar, $event);
            $idEvento = $createdEvent->getId();
            $linkEvento = $createdEvent->gethtmlLink();


            // ACTUALIZAMOS LA FECHA DE RESPUESTA DE LA INCIDENCIA Y EL ESTADO

            $this->actualizarFechaRespuesta($request["codigo_incidencia"]);



        }catch(Google_Service_Exception $gs){
         
          $errores = json_decode($gs->getMessage());
          $errores = $errores->error->message;

        }catch(Exception $e){
            $errores = "Error aqui: ".$e->getMessage();
          
        }
    }







    // FUNCIÓN PARA AGENDAR INCIDENCIA (GOOGLE CALENDAR) 'calendario VICTOR'

    public function agendarIncidenciasVictor(Request $request){
        date_default_timezone_set('Europe/Madrid');


        //configurar variable de entorno / set enviroment variable
        $salida = putenv('GOOGLE_APPLICATION_CREDENTIALS='.__DIR__.'/apicalendarincidencias-e491d45b925f.json');


        $client = new \Google_Client();
        $client->useApplicationDefaultCredentials();
        $client->setScopes(['https://www.googleapis.com/auth/calendar']);

        // ID calendario
        $id_calendar = 'f35cf3p96q2kqe3dss2uvb8260@group.calendar.google.com';
        

        $fechaInicio = new DateTime($request["fechaInicioVictor"]);
        $fechaFin = new DateTime($request["fechaFinVictor"]);

        $horaInicio = $fechaInicio->format(\DateTime::RFC3339);
        $horaFin = $fechaFin->format(\DateTime::RFC3339);

        try{
            
            //instanciamos el servicio
             $calendarService = new Google_Service_Calendar($client);
         
            //crear evento
            $event = new \Google_Service_Calendar_Event();
            $event->setSummary($request["incidenciaVictor"]);
            $event->setDescription($request["detallesVictor"]);

            //fecha inicio
            $inicio = new \Google_Service_Calendar_EventDateTime();
            $inicio->setDateTime($horaInicio);
            $event->setStart($inicio);

            //fecha fin
            $fin = new \Google_Service_Calendar_EventDateTime();
            $fin->setDateTime($horaFin);
            $event->setEnd($fin);

          
            $createdEvent = $calendarService->events->insert($id_calendar, $event);
            $idEvento = $createdEvent->getId();
            $linkEvento = $createdEvent->gethtmlLink();

            // ACTUALIZAMOS LA FECHA DE RESPUESTA DE LA INCIDENCIA Y EL ESTADO

            $this->actualizarFechaRespuesta($request["codigo_incidencia"]);



        }catch(Google_Service_Exception $gs){
         
          $errores = json_decode($gs->getMessage());
          $errores = $errores->error->message;

        }catch(Exception $e){
            $errores = "Error aqui: ".$e->getMessage();
          
        }
    }

    // FUNCIÓN PARA AGENDAR INCIDENCIA (GOOGLE CALENDAR) 'calendario FERNANDO REYES'

    public function agendarIncidenciasReyes(Request $request){
        date_default_timezone_set('Europe/Madrid');


        //configurar variable de entorno / set enviroment variable
        $salida = putenv('GOOGLE_APPLICATION_CREDENTIALS='.__DIR__.'/apicalendarincidencias-e491d45b925f.json');


        $client = new \Google_Client();
        $client->useApplicationDefaultCredentials();
        $client->setScopes(['https://www.googleapis.com/auth/calendar']);

        // ID calendario
        $id_calendar = 'satintegratime@gmail.com';
        

        $fechaInicio = new DateTime($request["fechaInicioReyes"]);
        $fechaFin = new DateTime($request["fechaFinReyes"]);

        $horaInicio = $fechaInicio->format(\DateTime::RFC3339);
        $horaFin = $fechaFin->format(\DateTime::RFC3339);

        try{
            
            //instanciamos el servicio
             $calendarService = new Google_Service_Calendar($client);
         
            //crear evento
            $event = new \Google_Service_Calendar_Event();
            $event->setSummary($request["incidenciaReyes"]);
            $event->setDescription($request["detallesReyes"]);

            //fecha inicio
            $inicio = new \Google_Service_Calendar_EventDateTime();
            $inicio->setDateTime($horaInicio);
            $event->setStart($inicio);

            //fecha fin
            $fin = new \Google_Service_Calendar_EventDateTime();
            $fin->setDateTime($horaFin);
            $event->setEnd($fin);

          
            $createdEvent = $calendarService->events->insert($id_calendar, $event);
            $idEvento = $createdEvent->getId();
            $linkEvento = $createdEvent->gethtmlLink();

            /// ACTUALIZAMOS LA FECHA DE RESPUESTA DE LA INCIDENCIA Y EL ESTADO

            $this->actualizarFechaRespuesta($request["codigo_incidencia"]);

        }catch(Google_Service_Exception $gs){
         
          $errores = json_decode($gs->getMessage());
          $errores = $errores->error->message;

        }catch(Exception $e){
            $errores = "Error aqui: ".$e->getMessage();
          
        }
    }

    // FUNCIÓN PARA AGENDAR INCIDENCIA (GOOGLE CALENDAR) 'calendario FERNANDO BURGOS'

    public function agendarIncidenciasBurgos(Request $request){
        date_default_timezone_set('Europe/Madrid');


        //configurar variable de entorno / set enviroment variable
        $salida = putenv('GOOGLE_APPLICATION_CREDENTIALS='.__DIR__.'/apicalendarincidencias-e491d45b925f.json');


        $client = new \Google_Client();
        $client->useApplicationDefaultCredentials();
        $client->setScopes(['https://www.googleapis.com/auth/calendar']);

        // ID calendario
        $id_calendar = 'mn0prc9ov8n3objueimi9b8ut4@group.calendar.google.com';//
        

        $fechaInicio = new DateTime($request["fechaInicioBurgos"]);
        $fechaFin = new DateTime($request["fechaFinBurgos"]);

        $horaInicio = $fechaInicio->format(\DateTime::RFC3339);
        $horaFin = $fechaFin->format(\DateTime::RFC3339);

        try{
            
            //instanciamos el servicio
             $calendarService = new Google_Service_Calendar($client);
         
            //crear evento
            $event = new \Google_Service_Calendar_Event();
            $event->setSummary($request["incidenciaBurgos"]);
            $event->setDescription($request["detallesBurgos"]);

            //fecha inicio
            $inicio = new \Google_Service_Calendar_EventDateTime();
            $inicio->setDateTime($horaInicio);
            $event->setStart($inicio);

            //fecha fin
            $fin = new \Google_Service_Calendar_EventDateTime();
            $fin->setDateTime($horaFin);
            $event->setEnd($fin);

          
            $createdEvent = $calendarService->events->insert($id_calendar, $event);
            $idEvento = $createdEvent->getId();
            $linkEvento = $createdEvent->gethtmlLink();

            // ACTUALIZAMOS LA FECHA DE RESPUESTA DE LA INCIDENCIA Y EL ESTADO

            $this->actualizarFechaRespuesta($request["codigo_incidencia"]);


        }catch(Google_Service_Exception $gs){
         
          $errores = json_decode($gs->getMessage());
          $errores = $errores->error->message;

        }catch(Exception $e){
            $errores = "Error aqui: ".$e->getMessage();
          
        }
    }

    

    // FUNCIÓN PARA AGENDAR INCIDENCIA (GOOGLE CALENDAR) 'calendario ROBERTO'

    public function agendarIncidenciasRoberto(Request $request){
        date_default_timezone_set('Europe/Madrid');


        //configurar variable de entorno / set enviroment variable
        $salida = putenv('GOOGLE_APPLICATION_CREDENTIALS='.__DIR__.'/apicalendarincidencias-e491d45b925f.json');


        $client = new \Google_Client();
        $client->useApplicationDefaultCredentials();
        $client->setScopes(['https://www.googleapis.com/auth/calendar']);

        // ID calendario
        $id_calendar = 'daviserraalonso@gmail.com';//
        

        $fechaInicio = new DateTime($request["fechaInicioRoberto"]);
        $fechaFin = new DateTime($request["fechaFinRoberto"]);

        $horaInicio = $fechaInicio->format(\DateTime::RFC3339);
        $horaFin = $fechaFin->format(\DateTime::RFC3339);

        try{
            
            //instanciamos el servicio
             $calendarService = new Google_Service_Calendar($client);
         
            //crear evento
            $event = new \Google_Service_Calendar_Event();
            $event->setSummary($request["incidenciaRoberto"]);
            $event->setDescription($request["detallesRoberto"]);

            //fecha inicio
            $inicio = new \Google_Service_Calendar_EventDateTime();
            $inicio->setDateTime($horaInicio);
            $event->setStart($inicio);

            //fecha fin
            $fin = new \Google_Service_Calendar_EventDateTime();
            $fin->setDateTime($horaFin);
            $event->setEnd($fin);

          
            $createdEvent = $calendarService->events->insert($id_calendar, $event);
            $idEvento = $createdEvent->getId();
            $linkEvento = $createdEvent->gethtmlLink();

            // ACTUALIZAMOS LA FECHA DE RESPUESTA DE LA INCIDENCIA Y EL ESTADO

            $this->actualizarFechaRespuesta($request["codigo_incidencia"]);


        }catch(Google_Service_Exception $gs){
         
          $errores = json_decode($gs->getMessage());
          $errores = $errores->error->message;

        }catch(Exception $e){
            $errores = "Error aqui: ".$e->getMessage();
          
        }
    }

    // FUNCIÓN PARA AGENDAR INCIDENCIA (GOOGLE CALENDAR) 'calendario DAVID'

    public function agendarIncidenciasDavid(Request $request){
        date_default_timezone_set('Europe/Madrid');


        //configurar variable de entorno / set enviroment variable
        $salida = putenv('GOOGLE_APPLICATION_CREDENTIALS='.__DIR__.'/calendarDavid.json');


        $client = new \Google_Client();
        $client->useApplicationDefaultCredentials();
        $client->setScopes(['https://www.googleapis.com/auth/calendar']);

        // ID calendario
        $id_calendar = 'daviserraalonso@gmail.com';//
        

        $fechaInicio = new DateTime($request["fechaInicioDavid"]);
        $fechaFin = new DateTime($request["fechaFinDavid"]);

        $horaInicio = $fechaInicio->format(\DateTime::RFC3339);
        $horaFin = $fechaFin->format(\DateTime::RFC3339);

        try{
            
            //instanciamos el servicio
             $calendarService = new Google_Service_Calendar($client);
         
            //crear evento
            $event = new \Google_Service_Calendar_Event();
            $event->setSummary($request["incidenciaDavid"]);
            $event->setDescription($request["detallesDavid"]);

            //fecha inicio
            $inicio = new \Google_Service_Calendar_EventDateTime();
            $inicio->setDateTime($horaInicio);
            $event->setStart($inicio);

            //fecha fin
            $fin = new \Google_Service_Calendar_EventDateTime();
            $fin->setDateTime($horaFin);
            $event->setEnd($fin);

          
            $createdEvent = $calendarService->events->insert($id_calendar, $event);
            $idEvento = $createdEvent->getId();
            $linkEvento = $createdEvent->gethtmlLink();

            $this->actualizarFechaRespuesta($request["codigo_incidencia"]);



        }catch(Google_Service_Exception $gs){
         
          $errores = json_decode($gs->getMessage());
          $errores = $errores->error->message;

        }catch(Exception $e){
            $errores = "Error aqui: ".$e->getMessage();
          
        }
    }




    /**************************************  OBTENEMOS LOS ARTICULOS ****************************************************/

    public function getArticulos(){
    	$articulos = \DB::table('articulo')->get();

    	//TRANSFORMACIÓN A ARRAY NORMAL

    	$articulosTransformado = array();

    	for($i = 0; $i<count($articulos); $i++){
    		$articulosTransformado[] = $articulos[$i];
    	}


    return $articulosTransformado;
    }



    /*************************************** OBTENEMOS LOS DATOS DEL CLIENTE EN ABRIR INCIDENCIA **************/

    public function getUsuario($nombre){
        $datosUsuario = \DB::table('usuarios')->where('cod_usuario', '=', $nombre)->get();

    return $datosUsuario;
    }


    /************************************ OBTENEMOS LOS ASUNTOS MÁS USUALES EN ABRIR INCIDENCIA *******************/

    public function getAsuntos(){
        $datosIncidencias = \DB::table('incidencias')->get();

    return $datosIncidencias;
    }
















    /****************************************** FUNCIONES DE BUSQUEDA *************************************/

    public function busquedaPorFecha(Request $request){
    	$fechaInicio = $request->get("fecha_solicitudInicio");
        $fechaFin = $request->get("fecha_solicitudFin");
      

    	$incidencia = \DB::table('incidencias')->whereBetween("fecha_solicitud", array($fechaInicio, $fechaFin))->get();

    	return $incidencia;
    }



    public function busquedaPorTecnico(Request $request){
    	$tecnico = $request["cod_tecnico"];

    	$incidencia = \DB::table('incidencias')->where("asignadoA", '=', $tecnico)->get();

    	return $incidencia;
    }



    public function busquedaPorCliente(Request $request){

    	$incidencia = \DB::table('incidencias')->where("solicitante", '=', $request["cod_cliente"])->get();

    	return $incidencia;
    }



    public function busquedaPorCodigoIncidencia(Request $request){
    	$codigoIncidencia = $request["cod_incidencia"];

    	$incidencia = \DB::table('incidencias')->where("cod_incidencia", '=', $codigoIncidencia)->get();

    	return $incidencia;
    }



    public function busquedaPorEstado(Request $request){

    	$estadoIncidencia = $request["estado"];

        $incidencia = "";

        if($estadoIncidencia == 'agendada'){
           $incidencia = \DB::table('incidencias')->where('estado', '=', 'agendada')->get();
        }
        if($estadoIncidencia == 'pendiente'){
            $incidencia = \DB::table('incidencias')->where('estado', '=', 'pendiente')->get();
        }
        if($estadoIncidencia == 'con_intervenciones'){
            $incidencia = \DB::table('incidencias')->where('estado', '=', 'con_intervenciones')->get();
        }
        if($estadoIncidencia == 'finalizada'){
            $incidencia = \DB::table('incidencias')->where('estado', '=', 'finalizada')->get();
        }
        
    return $incidencia;
    }



    public function busquedaPorPrioridad(Request $request){
    	$prioridad = $request["prioridad"];

    	$incidencia = \DB::table('incidencias')->where("prioridad", '=', $prioridad)->get();

    	return $incidencia;
    }



}// FIN CLASS

