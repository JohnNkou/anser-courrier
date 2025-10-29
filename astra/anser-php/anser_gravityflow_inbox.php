<?php
class Anser_GravityFlow_Inbox{
	private $args;
	private $form_ids;
	public $title;

	public function __construct($args){
		$form_ids = $args['form_ids'] ?? null;

		if(!$form_ids){
			throw new Exception("No form_ids found in arguments", 1);
		}

		$this->form_ids = $form_ids.explode(",", $form_ids);
	}

	public function render(){
	?>
		<div id='my-content' class='shadow-md'>
	<?php
		$this->header();
		$this->tools();
		$this->tables();
		$this->entry_detail();
		$this->modals();
		$this->init_js();
	?>
		</div>
	<?php
	}

	private function header(){
		$title = $this->$title;
	?>
		<header>
			<h1><?php echo $title ?></h1>
			<form class='search_block'>
				<input type="text" name="s">
				<button>Rechercher</button>
			</form>
		</header>
	<?php
	}

	private function tools(){
		$onglets = $this->args['onglets'] ?? null;
		$view_id = $this->args['view_id'] ?? null;
	?>
		<div id='tools'>
	<?php
		if($onglets){
			if($view_id){
				$onglets = explode(",", $onglets);
				foreach ($onglets as $index=> $onglet) {
					$active = $index == 0 ? 'active':'';
					echo "<a index='$index' class='relative $active'>$onglet<span class='count'></span></a>";
				}
			}
			else{
				error_log("ONGLET GIVEN BUT NO VIEW_ID GIVEN");
			}
		}
	?>
		<div class='navigationHelper'>
			<p></p>
		</div>
		</div>
	<?php
	}

	private function table(){
	?>
		<div class='main-table'>
			<table>
				<tbody>
					
				</tbody>
			</table>
			<div class='flex justify-center gap-2 navigation'>
				<button class='hidden previousPage'>&lt;</button>
				<button class="nextPage hidden">&gt;</button>
			</div>
		</div>
	<?php
	}

	private function entry_detail(){
	?>
		<div class='entry-detail hidden'>
			<header>
				<a class='back'><svg fill="#000000" width="16px" height="16px" viewBox="0 0 200 200" data-name="Layer 1" id="Layer_1" xmlns="http://www.w3.org/2000/svg"><title/><path d="M160,89.75H56l53-53a9.67,9.67,0,0,0,0-14,9.67,9.67,0,0,0-14,0l-56,56a30.18,30.18,0,0,0-8.5,18.5c0,1-.5,1.5-.5,2.5a6.34,6.34,0,0,0,.5,3,31.47,31.47,0,0,0,8.5,18.5l56,56a9.9,9.9,0,0,0,14-14l-52.5-53.5H160a10,10,0,0,0,0-20Z"/></svg></a>
				<h3><span class='form_name'></span><span class='entry-id'></span></h3>
			</header>
			<form class="content" novalidate></form>
		</div>
	<?php
	}

	private function modals(){
	?>
		<div class='informationModal hidden'>
			<div class='content'>
				<div class='text'>
					<h3></h3>
				</div>
				<button class="close">Fermer</button>
			</div>
		</div>
		<div id="loader" class='flex hidden'>
			<h1 class='animate-ping text'></h1>
		</div>
		<div id='pdfviewer' class='hidden'>
			<iframe src=""></iframe>
			<button class='close'>Fermer</button>
		</div>
		<div id='uploader' class='hidden flex'>
			<div>
				<h1 class='text'></h1>
				<p class='percent'></p>
				<button class="end btn-info">Annuler</button>
			</div>
		</div>
	<?php
	}

	private function init_js(){
		$args = $this->args;
		$form_ids = json_encode($this->form_ids);
		$filters = json_encode($args['filters']);
		$view_id = $args['view_id'] ?? null;
		$secret = $args['secret'] ?? null;

		?>
		<script>
			var _Page = { view_id:<?php echo $view_id ?>, secret:<?php echo $secret ?> , filters:<?php echo $filters ?>, form_ids:<?php echo $form_ids ?> }
		</script>

		<?php
	}
}
?>