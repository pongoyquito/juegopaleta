
  //---------------------------------------------
  //--- (Bloque funciones para PULSAR INICIO)
  //---------------------------------------------

var appprevia = {
	inicio: function(){
		
		this.iniciaBotones();
		this.iniciaFastClick();
	},

	iniciaBotones: function(){
		var botonInicio = document.querySelector('#phaser');

		//window.screen.lock.orientation('portrait');
		
					//--- Limites de la Pantalla
		document.getElementById("phaser").style.width = document.documentElement.clientWidth;
		document.getElementById("phaser").style.height = document.documentElement.clientWidth;
		

		botonInicio.addEventListener('click',this.botonInicio,false);
	},	
	
	botonInicio: function(){
		//------------------------------
		//--- Llamada al INICIO JUEGO
		//------------------------------
		if ('addEventListener'in document) {
			document.addEventListener('deviceready', function() {
			app.inicio();
			}, false);
		};
	},
	
	iniciaFastClick: function(){
		FastClick.attach(document.body);
	},
};


  //------------------------------------
  //--- (Bloque funciones para JUEGO)
  //-------------------------------------

var app = {
  inicio: function() {
  //---------------------
  //--- Inicio de la aplicacion
	
    DIAMETRO_BOLA = 32;
    
    velocidadX = 0;
    velocidadY = 0;

    puntos = 0;
	vidas = 4;
	var puntosText;
	var vidasText;
	var introText;

	document.querySelector('#phaser').innerHTML = '';
	
	//--- Limites de la Pantalla
    alto = document.documentElement.clientHeight;
    ancho = document.documentElement.clientWidth;

	//--- Arranca el juego
    app.vigilaSensores();
    app.iniciaJuego();
  },

  iniciaJuego: function() {
  //--------------------------
  //--- Definir los estados/ciclos del juego
	
    function preload() {
      //... Arrancar motor Fisico
	  game.physics.startSystem(Phaser.Physics.ARCADE);

      //... Iniciar fondo, imagen BOLA, imagen PALETA
	  game.stage.backgroundColor = '#ADEBE6';	//... #f27d0c DDA0DD AFEEEE *90EE90 **ADEBE6 *ADD8E6 *F5DEB3
      game.load.image('bola', 'assets/bola.png');
	  game.load.image('paleta', 'assets/paleta.png');
    }

    function create() {
      //... Inicia var. texto puntos en objeto GAME
		puntosText = game.add.text(32, (alto*7/8), 'Puntos: ' + puntos, { font: "20px Arial", fill: "#1E90FF", align: "left" });
		vidasText = game.add.text((ancho - 100), (alto*7/8), 'Vidas: ' + vidas, { font: "20px Arial", fill: "#4169E1", align: "left" });
		introText = game.add.text(game.world.centerX, (alto/2), '- click to start -', { font: "30px Arial", fill: "#483D8B", align: "center" });
		introText.visible = false;
		introText.anchor.setTo(0.5, 0.5);	  
	  
	  //... Iniciar el icono BOLA con una posicion inicial
      bola = game.add.sprite(app.inicioX(), app.inicioY(), 'bola');
	  bola.anchor.set(0.5);
      game.physics.arcade.enable(bola);
	  
	  //... Iniciar el icono PALETA con una posicion inicial
	  paleta = game.add.sprite( (ancho/2), (alto*3/4), 'paleta');
	  game.physics.arcade.enable(paleta);
	  
	  //... la PALETA actua como una pared (rebota)
	  paleta.body.immovable = true;
      
	  //... Activo control de colisiones con los bordes de su mundo
	  bola.body.collideWorldBounds = true;
	  paleta.body.collideWorldBounds = true;

	  // Esto lo hace moverse -> velocidad asignada (x,y)
	  bola.body.velocity.setTo(app.VBinicioX(), app.VBinicioY());

	  // Establece la energía de rebote de la imagen para la horizontal
	  // y vectores verticales (como un punto x, y). "1" es 100% de retorno de energía
	  bola.body.bounce.setTo(1, 1);
	  paleta.body.bounce.setTo(1, 1);
	  
	  //... Inicio recibir señal de Phaser
	  //... Para controlar: Bola perdida al fondo -> Vida perdida
	  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
		bola.body.onWorldBounds = new Phaser.Signal();
		//... Defino funcion a ejecutar al colisionar
		bola.body.onWorldBounds.add(app.BolaPerdida, this);
	  
    }

    function update() {
      
      //... Habilitar la física entre PALETA y la BOLA
	  game.physics.arcade.collide(paleta, bola, app.PaletaTocaBola, null,this);
	  
	  //... Asignar movimiento a la paleta con acelerometro.
	  //... solo movimiento en "x"
      paleta.body.velocity.x = (velocidadX * -300);
	  paleta.body.velocity.y = 0 //(velocidadY * 300);

    }

    var estados = { preload: preload, create: create, update: update };
    var game = new Phaser.Game(ancho, alto, Phaser.CANVAS, 'phaser',estados);
  },

  PaletaTocaBola: function() {
    puntos = puntos + 1;
    puntosText.text = 'Puntos: ' + puntos;
	bola.body.velocity.x = bola.body.velocity.x * (11/10);
	bola.body.velocity.y = bola.body.velocity.y * (12/10);
  },

  inicioX: function() {
    return app.numeroAleatorioHasta(ancho - DIAMETRO_BOLA);
  },

  inicioY: function() {
    return app.numeroAleatorioHasta( 3*DIAMETRO_BOLA );
  },

  numeroAleatorioHasta: function(limite) {
    return Math.floor(Math.random() * limite);
  },

  VBinicioX: function() {
	  valor = app.numeroAleatorioHasta(350);
	  signo = valor % 2;
	  if (valor < 150) {valor = 150};
	  if (signo = 1) {valor = valor *(-1)};
    return valor;
  },

  VBinicioY: function() {
	  valor = app.numeroAleatorioHasta(350);
	  signo = valor % 2;
	  if (valor < 150) {valor = 150};
	  if (signo = 1) {valor = valor *(-1)};
	return valor;
  },

  vigilaSensores: function() {
  //-----------------------------
  //--- Arrancar Observador del acelerometro de Cordova.
  
    function onError() {
      console.log('onError!');
    }

    function onSuccess(datosAceleracion) {
      //... Analizo datos cada 10 milisegundos.
	  app.detectaAgitacion(datosAceleracion);
      app.registraDireccion(datosAceleracion);
    }
	
	//... Inicio observador del acelerometro.
    navigator.accelerometer.watchAcceleration(onSuccess, onError, { frequency: 10 });
  },

  detectaAgitacion: function(datosAceleracion) {
    var agitacionX = datosAceleracion.x > 10;
    var agitacionY = datosAceleracion.y > 10;

    if (agitacionX || agitacionY) {
      setTimeout(app.recomienza, 1000);
    }
  },

  recomienza: function() {
    document.location.reload(true);
  },

  registraDireccion: function(datosAceleracion) {
    velocidadX = datosAceleracion.x;
    velocidadY = datosAceleracion.y;
  },

  BolaPerdida: function() {
    bolaY = (alto - bola.body.y - DIAMETRO_BOLA);
	if (bolaY < 1)
	{
		//... Bola perdida ...
		bola.body.y = app.inicioY();
		bola.body.x = app.inicioX();
		bola.body.velocity.setTo(app.VBinicioX(), app.VBinicioY());
		vidas--;
		vidasText.text = 'vidas: ' + vidas;

		if (vidas === 0) { app.gameOver(); }
	}
  },

  gameOver: function() {
		bola.body.velocity.setTo(0, 0);
		introText.text = '¡ Game Over ! \n Nueva partida: Agitar';
		introText.visible = true;
  },
  
};

  //----------------------------------
  //--- Arrancar la aplicacion
  //--- (Bloque principal)
  //----------------------------------

if ('addEventListener' in document ) {
	document.addEventListener('DOMContentLoaded',
		function(){
			appprevia.inicio();
		}, false);
	
};

/*
-------------------------------------------------
Traslado el inicio de juego ... al ...
Clic en pantalla.
------------------------------------------------
if ('addEventListener'in document) {
  document.addEventListener('deviceready', function() {
    app.inicio();
  }, false);
}
*/