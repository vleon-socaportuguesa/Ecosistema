var Lista = function(data){
  /*------------------------------Objeto Slot-------------------*/
  var Slot = function(data){

    this.atributos = data;
    this.estado = 'sinInicializar';
    this.rol = 'lista';
    this.nodo = null;

    this.construirNodo = function(nombre){
      var nodo = document.createElement('section');
      nodo.setAttribute('slot','');
      nodo.id=this.atributos.codigo;
      var html ="";
      var titulo;
      titulo=this.atributos.nombre;
      html+="<article  title>"+titulo+"</article>";
      nodo.innerHTML=html;
      this.nodo = nodo;
      this.estado='enUso';
      this.funcionamiento();
    };

    this.funcionamiento = function(){
      var nodo = this.nodo;
      var article =nodo.getElementsByTagName('article')[0];

      article.onclick=function(e){
        agregarRippleEvent(this.parentNode,e);
      };
    };

    this.reconstruirNodo = function(){
      this.nodo.style.marginLeft="120%";
      var nodo=this.nodo;
      var slot=this;
      var titulo;
      if(this.atributos.nombre.length>28){
        titulo=this.atributos.nombre.substr(0,28)+'...';
      }else{
        titulo=this.atributos.nombre;
      }
      var html="<article  title>"+titulo+"</article>";
      setTimeout(function(){
        nodo.innerHTML=html;
        slot.funcionamiento();
        UI.elementos.formulario.ventanaList.controlLista(nodo);
      },510);
    };

    this.destruirNodo = function(){
      var nodo = this.nodo;
      var slot = this;
      nodo.classList.add('desaparecer');
      setTimeout(function(){
        nodo.classList.add('desaparecerPorCompleto');
      },510);
      setTimeout(function(){
        nodo.parentNode.removeChild(nodo);
        var indice = UI.elementos.formulario.ventanaList.Slots.indexOf(slot);
        UI.elementos.formulario.ventanaList.Slots.splice(indice,1);
      },1110);
    };

    this.activar = function(){
      this.nodo.getElementsByTagName('article')[0].click();
    };
    this.construirNodo();
  };
  /*--------------------------Fin Objeto Slot-------------------*/

  this.Slots = [];
  this.atributos = data;
  this.nodo = null;

  this.construir = function(){
    var contenedor = data.contenedor || 'noPosee';
    var nodo = document.createElement('div');
    nodo.setAttribute('lista','');
    nodo.setAttribute('mat-window','');
    nodo.classList.add(this.atributos.clase);

    //contruir sector busqueda
    var html='';
    html+="<section busqueda>";
    html+=	"<div titulo>"+this.atributos.titulo+"</div>";
    html+=	"<div listBuscar>";
    html+=		"<input type='text' placeHolder='Buscar...'campBusq>";
    html+=		"<button type='button' cerrarBusq></button>";
    html+=	"</div>";
    html+=	"<button type='button' btnBusq></button>";
    html+="</section>";
    nodo.innerHTML = html;
    this.nodo = nodo;

    var botonBusqueda = nodo.getElementsByTagName('button')[1];
    var botonCerrarBusq = nodo.getElementsByTagName('button')[0];
		var lista = this;
    botonBusqueda.onclick = function(){
			lista.abrirCampoBusqueda();
		};
    botonCerrarBusq.onclick = function(){
			lista.cerrarCampoBusqueda();
		};

    //agrego la lista al contenedor
    if(contenedor !== 'noPosee'){
      contenedor.appendChild(this.nodo);
    }

    //carga de elementos ya sea por busqueda a la BD o que sean suministrados en la
    //construccion
    this.manejarCarga();
  /*
    //en caso de que la paginacion este activa
    if(this.atributos.paginacion.uso === 'true'){
      this.manejarPaginacion();
    }
    */
  };

  this.manejarPaginacion = function(){
    console.log('paginacion activa');
  };

  this.manejarCarga = function(){
      var carga = this.atributos.carga;
      //si no posee la info del cuadro de carga toma los valore por defecto
      if(this.atributos.carga.uso === 'true'){
        if(!carga.infoCuadro){
          carga.infoCuadro = {
            mensaje:'Buscando',
            contenedor:this.nodo,
          };
        }else{
          //contenedor obligatorio es el nodo de la lista;
          carga.infoCuadro.contenedor = this.nodo;
          console.log('contenedor sobre escrito a nodo de la lista');
        }
        if(!carga.peticion){
          console.log('no se puede realizar una carga de elementos sin una peticion');
        }else{
          var lista = this;
          torque.manejarOperacion(carga.peticion,carga.infoCuadro,function(respuesta){
            lista.cargarElementos(respuesta.registros);
        });
        cuadroDeCarga.style.marginTop='80px';
      }
    }
    else if(this.atributos.elementos){

      //si lo elementos de la lista fueron suministrados en la creacion
      this.cargarElementos(this.atributos.elementos);
    }else{
      console.log('la lista se encuentra vacia');
    }
  };

  this.abrirCampoBusqueda = function(){
	var botonBusqueda = document.querySelector('button[btnbusq]');
    botonBusqueda.parentNode.classList.add('buscar');
		var lista = this;
    setTimeout(function(){
      botonBusqueda.onclick=lista.buscarElementos;
    },10);
  };

	this.cerrarCampoBusqueda = function(){
		var botonBusqueda = document.querySelector('button[btnbusq]');
	  botonBusqueda.parentNode.classList.remove('buscar');
    botonBusqueda.click();
    this.controlLista();
		var lista = this;
     setTimeout(function(){
       botonBusqueda.onclick=function(){lista.abrirCampoBusqueda();};
     },20);
	};

  this.buscarElementos = function(){
    /*en construccion*/
  };

  this.listarSlots = function(){
    console.log('Slots:');
    for(var x=0;x<this.Slots.length;x++){
      console.log('nombre: '+this.Slots[x].atributos.nombre+'\testado: '+this.Slots[x].estado);
    }
  };

  this.agregarSlot = function(data){
    var slot = new Slot(data);
    this.Slots.push(slot);
    this.nodo.appendChild(slot.nodo);
    return slot.nodo;
  };

  this.cargarElementos = function(registros){
    for(var x=0; x<registros.length;x++){
      this.agregarSlot(registros[x]);
    }
  };

  this.controlLista = function(nodo){
    var obj=false;
    for(var x=0;x<this.Slots.length;x++){
      if(this.Slots[x].nodo==nodo){
        this.Slots[x].estado='seleccionado';
        this.Slots[x].nodo.classList.add('seleccionado');
        obj=this.Slots[x];
      }else{
        this.Slots[x].estado='enUso';
        this.Slots[x].nodo.classList.remove('seleccionado');
      }
    }
  };

  this.buscarSlot = function(registro){
    for(x=0;x<this.Slots.length;x++){
      if(this.Slots[x].atributos.codigo==registro.codigo){
        return this.Slots[x];
      }
    }
    console.log('el slot no existe');
    return false;
  };

  this.buscarSlotPorNombre = function(registro){
    for(x=0;x<this.Slots.length;x++){
      if(this.Slots[x].atributos.nombre==registro.nombre){
        return this.Slots[x];
      }
    }
    console.log('el slot no existe');
    return false;
  };

  this.cambiarTextoSlots = function(cambio){
    if(cambio=='mediaQuery'){
      for(var x=0;x<this.Slots.length;x++){
        var nodo=this.Slots[x].nodo;
        var slot=this.Slots[x];
        var titulo;
        if(slot.atributos.nombre.length>28){
          titulo=slot.atributos.nombre.substr(0,28)+'...';
        }else{
          titulo=slot.atributos.nombre;
        }
        var html="<article  title>"+titulo+"</article>]";
        nodo.innerHTML=html;
        slot.funcionamiento();
      }
    }else{
      for(var i=0;i<this.Slots.length;i++){
        var contenido = "<article  title>"+this.Slots[i].atributos.nombre+"</article>";
        this.Slots[i].nodo.innerHTML = contenido;
        this.Slots[i].funcionamiento();
      }
    }
  };

  this.actualizarLista = function(cambios){
    if(cambios instanceof Array){

    }else{
      this.actualizarSlot(cambios);
    }
  };

  this.actualizarSlot = function(registro){
    var slot=this.buscarSlot(registro);
    if(slot){
      slot.atributos=registro;
      slot.reconstruirNodo();
    }
  };

  this.obtenerSeleccionado = function(){
    var seleccionado=false;
    for(var x=0;x<this.Slots.length;x++){
      if(this.Slots[x].estado=='seleccionado'){
        seleccionado=this.Slots[x];
      }
    }
    return seleccionado;
  };

  this.construir();
};
/*--------------------------Fin Objeto VentanaList-----------------------------------*/
