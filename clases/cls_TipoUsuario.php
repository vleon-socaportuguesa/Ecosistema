 <?php 
include_once('cls_Conexion.php');
class cls_TipoUSuario extends cls_Conexion{
	
	private $aa_Atributos = array();
	private $aa_Campos = array('cod_tip_usu','nom','des');

	public function setPeticion($pa_Peticion){
		$this->aa_Atributos=$pa_Peticion;
	}

	public function getAtributos(){
		return $this->aa_Atributos;
	}

	public function gestionar(){
		switch ($this->aa_Atributos['operacion']) {
			case 'buscar':
				$registros=$this->f_Listar();
				if(count($registros)!=0){
					$success=1;
					$respuesta['registros']=$registros;
				}
				break;

			case 'buscarRegistro':
				$lb_Enc=$this->f_buscar();
				if($lb_Enc){
					$respuesta['registros']=$this->aa_Atributos['registro'];
					$success=1;
				}
				break;
			
			case 'guardar':
				$lb_Hecho=$this->f_Guardar();
				if($lb_Hecho){
					$this->f_Buscar();
					$respuesta['registros'] = $this->aa_Atributos['registro'];
					$respuesta['mensaje'] = 'Insercion realizada con exito';
					$success = 1;
				}else{
					$respuesta['mensaje'] = 'Error al ejecutar la insercion';
					$success = 0;
				}
				break;

			case 'modificar':
				$respuesta = $this->f_Modificar();
				break;
				
			default:
				$respuesta['mensaje'] = 'Operacion "'.strtoupper($this->aa_Atributos['operacion']).'" no existe para esta entidad';
				$success = 0;
				break;
		}
		if(!isset($respuesta['success'])){
			$respuesta['success']=$success;
		}	
		return $respuesta;
	}
	private function f_Listar(){
		$x=0;
		$la_respuesta=array();
		$ls_Sql="SELECT * FROM seguridad.tip_usu ";
		$this->f_Con();
		$lr_tabla=$this->f_Filtro($ls_Sql);
		while($la_registros=$this->f_Arreglo($lr_tabla)){
			$la_respuesta[$x]['codigo']=$la_registros['cod_tip_usu'];
			$la_respuesta[$x]['nombre']=$la_registros['nom'];
			$x++;
		}
		$this->f_Cierra($lr_tabla);
		$this->f_Des();
		return $la_respuesta;
	}

	private function f_Buscar(){
		$lb_Enc=false;
		//Busco El rol
		$ls_Sql="SELECT * FROM seguridad.tip_usu where cod_tip_usu='".$this->aa_Atributos['codigo']."'";
		$this->f_Con();
		$lr_tabla=$this->f_Filtro($ls_Sql);
		if($la_registros=$this->f_Arreglo($lr_tabla)){
			$la_respuesta['codigo']=$la_registros['cod_tip_usu'];
			$la_respuesta['nombre']=$la_registros['nom'];
			$la_respuesta['nom']=$la_registros['nom'];
			$la_respuesta['des']=$la_registros['des'];
			$lb_Enc=true;
		}
		$this->f_Cierra($lr_tabla);
		$this->f_Des();

		if($lb_Enc){
			//guardo en atributo de la clase
			$this->aa_Atributos['registro']=$la_respuesta;
		}

		return $lb_Enc;
	}
	
	private function f_Guardar(){
		//encripto la contraseña
		include_once('cls_acceso.php');
		$lobj_Acceso = new cls_acceso;
		$this->aa_Atributos['clave'] = $lobj_Acceso->encriptarPass($this->aa_Atributos['clave']);

		$lb_Hecho=false;
		$ls_Sql="INSERT INTO seguridad.tip_usu (cod_tip_usu,nom,des) values 
				('".$this->aa_Atributos['codigo']."','".$this->aa_Atributos['nom']."','".$this->aa_Atributos['des']."')";
		$this->f_Con();
		$lb_Hecho=$this->f_Ejecutar($ls_Sql);
		$this->f_Des();
		return $lb_Hecho;
	}

	private function f_Modificar(){
		$lb_Hecho=false;
		$contCampos = 0;
		if(isset($this->aa_Atributos['nombre'])){
			$this->aa_Atributos['nom'] = $this->aa_Atributos['nombre'];
		}
		$ls_Sql="UPDATE seguridad.tip_usu SET ";

		//arma la cadena sql en base a los campos pasados en la peticion
		$ls_Sql.=$this->armarCamposUpdate($this->aa_Campos,$this->aa_Atributos);

		$ls_Sql.="WHERE cod_tip_usu ='".$this->aa_Atributos['codigo']."'";
		$this->f_Con();
		$lb_Hecho=$this->f_Ejecutar($ls_Sql);
		$this->f_Des();


		if($lb_Hecho){
			$this->f_Buscar();
			$respuesta['registro'] = $this->aa_Atributos['registro'];
			$respuesta['success'] = 1;
		}
		return $respuesta;
	}

}
?>