//TODO: funcionamiento nuevo y modificar para este formulario
function construirUI(){
  UI.elementos.botonera.buscarBoton('nuevo').nodo.onclick = function(){
    nuevoRol();
  };
  var lista =  UI.agregarLista({
    titulo: 'rol',
    clases: ['maestro'],
    campo_nombre: 'nombre',
    carga: {
      uso:true,
      peticion:{
         modulo: "seguridad",
         entidad: "rol",
         operacion: "buscar"
      },
      espera:{
        cuadro:{
          nombre: 'carga roles',
          mensaje: 'Cargando Registros'
        }
      }
    },
    paginacion: {
      uso:false
    },
    onclickSlot: editarRol
  },document.querySelector('div[contenedor]'));
}
function construirFormulario(tipo,slot){
  var sect;
  if(tipo === 'modificar'){
    sect = [
      {
        nombre:'formulario',
        tipo: tipo,
        formulario:UI.buscarConstructor('rol'),
        registro : slot.atributos
      },{
        nombre:'empresas',
        html: 'aqui van las empresas'
      }
    ];
  }else if(tipo === 'nuevo'){
    sect = [
      {
        nombre:'formulario',
        tipo: tipo,
        formulario:UI.buscarConstructor('rol')
      },{
        nombre:'empresas'
      }
    ];
  }
  var ventForm = UI.agregarVentana({
    nombre:'Formulario',
    tipo: 'formulario',
    clases: ['maestro','aparecer'],
    titulo: {
      tipo:'basico',
      html:tipo.toUpperCase()
    },
    sectores:sect
  },document.querySelector('div[contenedor]'));
}
/************************** Editar ********************************************/
var editarRol = function(slot){
  if(UI.buscarVentana('Formulario')){
    var formulario = UI.buscarVentana('Formulario').buscarSector('formulario').formulario;
    UI.buscarVentana('Formulario').titulo.nodo.innerHTML = 'MODIFICAR';
    formulario.deshabilitar();
    formulario.asignarValores(slot.atributos);
    formulario.registroId = slot.atributos.codigo;
    agregarEmpresas(formulario.registroId);
  }else{
    construirFormulario('modificar',slot);
    agregarEmpresas(slot.atributos.codigo);
  }
};
/************************** Nuevo *********************************************/
function nuevoRol(){
  if(UI.buscarVentana('Formulario')){
    var formulario = UI.buscarVentana('Formulario').buscarSector('formulario').formulario;
    formulario.limpiar();
    formulario.habilitar();
    UI.buscarVentana('Formulario').titulo.nodo.innerHTML = 'NUEVO';
    UI.buscarVentana('Formulario').buscarSector('empresas').nodo.innerHTML = "";
  }else{
    construirFormulario('nuevo');
  }
}
/************************** Empresas ******************************************/
function agregarEmpresas(codigo){
  var peticion = {
    entidad : 'rol',
    modulo: 'seguridad',
    operacion: 'buscarDetalle',
    codigo: codigo
  };
  var cuadro = {
    contenedor: UI.buscarVentana('Formulario').buscarSector('empresas').nodo,
    cuadro:{
      nombre: 'Cargado Detalle',
      mensaje: 'Cargando Detalle'
    }
  };
  torque.manejarOperacion(peticion,cuadro,function(respuesta){
    var empresas = respuesta.registros;
    var html = '<div>Empresas</div><section contenedor id="contenedorPri"><article add="empresa"></article>';
    for (var i = 0; i < empresas.length; i++) {
      html+="<article rol='"+empresas[i].codigo_rol+
            "' empresa='"+empresas[i].codigo+
            "' codigo='"+empresas[i].codigoRelacion+"'>"+
            empresas[i].nombre+"</article>";
    }
    html += '</section>';
    var sector = UI.buscarVentana('Formulario').buscarSector('empresas').nodo;
    sector.innerHTML = html;
    activarEmpresas();
  });
}
function activarEmpresas(){
  var contenedor = document.getElementById('contenedorPri');
  var empresas = contenedor.querySelectorAll('article');
  empresas[0].onclick = asignarEmpresa;
  for (var i = 1; i < empresas.length; i++) {
    empresas[i].onclick = abrirEdicionAsignacion;
  }
}
function asignarEmpresa(){
  var cons = {
    altura:220,
    campos: [
      {
        tipo: 'comboBox',
        parametros : {
          nombre:'empresa',
          titulo:'Empresa',
          eslabon : 'area',
          peticion : {
    			   modulo: "seguridad",
    			   entidad: "rol",
    			   operacion: "buscarDisponible",
             codigo: UI.buscarVentana('rol').obtenerSeleccionado().atributos.codigo
    			}
        }
      }
    ]
  };
  var ventanaAsignar = UI.crearVentanaModal({
    cabecera: {
      html: 'Asignar Empresa'
    },
    cuerpo: {
      tipo: 'asignacion',
      formulario: cons
    },
    pie:{
        html: '<section modalButtons>'+
              '<button type="button" class="icon icon-guardar-indigo-32"> </button>'+
              '<button type="button" class="icon icon-cerrar-rojo-32"> </button>'+
            '</section>'
      }
  });
  ventanaAsignar.partes.pie.nodo.querySelector('button.icon-cerrar-rojo-32').onclick = function(){UI.elementos.modalWindow.eliminarUltimaCapa();};
  var btnGuardar = ventanaAsignar.partes.pie.nodo.querySelector('button.icon-guardar-indigo-32');
  btnGuardar.onclick = function(){
    if(ventanaAsignar.partes.cuerpo.formulario.buscarCampo('empresa').captarValor()){
      var empresa = ventanaAsignar.partes.cuerpo.formulario.buscarCampo('empresa').captarValor();
      var peticion = {
         modulo: "seguridad",
         entidad: "rol",
         operacion: "guardarDetalle",
         codigo: UI.buscarVentana('rol').obtenerSeleccionado().atributos.codigo,
         codigo_empresa: empresa
      };
      var cuadro = {
        contenedor: ventanaAsignar.partes.cuerpo.nodo,
        cuadro: {
          nombre: 'guardarDetalle',
          mensaje: 'Guardando Cambios'
        }
      };
      torque.manejarOperacion(peticion,cuadro,function(){
        UI.elementos.modalWindow.eliminarUltimaCapa();
        agregarEmpresas(UI.buscarVentana('rol').obtenerSeleccionado().atributos.codigo);
      });
    }else{
      UI.agregarToasts({
        texto: 'Elija una empresa antes de continuar',
        tipo: 'web-arriba-derecha-alto'
      });
    }
  };
}
function abrirEdicionAsignacion(){
  var nodo = this;
  var ventanaOperaciones = UI.crearVentanaModal({
    cabecera: {
      html: nodo.textContent
    },
    cuerpo: {
      html: 'Se puede Modificar los privilegios sobre '+nodo.textContent+' O eliminar dicha relacion'
    },
    pie:{
        html: '<section modalButtons>'+
              '<button type="button" class="icon icon-eliminar-rojo"> </button>'+
              '<button type="button" class="icon icon-modificar-verde"> </button>'+
              '<button type="button" class="icon icon-cerrar-rojo-32"> </button>'+
            '</section>'
      }
  });
  var btnModificar = ventanaOperaciones.nodo.querySelector('button.icon-modificar-verde');
  btnModificar.onclick = function(){
    location.href = 'vis_AsignarPrivilegios.html?ruta='+nodo.getAttribute('codigo');
  };
}
